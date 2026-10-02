'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { announcements } from '@/lib/portal-data'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AccessibleButton } from '@/components/ui/AccessibleButton'
import type { WidgetProps } from './types'

const departmentIds = ['admin', 'it', 'edu', 'research'] as const

export function DeptAnnouncementsWidget({ instance: _instance, config: _config }: WidgetProps) {
  const t = useTranslations('widgets.deptAnnouncements')
  const [activeTab, setActiveTab] = useState('admin')

  return (
    <div className="surface-panel p-4">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-brand" aria-hidden />
          <h2 className="text-heading-1 text-foreground">{t('title')}</h2>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-3 w-full justify-start gap-1 overflow-x-auto bg-muted p-1">
          {departmentIds.map((id) => (
            <TabsTrigger
              key={id}
              value={id}
              className="min-h-9 whitespace-nowrap text-xs data-[state=active]:bg-brand data-[state=active]:text-white"
            >
              {t(`departments.${id}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        {departmentIds.map((id) => (
          <TabsContent key={id} value={id}>
            <ul>
              {announcements.slice(0, 4).map((item) => (
                <li key={item.id}>
                  <AccessibleButton
                    href={`/news/${item.id}`}
                    className="group flex items-start gap-2.5 border-b border-border py-3 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-sm font-medium leading-relaxed text-foreground transition-colors group-hover:text-brand">
                        {item.title}
                      </h3>
                      <span className="text-xs text-muted-foreground">{item.time}</span>
                    </div>
                  </AccessibleButton>
                </li>
              ))}
            </ul>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
