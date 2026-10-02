import { Injectable, Inject, Optional } from '@nestjs/common'
import { ContentType, Prisma } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { SearchQueryDto } from './search.dto'
import { Client as OpenSearchClient } from '@opensearch-project/opensearch'

export interface SearchRow {
  id: string
  slug: string
  contentType: ContentType
  title: Prisma.JsonValue
  excerpt: Prisma.JsonValue | null
  publishedAt: Date | null
  rank: number
}

@Injectable()
export class SearchService {
  private openSearchClient: OpenSearchClient | null = null
  private readonly OPENSEARCH_INDEX = 'content-items'

  constructor(
    private readonly prisma: PrismaService,
    @Optional() @Inject('OPENSEARCH_CLIENT') openSearchClient?: OpenSearchClient
  ) {
    this.openSearchClient = openSearchClient || null
  }

  async searchContent(query: { query: string; page?: number; limit?: number; type?: ContentType }) {
    const page = query.page ?? 1
    const limit = query.limit ?? 20
    const result = await this.search({ q: query.query, limit, type: query.type })
    const items = result.results.slice((page - 1) * limit, page * limit)
    return {
      items,
      pagination: { page, limit, total: items.length, totalPages: Math.ceil(items.length / limit) },
    }
  }

  async searchUsers(query: { query: string; page?: number; limit?: number }) {
    const page = query.page ?? 1
    const limit = query.limit ?? 20
    const items = await this.prisma.user.findMany({
      where: { name: { contains: query.query } },
      skip: (page - 1) * limit,
      take: limit,
    })
    return {
      items,
      pagination: { page, limit, total: items.length, totalPages: Math.ceil(items.length / limit) },
    }
  }

  async search(query: SearchQueryDto) {
    // Use OpenSearch if available, otherwise fallback to PostgreSQL
    if (this.openSearchClient) {
      return this.searchOpenSearch(query)
    }
    return this.searchPostgreSQL(query)
  }

