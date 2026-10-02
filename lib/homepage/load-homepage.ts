import type { WidgetInstance } from '@/components/widgets/types'
import { fetchPublicApi } from '@/lib/server/fetch-api'
import { DEFAULT_HOMEPAGE_WIDGETS, HOMEPAGE_PAGE_KEY } from '@/lib/constants/homepage-widgets'

type PageLayoutResponse = {
  instances?: Array<{
    instanceId: string
    widgetKey: string
    config?: Record<string, unknown>
    gridPosition?: WidgetInstance['gridPosition']
  }>
}

export type WidgetRenderEnvelope = {
  instanceId: string
  widgetKey: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  ssr: boolean
  errors: string[]
}

function layoutToInstances(layout: PageLayoutResponse | null): WidgetInstance[] | null {
  if (!layout?.instances?.length) return null
  return layout.instances.map((entry) => ({
    id: entry.instanceId,
    widgetId: entry.widgetKey,
    config: entry.config ?? {},
    gridPosition: entry.gridPosition,
  }))
}

export function mergeWidgetRenderData(
  instances: WidgetInstance[],
  envelopes: WidgetRenderEnvelope[] | null
): WidgetInstance[] {
  if (!envelopes?.length) return instances

  const dataByInstance = new Map(envelopes.map((entry) => [entry.instanceId, entry.data]))

  return instances.map((instance) => ({
    ...instance,
    config: {
      ...instance.config,
      ...(dataByInstance.get(instance.id) ?? {}),
    },
  }))
}

export async function loadHomepageWidgets(): Promise<WidgetInstance[]> {
  const [layout, renderData] = await Promise.all([
    fetchPublicApi<PageLayoutResponse>(`/widget-engine/pages/${HOMEPAGE_PAGE_KEY}`, {
      revalidate: 60,
      fallbackOnError: true,
    }),
    fetchPublicApi<WidgetRenderEnvelope[]>(
      `/widget-engine/pages/${HOMEPAGE_PAGE_KEY}/render-data`,
      { revalidate: 60, fallbackOnError: true }
    ),
  ])

  const base = layoutToInstances(layout) ?? DEFAULT_HOMEPAGE_WIDGETS
  return mergeWidgetRenderData(base, renderData)
}
