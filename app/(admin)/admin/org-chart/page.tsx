'use client'

import { Container } from '@/components/layout/container'
import { Section } from '@/components/layout/section'
import { Plus, ChevronDown, Users } from 'lucide-react'

interface OrgNode {
  id: string
  name: string
  manager: string
  memberCount: number
  children?: OrgNode[]
}

const orgTree: OrgNode = {
  id: 'root',
  name: 'صدا و سیمای آذربایجان شرقی',
  manager: 'مدیرکل',
  memberCount: 500,
  children: [
    {
      id: 'deputy-1',
      name: 'معاونت فناوری اطلاعات',
      manager: 'معاون IT',
      memberCount: 25,
      children: [
        { id: 'unit-1-1', name: 'واحد شبکه', manager: 'سرپرست شبکه', memberCount: 8 },
        { id: 'unit-1-2', name: 'واحد توسعه نرم‌افزار', manager: 'سرپرست توسعه', memberCount: 10 },
        { id: 'unit-1-3', name: 'واحد پشتیبانی', manager: 'سرپرست پشتیبانی', memberCount: 7 },
      ],
    },
    {
      id: 'deputy-2',
      name: 'معاونت تولید',
      manager: 'معاون تولید',
      memberCount: 120,
      children: [
        { id: 'unit-2-1', name: 'گروه برنامه‌سازی', manager: 'سرپرست گروه', memberCount: 40 },
        { id: 'unit-2-2', name: 'گروه فنی', manager: 'سرپرست گروه', memberCount: 30 },
      ],
    },
    {
      id: 'deputy-3',
      name: 'معاونت اداری و مالی',
      manager: 'معاون اداری',
      memberCount: 45,
      children: [
        { id: 'unit-3-1', name: 'واحد حسابداری', manager: 'سرپرست حسابداری', memberCount: 12 },
        { id: 'unit-3-2', name: 'واحد رفاه', manager: 'سرپرست رفاه', memberCount: 8 },
      ],
    },
    {
      id: 'deputy-4',
      name: 'معاونت پژوهش',
      manager: 'معاون پژوهش',
      memberCount: 30,
    },
    {
      id: 'deputy-5',
      name: 'روابط عمومی',
      manager: 'رئیس روابط عمومی',
      memberCount: 15,
    },
  ],
}

function OrgNodeComponent({ node, level = 0 }: { node: OrgNode; level?: number }) {
  const hasChildren = node.children && node.children.length > 0

  return (
    <div className="flex flex-col items-center">
      <div
        className={`rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-brand/40 ${
          level === 0 ? 'min-w-[280px]' : 'min-w-[220px]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-brand">
            <Users className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">{node.name}</p>
            <p className="text-xs text-muted-foreground">{node.manager}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{node.memberCount} نفر</span>
          {hasChildren && (
            <span className="flex items-center gap-1">
              {node.children!.length} واحد
              <ChevronDown className="size-3" aria-hidden />
            </span>
          )}
        </div>
      </div>

      {hasChildren && (
        <>
          <div className="h-6 w-px bg-border" />
          <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:gap-0">
            {node.children!.map((child, i) => (
              <div key={child.id} className="flex flex-col items-center">
                {i > 0 && <div className="hidden h-px w-8 bg-border lg:block" />}
                <OrgNodeComponent node={child} level={level + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function OrgChartPage() {
  return (
    <div className="min-h-screen bg-background">
      <Section>
        <Container>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-display-lg text-foreground">نمودار سازمانی</h1>
              <p className="mt-1 text-body-md text-muted-foreground">مدیریت درختی ساختار سازمان</p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover"
            >
              <Plus className="size-4" aria-hidden />
              افزودن واحد
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="flex justify-center">
              <OrgNodeComponent node={orgTree} />
            </div>
          </div>
        </Container>
      </Section>
    </div>
  )
}
