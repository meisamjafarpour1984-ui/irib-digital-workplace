'use client'

import { useState } from 'react'
import { Send, Users, Building2, Briefcase, X, Search } from 'lucide-react'
import { RichTextEditor } from '@/components/molecules/rich-text-editor'
import { cn } from '@/lib/utils'

interface BroadcastRecipient {
  type: 'all' | 'department' | 'unit' | 'role' | 'custom'
  targetIds: string[]
}

interface BroadcastComposerProps {
  onSend?: (data: { subject: string; body: string; recipient: BroadcastRecipient; scheduledAt?: string }) => void
  onClose?: () => void
}

const departments = [
  { id: 'it', name: 'فناوری اطلاعات' },
  { id: 'production', name: 'تولید' },
  { id: 'admin', name: 'اداری و مالی' },
  { id: 'research', name: 'پژوهش' },
  { id: 'pr', name: 'روابط عمومی' },
  { id: 'edu', name: 'آموزش' },
]

const roles = [
  { id: 'p2', name: 'کارمند' },
  { id: 'p3', name: 'کارشناس' },
  { id: 'p4', name: 'مدیر معاونت' },
  { id: 'p5', name: 'مدیر ارشد' },
  { id: 'p6', name: 'مدیر IT' },
]

const employmentTypes = [
  { id: 'official', name: 'رسمی' },
  { id: 'contractor', name: 'قراردادی' },
  { id: 'company', name: 'شرکتی' },
]

export function BroadcastComposer({ onSend, onClose }: BroadcastComposerProps) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [recipientType, setRecipientType] = useState<BroadcastRecipient['type']>('all')
  const [selectedTargets, setSelectedTargets] = useState<string[]>([])
  const [sendVia, setSendVia] = useState<'in_app' | 'push' | 'both'>('in_app')
  const [searchTerm, setSearchTerm] = useState('')

  const estimatedRecipients = recipientType === 'all' ? 500 :
    recipientType === 'department' ? selectedTargets.length * 40 :
    recipientType === 'role' ? selectedTargets.length * 30 :
    selectedTargets.length * 10

  const toggleTarget = (id: string) => {
    setSelectedTargets((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  const handleSend = () => {
    onSend?.({
      subject,
      body,
      recipient: { type: recipientType, targetIds: selectedTargets },
    })
  }

  const recipientTypes = [
    { id: 'all' as const, label: 'همه کاربران', icon: Users, count: 500 },
    { id: 'department' as const, label: 'معاونت‌ها', icon: Building2, count: departments.length },
    { id: 'role' as const, label: 'نقش‌ها', icon: Briefcase, count: roles.length },
    { id: 'custom' as const, label: 'سفارشی', icon: Search, count: 0 },
  ]

  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-heading-1 text-foreground">ارسال پیام هدفمند</h2>
        <button
          type="button"
          onClick={onClose}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="بستن"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Subject */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">موضوع</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="موضوع پیام..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        {/* Body */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">متن پیام</label>
          <RichTextEditor
            content={body}
            onChange={setBody}
            placeholder="متن پیام خود را بنویسید..."
            className="min-h-[200px]"
          />
        </div>

        {/* Audience Builder */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">مخاطبان</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {recipientTypes.map((rt) => {
              const Icon = rt.icon
              return (
                <button
                  key={rt.id}
                  type="button"
                  onClick={() => { setRecipientType(rt.id); setSelectedTargets([]) }}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-colors',
                    recipientType === rt.id
                      ? 'border-brand bg-brand/5 text-brand'
                      : 'border-border text-muted-foreground hover:border-brand/30'
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                  <span className="text-xs font-medium">{rt.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Target Selection */}
        {recipientType !== 'all' && (
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="relative mb-3">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                type="search"
                placeholder="جستجو..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-input bg-card py-2 pr-9 pl-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                aria-label="جستجو"
              />
            </div>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {(recipientType === 'department' ? departments :
                recipientType === 'role' ? roles :
                employmentTypes
              )
                .filter((item) => item.name.includes(searchTerm))
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleTarget(item.id)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                      selectedTargets.includes(item.id)
                        ? 'bg-brand text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {item.name}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Send Options */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-foreground">ارسال از طریق:</label>
            <div className="flex gap-2">
              {[
                { id: 'in_app' as const, label: 'پورتال' },
                { id: 'push' as const, label: 'Push' },
                { id: 'both' as const, label: 'هر دو' },
              ].map((opt) => (
                <label key={opt.id} className="flex items-center gap-1.5 text-xs text-foreground">
                  <input
                    type="radio"
                    name="sendVia"
                    checked={sendVia === opt.id}
                    onChange={() => setSendVia(opt.id)}
                    className="size-3.5 text-brand focus:ring-brand/20"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{estimatedRecipients}</span> مخاطب تخمینی
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-border p-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
        >
          انصراف
        </button>
        <button
          type="button"
          onClick={handleSend}
          disabled={!subject || !body}
          className="flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover disabled:opacity-50"
        >
          <Send className="size-4" aria-hidden />
          ارسال پیام
        </button>
      </div>
    </div>
  )
}
