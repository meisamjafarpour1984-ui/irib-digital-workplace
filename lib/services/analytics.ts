import { apiClient } from '@/lib/api-client'

export interface DashboardKpiResponse {
  activeUsers: number
  publishedContent: number
  openTickets: number
}

export interface ContentStatsResponse {
  published: number
  views: number
  period: string
}

export const analyticsApi = {
  getKpis: () => apiClient.get<DashboardKpiResponse>('/analytics/kpi'),
  getContentStats: (period?: 'day' | 'week' | 'month') =>
    apiClient.get<ContentStatsResponse>('/analytics/content-stats', {
      params: period ? { period } : undefined,
    }),
}
