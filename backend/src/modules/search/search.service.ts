import { Injectable } from '@nestjs/common'
import { ContentType, Prisma } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { SearchQueryDto } from './search.dto'

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
  constructor(private readonly prisma: PrismaService) {}

  async search(query: SearchQueryDto) {
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

  private escapeLike(value: string) {
    return value.replace(/[\\%_]/g, (character) => `\\${character}`)
  }
}
