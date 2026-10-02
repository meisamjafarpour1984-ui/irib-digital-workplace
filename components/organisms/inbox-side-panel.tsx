'use client'

import { FileText, Clock, Users, Tag, Link as LinkIcon, AlertCircle } from 'lucide-react'
import { AccessibleButton } from '@/components/ui/AccessibleButton'
import { useTranslations } from 'next-intl'

interface EntityContext {
  type: string
  title: string
  status: string
  createdAt: string
  updatedAt: string
  assignee?: string
  priority?: string
  tags?: string[]
}

interface Participant {
  id: string
  name: string
  role: string
  avatar?: string
}

interface InboxSidePanelProps {
  entity?: EntityContext
  participants?: Participant[]
  slaDeadline?: string
  relatedItems?: { id: string; title: string; type: string }[]
}

export function InboxSidePanel({
  entity,
  participants = [],
  slaDeadline,
  relatedItems = [],
}: InboxSidePanelProps) {
  const t = useTranslations('inboxSidePanel')
  if (!entity) return null

  return (
    <div className="w-72 shrink-0 border-s border-border bg-card p-4 space-y-4 overflow-y-auto">
      {/* Entity Context */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <FileText className="size-3.5" aria-hidden />
          {t('entityInfo')}
        </h3>
        <div className="space-y-2.5">
          <div>
            <p className="text-[10px] text-muted-foreground">{t('type')}</p>
            <p className="text-sm font-medium text-foreground">
              {t(`types.${entity.type}`, { default: entity.type })}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">{t('title')}</p>
            <p className="text-sm text-foreground">{entity.title}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">{t('status')}</p>
            <span className="inline-flex rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
              {t(`statuses.${entity.status}`, { default: entity.status })}
            </span>
          </div>
          {entity.priority && (
            <div>
              <p className="text-[10px] text-muted-foreground">{t('priority')}</p>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                  entity.priority === 'urgent'
                    ? 'bg-error/10 text-error'
                    : entity.priority === 'high'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {t(`priorities.${entity.priority}`, { default: entity.priority })}
              </span>
            </div>
          )}
          <div>
            <p className="text-[10px] text-muted-foreground">{t('createdAt')}</p>
            <p className="text-xs text-foreground tabular-nums">{entity.createdAt}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">{t('updatedAt')}</p>
            <p className="text-xs text-foreground tabular-nums">{entity.updatedAt}</p>
          </div>
        </div>
      </div>

      {/* SLA Timer */}
      {slaDeadline && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-3">
          <div className="flex items-center gap-2 text-warning">
            <Clock className="size-4" aria-hidden />
            <span className="text-xs font-bold">{t('slaDeadline')}</span>
          </div>
          <p className="mt-1 text-sm font-bold text-foreground tabular-nums">{slaDeadline}</p>
        </div>
      )}

      {/* Participants */}
      {participants.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Users className="size-3.5" aria-hidden />
            {t('participants', { count: participants.length })}
          </h3>
          <ul className="space-y-2">
            {participants.map((p) => (
              <li key={p.id} className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-brand">
                  {p.name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags */}
      {entity.tags && entity.tags.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Tag className="size-3.5" aria-hidden />
            {t('tags')}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {entity.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related Items */}
      {relatedItems.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <LinkIcon className="size-3.5" aria-hidden />
            {t('relatedItems')}
          </h3>
          <ul className="space-y-1.5">
            {relatedItems.map((item) => (
              <li key={item.id}>
                <AccessibleButton
                  href={`/related/${item.id}`}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-foreground hover:bg-muted"
                >
                  <AlertCircle className="size-3 text-muted-foreground" aria-hidden />
                  <span className="truncate">{item.title}</span>
                  <span className="ms-auto text-[10px] text-muted-foreground">{item.type}</span>
                </AccessibleButton>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
