'use client'

import { Container } from '@/components/layout/container'
import { Section } from '@/components/layout/section'
import { Plus, ChevronDown, Users, Loader2 } from 'lucide-react'
import { useOrganization } from '@/hooks/use-organization'

// Force dynamic rendering to avoid SSR hydration issues
export const dynamic = 'force-dynamic'

interface OrgNode {
  id: string
  name: string | { fa?: string; en?: string }
  manager?: string
  memberCount?: number
  members?: unknown[]
  children?: OrgNode[]
}

function OrgNodeComponent({ node, level = 0 }: { node: OrgNode; level?: number }) {
  const hasChildren = node.children && node.children.length > 0
  const name =
    typeof node.name === 'string' ? node.name : node.name?.fa || node.name?.en || 'نام واحد'
  const managerName = node.manager || 'بدون مدیر'
  const memberCount = node.memberCount || node.members?.length || 0

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
            <p className="truncate text-sm font-bold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{managerName}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{memberCount} نفر</span>
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
            {node.children!.map((child: OrgNode, i: number) => (
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
  const { tree, stats, loading, error } = useOrganization()

  if (loading && tree.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Section>
        <Container>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-display-lg text-foreground">نمودار سازمانی</h1>
              <p className="mt-1 text-body-md text-muted-foreground">
                {stats?.totalUnits || 0} واحد سازمانی ({stats?.totalMembers || 0} عضو)
              </p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover"
            >
              <Plus className="size-4" aria-hidden />
              افزودن واحد
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-error/10 border border-error/20 p-3 text-sm text-error">
              {error}
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-border bg-card p-8 shadow-sm">
            {loading ? (
              <div className="flex justify-center">
                <Loader2 className="size-6 animate-spin text-brand" />
              </div>
            ) : tree.length === 0 ? (
              <div className="flex justify-center text-muted-foreground">
                هیچ واحد سازمانی یافت نشد
              </div>
            ) : (
              <div className="flex justify-center">
                {tree.map((node) => (
                  <OrgNodeComponent key={node.id} node={node} />
                ))}
              </div>
            )}
          </div>
        </Container>
      </Section>
    </div>
  )
}
