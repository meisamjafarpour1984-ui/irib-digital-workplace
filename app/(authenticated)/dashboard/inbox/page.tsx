'use client'

import { useState } from 'react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import {
  Search,
  Send,
  Paperclip,
  MoreHorizontal,
  Archive,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Image,
  MessageSquare,
} from 'lucide-react'

interface Conversation {
  id: string
  subject: string
  entityType: 'فرم' | 'تیکت' | 'محتوا' | 'آفیش'
  entityTitle: string
  lastMessage: string
  lastMessageTime: string
  unread: boolean
  status: 'باز' | 'در حال بررسی' | 'بسته شده'
  participants: string[]
  messages: Message[]
}

interface Message {
  id: string
  sender: string
  senderRole: string
  content: string
  timestamp: string
  type: 'user' | 'system'
  attachment?: string
}

const conversations: Conversation[] = [
  {
    id: 'c1',
    subject: 'درخواست دسترسی به آرشیو تصویری',
    entityType: 'تیکت',
    entityTitle: 'تیکت #۱۲۳۴',
    lastMessage: 'دسترسی شما فعال شد. لطفاً مجدداً وارد شوید.',
    lastMessageTime: '۱۰:۱۵',
    unread: true,
    status: 'باز',
    participants: ['شما', 'رضا کریمی'],
    messages: [
      {
        id: 'm1',
        sender: 'شما',
        senderRole: 'کارمند',
        content: 'سلام، درخواست دسترسی به آرشیو تصویری برای پروژه جدید دارم.',
        timestamp: '۱۰:۰۰',
        type: 'user',
      },
      {
        id: 'm2',
        sender: 'رضا کریمی',
        senderRole: 'کارشناس IT',
        content: 'درخواست شما ثبت شد. در حال بررسی است.',
        timestamp: '۱۰:۰۵',
        type: 'user',
      },
      {
        id: 'm3',
        sender: 'سیستم',
        senderRole: '',
        content: 'وضعیت تیکت تغییر کرد: در حال بررسی → بسته شده',
        timestamp: '۱۰:۱۰',
        type: 'system',
      },
      {
        id: 'm4',
        sender: 'رضا کریمی',
        senderRole: 'کارشناس IT',
        content: 'دسترسی شما فعال شد. لطفاً مجدداً وارد شوید.',
        timestamp: '۱۰:۱۵',
        type: 'user',
      },
    ],
  },
  {
    id: 'c2',
    subject: 'فرم نظرسنجی رضایت کارکنان',
    entityType: 'فرم',
    entityTitle: 'نظرسنجی Q2',
    lastMessage: 'فرم شما با موفقیت ثبت شد.',
    lastMessageTime: '۰۹:۴۲',
    unread: false,
    status: 'بسته شده',
    participants: ['شما', 'علی رضایی'],
    messages: [
      {
        id: 'm5',
        sender: 'سیستم',
        senderRole: '',
        content: 'فرم نظرسنجی رضایت کارکنان برای شما ارسال شد.',
        timestamp: '۰۹:۳۰',
        type: 'system',
      },
      {
        id: 'm6',
        sender: 'شما',
        senderRole: 'کارمند',
        content: 'فرم را تکمیل کردم.',
        timestamp: '۰۹:۴۲',
        type: 'user',
      },
    ],
  },
  {
    id: 'c3',
    subject: 'آفیش تیم برنامه‌سازی هفته آینده',
    entityType: 'آفیش',
    entityTitle: 'آفیش هفته ۲۴',
    lastMessage: 'آفیش نهایی شد. لطفاً برنامه خود را بررسی کنید.',
    lastMessageTime: 'دیروز',
    unread: true,
    status: 'باز',
    participants: ['شما', 'مریم حسنی', 'محمد احمدی'],
    messages: [
      {
        id: 'm7',
        sender: 'مریم حسنی',
        senderRole: 'برنامه‌ساز',
        content: 'آفیش هفته آینده آماده شد. لطفاً برنامه خود را بررسی کنید.',
        timestamp: 'دیروز ۱۶:۰۰',
        type: 'user',
      },
    ],
  },
  {
    id: 'c4',
    subject: 'به‌روزرسانی نرم‌افزارهای سازمانی',
    entityType: 'محتوا',
    entityTitle: 'اطلاعیه IT',
    lastMessage: 'نسخه جدید آنتی‌ویروس منتشر شد.',
    lastMessageTime: '۲ روز پیش',
    unread: false,
    status: 'باز',
    participants: ['رضا کریمی'],
    messages: [
      {
        id: 'm8',
        sender: 'رضا کریمی',
        senderRole: 'مدیر IT',
        content: 'نسخه جدید آنتی‌ویروس سازمانی (v20.4) منتشر شد. لطفاً به‌روزرسانی کنید.',
        timestamp: '۲ روز پیش',
        type: 'user',
      },
    ],
  },
]

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  باز: { icon: AlertCircle, color: 'text-warning' },
  'در حال بررسی': { icon: Clock, color: 'text-info' },
  'بسته شده': { icon: CheckCircle2, color: 'text-success' },
}

