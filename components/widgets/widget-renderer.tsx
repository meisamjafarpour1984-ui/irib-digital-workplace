'use client'

import { Suspense } from 'react'
import { widgetRegistry } from './widget-registry'
import { WidgetSkeleton } from './widget-skeleton'
import type { WidgetInstance } from './types'

interface WidgetRendererProps {
  instances: WidgetInstance[]
  className?: string
}

export function WidgetRenderer({ instances, className }: WidgetRendererProps) {
  return (
    <div className={className}>
      {instances.map((instance) => {
        const entry = widgetRegistry.get(instance.widgetId)
        if (!entry) {
          console.warn(`Widget "${instance.widgetId}" not found in registry`)
          return null
        }

        const { Component, manifest } = entry
        const sizeClasses = getGridClasses(manifest.defaultSize.cols)

        return (
          <div key={instance.id} className={sizeClasses}>
            <Suspense fallback={<WidgetSkeleton widgetId={instance.widgetId} />}>
              <Component instance={instance} config={instance.config} />
            </Suspense>
          </div>
        )
      })}
    </div>
  )
}

function getGridClasses(cols: number): string {
  const colMap: Record<number, string> = {
    3: 'col-span-1 sm:col-span-1 lg:col-span-3',
    4: 'col-span-1 sm:col-span-2 lg:col-span-4',
    6: 'col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-6',
    8: 'col-span-1 sm:col-span-4 lg:col-span-8',
    10: 'col-span-1 sm:col-span-4 lg:col-span-6 xl:col-span-10',
    12: 'col-span-full',
  }
  return colMap[cols] || 'col-span-full'
}
