'use client'

import { useState } from 'react'
import { announcements } from '@/lib/portal-data'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AccessibleButton } from '@/components/ui/AccessibleButton'

const departments = [
  { id: 'admin', label: 'اداری' },
  { id: 'it', label: 'فناوری اطلاعات' },
  { id: 'edu', label: 'آموزش' },
  { id: 'research', label: 'پژوهش' },
]

export function DeptAnnouncementsWidget() {
  const [activeTab, setActiveTab] = useState('admin')

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-brand" aria-hidden />
          <h2 className="text-heading-1 text-foreground">اطلاعیه‌های واحدها</h2>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-3 w-full justify-start gap-1 bg-muted p-1">
          {departments.map((dept) => (
            <TabsTrigger
              key={dept.id}
              value={dept.id}
              className="text-xs data-[state=active]:bg-brand data-[state=active]:text-white"
            >
              {dept.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {departments.map((dept) => (
          <TabsContent key={dept.id} value={dept.id}>
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
