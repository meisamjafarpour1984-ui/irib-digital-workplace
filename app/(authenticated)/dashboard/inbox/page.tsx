'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Image,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
} from 'lucide-react'
import {
  communicationApi,
  connectInbox,
  messageText,
  type Conversation,
  type Message,
} from '@/lib/services/communication'
import { useAuthStore } from '@/lib/stores/auth-store'

type ConversationRole = 'ASSIGNEE' | 'OWNER' | 'FOLLOWER' | undefined

const filterTabs: Array<{ label: string; role: ConversationRole }> = [
  { label: 'منتسب به من', role: 'ASSIGNEE' },
  { label: 'ایجاد شده توسط من', role: 'OWNER' },
  { label: 'دنبال‌شده', role: 'FOLLOWER' },
  { label: 'همه', role: undefined },
]

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string }> = {
  OPEN: { label: 'باز', icon: AlertCircle, color: 'text-warning' },
  IN_PROGRESS: { label: 'در حال بررسی', icon: Clock, color: 'text-info' },
  CLOSED: { label: 'بسته شده', icon: CheckCircle2, color: 'text-success' },
}

const entityIcons: Record<string, typeof FileText> = {
  FORM: FileText,
  TICKET: AlertCircle,
  CONTENT: Image,
  SCHEDULE: FileText,
}