  private async searchOpenSearch(query: SearchQueryDto) {
    try {
      const searchBody: any = {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: query.q,
                  fields: [
                    'title.fa^3',
                    'title.en^3',
                    'excerpt.fa^2',
                    'excerpt.en^2',
                    'body.fa',
                    'body.en',
                  ],
                  type: 'best_fields',
                  fuzziness: 'AUTO',
                },
              },
              { term: { status: 'PUBLISHED' } },
            ],
          },
        },
        highlight: {
          fields: {
            'title.fa': {},
            'title.en': {},
            'excerpt.fa': {},
            'excerpt.en': {},
            'body.fa': {},
            'body.en': {},
          },
          fragment_size: 150,
          number_of_fragments: 3,
        },
        sort: [{ publishedAt: { order: 'desc' } }, '_score'],
        size: query.limit || 20,
      }

      if (query.type) {
        searchBody.query.bool.must.push({ term: { contentType: query.type } })
      }

      if (!this.openSearchClient) {
        console.warn('OpenSearch client not available, falling back to PostgreSQL')
        return this.searchPostgreSQL(query)
      }

      const response = await this.openSearchClient.search({
        index: this.OPENSEARCH_INDEX,
        body: searchBody,
      })

      const results = response.body.hits.hits.map((hit: any) => ({
        id: hit._id,
        slug: hit._source.slug,
        contentType: hit._source.contentType,
        title: hit._source.title,
        excerpt: hit._source.excerpt,
        publishedAt: hit._source.publishedAt,
        rank: hit._score,
        highlights: hit.highlight || null,
      }))

      return { results, total: response.body.hits.total.value }
    } catch (error) {
      console.error('OpenSearch search error, falling back to PostgreSQL:', error)
      return this.searchPostgreSQL(query)
    }
  }

  private async searchPostgreSQL(query: SearchQueryDto) {
    const term = `%${this.escapeLike(query.q.trim())}%`
    const type = query.type ?? null
    const rows = await this.prisma.$queryRaw<SearchRow[]>(Prisma.sql`
      SELECT
        c."id",
        c."slug",
        c."contentType",
        c."title",
        c."excerpt",
        c."publishedAt",
        CASE
          WHEN COALESCE(c."title"->>'fa', '') ILIKE ${term} ESCAPE '\\' THEN 3
          WHEN COALESCE(c."excerpt"->>'fa', '') ILIKE ${term} ESCAPE '\\' THEN 2
          ELSE 1
        END AS "rank"
      FROM "Content" c
      WHERE c."status" = 'PUBLISHED'::"ContentStatus"
        AND c."deletedAt" IS NULL
        AND (${type}::"ContentType" IS NULL OR c."contentType" = ${type}::"ContentType")
        AND (
          COALESCE(c."title"->>'fa', '') ILIKE ${term} ESCAPE '\\'
          OR COALESCE(c."excerpt"->>'fa', '') ILIKE ${term} ESCAPE '\\'
          OR COALESCE(c."body"->>'value', '') ILIKE ${term} ESCAPE '\\'
        )
      ORDER BY "rank" DESC, c."publishedAt" DESC NULLS LAST
      LIMIT ${query.limit}
    `)

    return { results: rows, total: rows.length }
  }

  async indexContent(contentId: string) {
    if (!this.openSearchClient) return

    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
    })

    if (!content) return

    await this.openSearchClient.index({
      index: this.OPENSEARCH_INDEX,
      id: content.id,
      body: {
        id: content.id,
        slug: content.slug,
        contentType: content.contentType,
        title: content.title,
        excerpt: content.excerpt,
        body: content.body,
        status: content.status,
        publishedAt: content.publishedAt,
        createdAt: content.createdAt,
      },
    })
  }

  async updateIndex(contentId: string) {
    if (!this.openSearchClient) return

    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
    })

    if (!content) return

    await this.openSearchClient.index({
      index: this.OPENSEARCH_INDEX,
      id: content.id,
      body: {
        id: content.id,
        slug: content.slug,
        contentType: content.contentType,
        title: content.title,
        excerpt: content.excerpt,
        body: content.body,
        status: content.status,
        publishedAt: content.publishedAt,
        createdAt: content.createdAt,
      },
    })
  }

  async deleteFromIndex(contentId: string) {
    if (!this.openSearchClient) return

    await this.openSearchClient.delete({
      index: this.OPENSEARCH_INDEX,
      id: contentId,
    })
  }

  async reindexAll() {
    if (!this.openSearchClient) {
      return { success: false, message: 'OpenSearch client not available' }
    }

    try {
      // Delete existing index
      try {
        await this.openSearchClient.indices.delete({
          index: this.OPENSEARCH_INDEX,
        })
      } catch {
        // Index might not exist, continue
      }

      // Create index with proper mapping
      await this.openSearchClient.indices.create({
        index: this.OPENSEARCH_INDEX,
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              slug: { type: 'keyword' },
              contentType: { type: 'keyword' },
              title: {
                properties: {
                  fa: { type: 'text', analyzer: 'standard' },
                  en: { type: 'text', analyzer: 'standard' },
                },
              },
              excerpt: {
                properties: {
                  fa: { type: 'text', analyzer: 'standard' },
                  en: { type: 'text', analyzer: 'standard' },
                },
              },
              body: {
                properties: {
                  fa: { type: 'text', analyzer: 'standard' },
                  en: { type: 'text', analyzer: 'standard' },
                },
              },
              status: { type: 'keyword' },
              publishedAt: { type: 'date' },
              createdAt: { type: 'date' },
            },
          },
        },
      })

      // Fetch all published content
      const contents = await this.prisma.content.findMany({
        where: {
          status: 'PUBLISHED',
          deletedAt: null,
        },
        select: {
          id: true,
          slug: true,
          contentType: true,
          title: true,
          excerpt: true,
          body: true,
          status: true,
          publishedAt: true,
          createdAt: true,
        },
      })

      // Bulk index
      const bulkBody = contents.flatMap((content) => [
        { index: { _index: this.OPENSEARCH_INDEX, _id: content.id } },
        {
          id: content.id,
          slug: content.slug,
          contentType: content.contentType,
          title: content.title,
          excerpt: content.excerpt,
          body: content.body,
          status: content.status,
          publishedAt: content.publishedAt,
          createdAt: content.createdAt,
        },
      ])

      if (bulkBody.length > 0) {
        await this.openSearchClient.bulk({
          body: bulkBody,
        })
      }

      return {
        success: true,
        message: `Successfully indexed ${contents.length} content items`,
        count: contents.length,
      }
    } catch (error) {
      console.error('Reindex error:', error)
      return {
        success: false,
        message: `Reindex failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  private escapeLike(value: string) {
    return value.replace(/[\\%_]/g, (character) => `\\${character}`)
  }
}