const entityIcons: Record<string, typeof FileText> = {
  فرم: FileText,
  تیکت: AlertCircle,
  محتوا: Image,
  آفیش: FileText,
}

const filterTabs = ['منتسب به من', 'ایجاد شده توسط من', 'دنبال‌شده', 'همه', 'بایگانی']

export default function InboxPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    conversations[0]
  )
  const [activeFilter, setActiveFilter] = useState('منتسب به من')
  const [messageText, setMessageText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredConversations = conversations.filter(
    (c) => c.subject.includes(searchTerm) || c.entityTitle.includes(searchTerm)
  )

  const sendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return
    // In production, this would call API
    setMessageText('')
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 p-6">
          <div className="grid h-[calc(100vh-140px)] grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Master (Conversation List) */}
            <div className="flex flex-col rounded-2xl border border-border bg-card shadow-sm lg:col-span-4">
              {/* List Header */}
              <div className="border-b border-border p-4">
                <h2 className="mb-3 text-heading-1 text-foreground">کارتابل ارتباطات</h2>
                <div className="relative">
                  <Search
                    className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <input
                    type="search"
                    placeholder="جستجو..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background py-2 pr-9 pl-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    aria-label="جستجو در مکاتبات"
                  />
                </div>
                {/* Filter Tabs */}
                <div className="mt-3 flex gap-1 overflow-x-auto">
                  {filterTabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveFilter(tab)}
                      className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        activeFilter === tab
                          ? 'bg-brand text-white'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {filteredConversations.map((conv) => {
                  const StatusIcon = statusConfig[conv.status]?.icon || Clock
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => setSelectedConversation(conv)}
                      className={`flex w-full items-start gap-3 border-b border-border p-4 text-right transition-colors ${
                        selectedConversation?.id === conv.id
                          ? 'bg-brand/5 border-r-2 border-r-brand'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ${
                          conv.unread ? 'bg-brand text-white' : 'bg-accent text-brand'
                        }`}
                      >
                        {(() => {
                          const Icon = entityIcons[conv.entityType] || FileText
                          return <Icon className="size-4" aria-hidden />
                        })()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`truncate text-sm ${conv.unread ? 'font-bold text-foreground' : 'font-medium text-foreground'}`}
                          >
                            {conv.subject}
                          </p>
                          {conv.unread && (
                            <span className="size-2 shrink-0 rounded-full bg-brand" />
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {conv.lastMessage}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <StatusIcon
                            className={`size-3 ${statusConfig[conv.status]?.color}`}
                            aria-hidden
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {conv.lastMessageTime}
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Detail (Thread) */}
            {selectedConversation ? (
              <div className="flex flex-col rounded-2xl border border-border bg-card shadow-sm lg:col-span-8">
                {/* Thread Header */}
                <div className="flex items-center justify-between border-b border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-brand">
                      {(() => {
                        const Icon = entityIcons[selectedConversation.entityType] || FileText
                        return <Icon className="size-5" aria-hidden />
                      })()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        {selectedConversation.subject}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedConversation.entityTitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        statusConfig[selectedConversation.status]?.color || 'text-muted-foreground'
                      } bg-muted`}
                    >
                      {selectedConversation.status}
                    </span>
                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="بایگانی"
                    >
                      <Archive className="size-4" />
                    </button>
                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="بیشتر"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
                  <div className="space-y-4">
                    {selectedConversation.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.type === 'system' ? 'justify-center' : ''}`}
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
                                <span className="text-sm font-semibold text-foreground">
                                  {msg.sender}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {msg.senderRole}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {msg.timestamp}
                                </span>
                              </div>
                              <p className="mt-1 text-sm leading-relaxed text-foreground">
                                {msg.content}
                              </p>
                              {msg.attachment && (
                                <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                                  <Paperclip
                                    className="size-3.5 text-muted-foreground"
                                    aria-hidden
                                  />
                                  <span className="text-xs text-foreground">{msg.attachment}</span>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Composer */}
                <div className="border-t border-border p-4">
                  <div className="flex items-end gap-3">
                    <button
                      type="button"
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="پیوست فایل"
                    >
                      <Paperclip className="size-4" />
                    </button>
                    <div className="relative flex-1">
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="پیام خود را بنویسید..."
                        rows={1}
                        className="w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                        aria-label="متن پیام"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage()
                          }
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={sendMessage}
                      disabled={!messageText.trim()}
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
                      aria-label="ارسال پیام"
                    >
                      <Send className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-2xl border border-border bg-card shadow-sm lg:col-span-8">
                <div className="text-center">
                  <MessageSquare className="mx-auto size-12 text-muted-foreground/30" aria-hidden />
                  <p className="mt-3 text-body-lg text-muted-foreground">
                    یک مکاتبه را انتخاب کنید
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