function safeName(name: string | { fa?: string } | null | undefined, fallback = 'کاربر') {
  if (typeof name === 'string') return name.trim() || fallback
  return name?.fa?.trim() || fallback
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'خطایی در دریافت اطلاعات رخ داد.'
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fa-IR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function latestMessage(conversation: Conversation) {
  return conversation.messages[0]
}

function isUnread(conversation: Conversation, userId?: string) {
  const latest = latestMessage(conversation)
  const membership = conversation.participants.find((participant) => participant.userId === userId)
  if (!latest || latest.senderId === userId) return false
  return !membership?.lastReadAt || new Date(latest.createdAt) > new Date(membership.lastReadAt)
}

function appendUnique(messages: Message[], incoming: Message) {
  return messages.some((message) => message.id === incoming.id) ? messages : [...messages, incoming]
}

export default function InboxPage() {
  const { accessToken, user } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [activeRole, setActiveRole] = useState<ConversationRole>('ASSIGNEE')
  const [messageValue, setMessageValue] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [threadLoading, setThreadLoading] = useState(false)
  const [threadError, setThreadError] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const selectedIdRef = useRef<string | null>(null)
  const listRequestRef = useRef(0)
  const threadRequestRef = useRef(0)

  useEffect(() => {
    selectedIdRef.current = selectedConversationId
  }, [selectedConversationId])

  const loadConversations = useCallback(async () => {
    const requestId = ++listRequestRef.current
    setListLoading(true)
    setListError(null)
    try {
      const result = await communicationApi.list(activeRole)
      if (requestId !== listRequestRef.current) return
      setConversations(result)
      setSelectedConversationId((current) =>
        current && result.some((conversation) => conversation.id === current) ? current : null
      )
    } catch (error) {
      if (requestId === listRequestRef.current) setListError(errorMessage(error))
    } finally {
      if (requestId === listRequestRef.current) setListLoading(false)
    }
  }, [activeRole])

  useEffect(() => {
    void loadConversations()
  }, [loadConversations])

  const loadThread = useCallback(
    async (conversationId: string) => {
      const requestId = ++threadRequestRef.current
      setThreadLoading(true)
      setThreadError(null)
      setSendError(null)
      setMessages([])
      try {
        const result = await communicationApi.messages(conversationId)
        if (requestId !== threadRequestRef.current || selectedIdRef.current !== conversationId)
          return
        setMessages(result)
        await communicationApi.markRead(conversationId)
        if (requestId !== threadRequestRef.current || selectedIdRef.current !== conversationId)
          return
        const readAt = new Date().toISOString()
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  participants: conversation.participants.map((participant) =>
                    participant.userId === user?.id
                      ? { ...participant, lastReadAt: readAt }
                      : participant
                  ),
                }
              : conversation
          )
        )
      } catch (error) {
        if (requestId === threadRequestRef.current && selectedIdRef.current === conversationId)
          setThreadError(errorMessage(error))
      } finally {
        if (requestId === threadRequestRef.current && selectedIdRef.current === conversationId)
          setThreadLoading(false)
      }
    },
    [user?.id]
  )

  const selectConversation = useCallback(
    (conversationId: string) => {
      selectedIdRef.current = conversationId
      setSelectedConversationId(conversationId)
      void loadThread(conversationId)
    },
    [loadThread]
  )

  useEffect(() => {
    if (!accessToken) return
    const socket = connectInbox(accessToken)
    const handleCreated = (incoming: Message) => {
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === incoming.conversationId
            ? { ...conversation, updatedAt: incoming.createdAt, messages: [incoming] }
            : conversation
        )
      )
      if (incoming.conversationId === selectedIdRef.current) {
        setMessages((current) => appendUnique(current, incoming))
        void communicationApi.markRead(incoming.conversationId).catch(() => undefined)
      }
    }
    socket.on('message.created', handleCreated)
    return () => {
      socket.off('message.created', handleCreated)
      socket.disconnect()
    }
  }, [accessToken])

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId]
  )

  const filteredConversations = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('fa')
    if (!query) return conversations
    return conversations.filter((conversation) =>
      conversation.subject.toLocaleLowerCase('fa').includes(query)
    )
  }, [conversations, searchTerm])

  const sendMessage = async () => {
    const text = messageValue.trim()
    if (!text || !selectedConversationId || sending) return
    setSending(true)
    setSendError(null)
    try {
      const sent = await communicationApi.send(selectedConversationId, text)
      if (selectedIdRef.current === selectedConversationId) {
        setMessages((current) => appendUnique(current, sent))
        setMessageValue('')
      }
    } catch (error) {
      setSendError(errorMessage(error))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 p-6">
          <div className="grid h-[calc(100vh-140px)] grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="flex flex-col rounded-2xl border border-border bg-card shadow-sm lg:col-span-4">
              <div className="border-b border-border p-4">
                <h2 className="mb-3 text-heading-1 text-foreground">کارتابل ارتباطات</h2>
                <div className="relative">
                  <Search
                    className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <input
                    type="search"
                    placeholder="جستجو در موضوع مکاتبات..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-full rounded-lg border border-input bg-background py-2 pr-9 pl-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    aria-label="جستجو در موضوع مکاتبات"
                  />
                </div>
                <div className="mt-3 flex gap-1 border-b border-border">
                  {filterTabs.map((tab) => (
                    <button
                      key={tab.label}
                      type="button"
                      onClick={() => setActiveRole(tab.role)}
                      className={`whitespace-nowrap px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                        activeRole === tab.role
                          ? 'border-b-2 border-brand text-brand'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {listLoading ? (
                  <div className="flex h-full min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    در حال دریافت مکاتبات...
                  </div>
                ) : listError ? (
                  <div className="flex h-full min-h-48 flex-col items-center justify-center px-6 text-center">
                    <AlertCircle className="size-8 text-destructive" aria-hidden />
                    <p className="mt-2 text-sm text-foreground">دریافت مکاتبات ممکن نشد</p>
                    <p className="mt-1 text-xs text-muted-foreground">{listError}</p>
                    <button
                      type="button"
                      onClick={() => void loadConversations()}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                    >
                      <RefreshCw className="size-3.5" aria-hidden />
                      تلاش دوباره
                    </button>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex h-full min-h-48 flex-col items-center justify-center px-6 text-center">
                    <MessageSquare className="size-9 text-muted-foreground/40" aria-hidden />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {searchTerm.trim()
                        ? 'موضوعی مطابق جستجوی شما پیدا نشد.'
                        : 'مکاتبه‌ای در این بخش نیست.'}
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => {
                    const status = statusConfig[conversation.status]
                    const StatusIcon = status?.icon ?? Clock
                    const EntityIcon = entityIcons[conversation.entityType] ?? FileText
                    const latest = latestMessage(conversation)
                    const unread = isUnread(conversation, user?.id)
                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => selectConversation(conversation.id)}
                        className={`flex w-full items-start gap-3 border-b border-border p-4 text-right transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40 ${
                          selectedConversationId === conversation.id
                            ? 'border-r-2 border-r-brand bg-brand/5'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ${
                            unread ? 'bg-brand text-white' : 'bg-accent text-brand'
                          }`}
                        >
                          <EntityIcon className="size-4" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`truncate text-sm text-foreground ${unread ? 'font-bold' : 'font-medium'}`}
                            >
                              {conversation.subject}
                            </p>
                            {unread && <span className="size-2 shrink-0 rounded-full bg-brand" />}
                          </div>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {latest ? messageText(latest.content) : 'هنوز پیامی ارسال نشده است.'}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <StatusIcon
                              className={`size-3 ${status?.color ?? 'text-muted-foreground'}`}
                              aria-hidden
                            />
                            <span className="text-[10px] text-muted-foreground">
                              {formatDate(latest?.createdAt ?? conversation.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {selectedConversation ? (
              <div className="flex min-h-0 flex-col rounded-2xl border border-border bg-card shadow-sm lg:col-span-8">
                <div className="flex items-center justify-between border-b border-border p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-brand">
                      {(() => {
                        const Icon = entityIcons[selectedConversation.entityType] ?? FileText
                        return <Icon className="size-5" aria-hidden />
                      })()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-foreground">
                        {selectedConversation.subject}
                      </h3>
                      <p className="truncate text-xs text-muted-foreground">
                        {selectedConversation.participants
                          .map((participant) => safeName(participant.user.name))
                          .join('، ')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`mr-3 inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold ${
                      statusConfig[selectedConversation.status]?.color ?? 'text-muted-foreground'
                    }`}
                  >
                    {statusConfig[selectedConversation.status]?.label ??
                      selectedConversation.status}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
                  {threadLoading ? (
                    <div className="flex h-full min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      در حال دریافت پیام‌ها...
                    </div>
                  ) : threadError ? (
                    <div className="flex h-full min-h-48 flex-col items-center justify-center px-6 text-center">
                      <AlertCircle className="size-8 text-destructive" aria-hidden />
                      <p className="mt-2 text-sm text-foreground">دریافت پیام‌ها ممکن نشد</p>
                      <p className="mt-1 text-xs text-muted-foreground">{threadError}</p>
                      <button
                        type="button"
                        onClick={() => void loadThread(selectedConversation.id)}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                      >
                        <RefreshCw className="size-3.5" aria-hidden />
                        تلاش دوباره
                      </button>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
                      <MessageSquare className="size-10 text-muted-foreground/30" aria-hidden />
                      <p className="mt-3 text-sm text-muted-foreground">
                        هنوز پیامی در این مکاتبه نیست.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const senderName = safeName(message.sender?.name, 'سیستم')
                        const isSystem = message.type === 'SYSTEM' || !message.sender
                        return (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${isSystem ? 'justify-center' : ''}`}
                          >
                            {isSystem ? (
                              <div className="rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                                {messageText(message.content)}
                              </div>
                            ) : (
                              <>
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-brand">
                                  {senderName.slice(0, 1)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-semibold text-foreground">
                                      {senderName}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {formatDate(message.createdAt)}
                                    </span>
                                  </div>
                                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                                    {messageText(message.content)}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="border-t border-border p-4">
                  {sendError && (
                    <p className="mb-2 text-xs text-destructive" role="alert">
                      {sendError}
                    </p>
                  )}
                  <div className="flex items-end gap-3">
                    <div className="relative flex-1">
                      <textarea
                        value={messageValue}
                        onChange={(event) => setMessageValue(event.target.value)}
                        placeholder="پیام خود را بنویسید..."
                        rows={1}
                        disabled={sending || threadLoading || Boolean(threadError)}
                        className="w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="متن پیام"
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault()
                            void sendMessage()
                          }
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => void sendMessage()}
                      disabled={
                        !messageValue.trim() || sending || threadLoading || Boolean(threadError)
                      }
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand text-white transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="ارسال پیام"
                    >
                      {sending ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      ) : (
                        <Send className="size-4" aria-hidden />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-2xl border border-border bg-card shadow-sm lg:col-span-8">
                <div className="text-center">
                  <MessageSquare className="mx-auto size-12 text-muted-foreground/30" aria-hidden />
                  <p className="mt-3 text-body-lg text-muted-foreground">
                    برای مشاهده پیام‌ها یک مکاتبه را انتخاب کنید
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
