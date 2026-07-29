import type { LucideIcon } from 'lucide-react'

export interface WidgetSize {
  cols: number
  rows: number
}

export interface WidgetResizable {
  minCols?: number
  maxCols?: number
  minRows?: number
  maxRows?: number
}

export interface WidgetManifest {
  id: string
  name: string
  category: string
  description?: string
  defaultSize: WidgetSize
  resizable?: boolean | WidgetResizable
  draggable?: boolean
  ssr?: boolean
  permissions?: string[]
  icon?: LucideIcon
  configSchema?: Record<string, unknown>
}

export interface WidgetInstance {
  id: string
  widgetId: string
  config?: Record<string, unknown>
  gridPosition?: {
    x: number
    y: number
    w: number
    h: number
  }
}

export interface WidgetProps {
  instance: WidgetInstance
  config?: Record<string, unknown>
}

export type WidgetComponent = React.ComponentType<WidgetProps>
