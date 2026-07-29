export type LayoutConfigEntry = {
  instanceId: string
  widgetKey: string
  config?: Record<string, unknown>
  grid?: { x: number; y: number; w: number; h: number }
}

export type ResolvedWidgetInstance = {
  instanceId: string
  widgetKey: string
  config: Record<string, unknown>
  gridPosition?: { x: number; y: number; w: number; h: number }
}

export type WidgetDataEnvelope = {
  instanceId: string
  widgetKey: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  ssr: boolean
  errors: string[]
}
