import type { LucideIcon } from 'lucide-react'
import { z } from 'zod'

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
  configSchema?: z.ZodSchema<Record<string, unknown>>
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

// Common widget config schemas
export const imageConfigSchema = z.object({
  images: z.array(
    z.object({
      url: z.string().url(),
      title: z.object({
        fa: z.string(),
        en: z.string().optional(),
      }),
      description: z
        .object({
          fa: z.string().optional(),
          en: z.string().optional(),
        })
        .optional(),
    })
  ),
})

export const serviceCardConfigSchema = z.object({
  services: z.array(
    z.object({
      id: z.string(),
      title: z.object({
        fa: z.string(),
        en: z.string().optional(),
      }),
      description: z
        .object({
          fa: z.string().optional(),
          en: z.string().optional(),
        })
        .optional(),
      icon: z.string(),
      href: z.string().url(),
      color: z.string().optional(),
    })
  ),
})

export const newsConfigSchema = z.object({
  limit: z.number().min(1).max(50).default(10),
  showThumbnail: z.boolean().default(true),
  showDate: z.boolean().default(true),
  showCategory: z.boolean().default(false),
})

export const weatherConfigSchema = z.object({
  city: z.string().default('Tabriz'),
  unit: z.enum(['celsius', 'fahrenheit']).default('celsius'),
  showForecast: z.boolean().default(true),
})

export const calendarConfigSchema = z.object({
  showPrayerTimes: z.boolean().default(true),
  showEvents: z.boolean().default(true),
  defaultView: z.enum(['month', 'week', 'day']).default('month'),
})
