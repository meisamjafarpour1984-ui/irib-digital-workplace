'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, AtSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface Message {
  id: string
  sender: string
  senderRole: string
  content: string
  timestamp: string
  type: 'user' | 'system' | 'form'
  attachment?: string
  mentions?: string[]
}

interface ChatThreadProps {
  messages: Message[]
  currentUserName?: string
  onSend?: (content: string, mentions: string[]) => void
  className?: string
}

export function ChatThread({
  messages,
  currentUserName: _currentUserName = 'شما',
  onSend,
  className,
}: ChatThreadProps) {
  const t = useTranslations('chatThread')
  const [input, setInput] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const users = ['رضا کریمی', 'محمد احمدی', 'علی رضایی', 'سارا موسوی', 'مریم حسنی']
  const filteredUsers = users.filter((u) => u.includes(mentionQuery))

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleInput = (value: string) => {
    setInput(value)
    // Detect @mention
    const lastAt = value.lastIndexOf('@')
    if (lastAt >= 0 && lastAt === value.length - 1) {
      setShowMentions(true)
      setMentionQuery('')
    } else if (lastAt >= 0) {
      const query = value.slice(lastAt + 1)
      if (!query.includes(' ')) {
        setShowMentions(true)
        setMentionQuery(query)
      } else {
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }
  }

  const insertMention = (user: string) => {
    const lastAt = input.lastIndexOf('@')
    const before = input.slice(0, lastAt)
    setInput(`${before}@${user} `)
    setShowMentions(false)
  }

  const handleSend = () => {
    if (!input.trim()) return
    const mentions = input.match(/@[\u0600-\u06FF\s]+/g)?.map((m) => m.slice(1).trim()) || []
    onSend?.(input, mentions)
    setInput('')
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex gap-3', msg.type === 'system' ? 'justify-center' : '')}
          >
            {msg.type === 'system' ? (
              <div className="rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                {msg.content}
              </div>
            ) : (
              <>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-brand">
                  {msg.sender.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{msg.sender}</span>
                    <span className="text-[10px] text-muted-foreground">{msg.senderRole}</span>
                    <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                  </div>
                  <div className="mt-1 text-sm leading-relaxed text-foreground">
                    {msg.content.split(/(@[\u0600-\u06FF\s]+)/g).map((part, i) =>
                      part.startsWith('@') ? (
                        <span key={i} className="rounded bg-brand/10 px-1 text-brand font-medium">
                          {part}
                        </span>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )}
                  </div>
                  {msg.attachment && (
                    <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                      <Paperclip className="size-3.5 text-muted-foreground" aria-hidden />
                      <span className="text-xs text-foreground">{msg.attachment}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className="relative border-t border-border p-3">
        {/* Mention Suggestions */}
        {showMentions && filteredUsers.length > 0 && (
          <ul className="absolute bottom-full left-3 right-3 mb-1 rounded-xl border border-border bg-card shadow-lg">
            {filteredUsers.map((user) => (
              <li key={user}>
                <button
                  type="button"
                  onClick={() => insertMention(user)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <AtSign className="size-3.5 text-muted-foreground" aria-hidden />
                  {user}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-end gap-2">
          <button
            type="button"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={t('attach')}
          >
            <Paperclip className="size-4" />
          </button>
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              placeholder={t('placeholder')}
              rows={1}
              className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              aria-label={t('messageLabel')}
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
            aria-label={t('send')}
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
