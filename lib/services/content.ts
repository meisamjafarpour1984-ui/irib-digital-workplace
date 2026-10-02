import { apiClient } from '@/lib/api-client'

export type ContentType =
  | 'NEWS'
  | 'ANNOUNCEMENT'
  | 'EVENT'
  | 'GALLERY'
  | 'BANNER'
  | 'FILE'
  | 'SOFTWARE'
  | 'EXPERT'
  | 'LEGEND'
  | 'FORM'
  | 'AFISH'
  | 'DOCUMENT'
  | 'SURVEY'
  | 'FAQ'
  | 'LINK'

interface LocalizedText {
  fa?: string
  en?: string
}

interface HtmlBody {
  format?: string
  value?: string
}

export interface ContentRecord {
  id: string
  contentType: ContentType
  status: string
  version: number
  title: LocalizedText | string
  slug: string
  excerpt: LocalizedText | string | null
  body: HtmlBody | string | null
  metadata: Record<string, unknown>
  publishedAt: string | null
  createdAt: string
  author: { id: string; name: LocalizedText | string }
  publisher?: { id: string; name: LocalizedText | string } | null
  tags: Array<{ tag: { id: string; name: string; slug: string } }>
}

export interface ContentDraftInput {
  contentType: ContentType
  title: string
  excerpt?: string
  body?: string
  tagNames?: string[]
  scopeIds?: string[]
}

export type ContentUpdateInput = Partial<ContentDraftInput> & { expectedVersion: number }

export interface DepartmentOption {
  id: string
  name: LocalizedText | string
}

export const localizedText = (value: LocalizedText | string | null | undefined) =>
  typeof value === 'string' ? value : (value?.fa ?? value?.en ?? '')

export const contentHtml = (value: HtmlBody | string | null | undefined) =>
  typeof value === 'string' ? value : (value?.value ?? '')

export const contentApi = {
  create: (input: ContentDraftInput) => apiClient.post<ContentRecord>('/contents', input),
  update: (id: string, input: ContentUpdateInput) =>
    apiClient.put<ContentRecord>(`/contents/${id}`, input),
  publish: (id: string) => apiClient.post<ContentRecord>(`/contents/${id}/publish`),
  archive: (id: string) => apiClient.post<ContentRecord>(`/contents/${id}/archive`),
  remove: (id: string) => apiClient.delete<ContentRecord>(`/contents/${id}`),
  listDepartments: () => apiClient.get<DepartmentOption[]>('/contents/options/departments'),
  findPublished: (slug: string) => apiClient.get<ContentRecord>(`/contents/public/${slug}`),
  listFeed: (params?: { type?: ContentType; limit?: number; page?: number }) =>
    apiClient.get<{
      items: ContentRecord[]
      pagination: { page: number; limit: number; total: number }
    }>('/contents/feed', { params }),
  list: (params?: { type?: string; status?: string; limit?: number; page?: number }) =>
    apiClient.get<{
      items: ContentRecord[]
      pagination: { page: number; limit: number; total: number; totalPages: number }
    }>('/contents', { params }),
  findOne: (id: string) => apiClient.get<ContentRecord>(`/contents/${id}`),
  submitForReview: (id: string) =>
    apiClient.post<ContentRecord>(`/contents/${id}/submit-review`, undefined, {
      suppress404Error: true,
    }),
  approve: (id: string) =>
    apiClient.post<ContentRecord>(`/contents/${id}/approve`, undefined, { suppress404Error: true }),
  reject: (id: string) =>
    apiClient.post<ContentRecord>(`/contents/${id}/reject`, undefined, { suppress404Error: true }),
  schedule: (id: string, scheduledAt: Date) =>
    apiClient.post<ContentRecord>(
      `/contents/${id}/schedule`,
      { scheduledAt: scheduledAt.toISOString() },
      { suppress404Error: true }
    ),
  unschedule: (id: string) =>
    apiClient.post<ContentRecord>(`/contents/${id}/unschedule`, undefined, {
      suppress404Error: true,
    }),
}

export class ContentService {
  getContent(slug: string) {
    return contentApi.findPublished(slug)
  }

  createContent(input: Partial<ContentDraftInput> & { slug?: string }) {
    return contentApi.create(input as ContentDraftInput)
  }

  updateContent(id: string, input: Partial<ContentDraftInput>) {
    return contentApi.update(id, { ...input, expectedVersion: 1 })
  }

  async deleteContent(id: string): Promise<void> {
    await contentApi.remove(id)
  }
}
