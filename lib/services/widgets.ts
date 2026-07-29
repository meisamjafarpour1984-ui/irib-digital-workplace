import { apiClient } from '@/lib/api-client'

export type WidgetRenderEnvelope = {
  instanceId: string
  widgetKey: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  ssr: boolean
  errors: string[]
}

export type PageLayoutResponse = {
  pageKey: string
  instances: Array<{
    instanceId: string
    widgetKey: string
    config?: Record<string, unknown>
    gridPosition?: { x: number; y: number; w: number; h: number }
  }>
}

export const widgetApi = {
  getPageLayout: (pageKey: string) =>
    apiClient.get<PageLayoutResponse>(`/widget-engine/pages/${pageKey}`),
  getRenderData: (pageKey: string) =>
    apiClient.get<WidgetRenderEnvelope[]>(`/widget-engine/pages/${pageKey}/render-data`),
  getRegistry: () => apiClient.get<unknown[]>('/widget-engine/registry'),
  getThemeTokens: () => apiClient.get<unknown[]>('/widget-engine/theme/tokens'),
}
