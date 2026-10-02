/**
 * IRIB Digital Workplace Platform - Event Calendar Page
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

'use client'

import { useState } from 'react'
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Users,
  XCircle,
  Bell,
} from 'lucide-react'

export default function EventsPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [view, setView] = useState<'month' | 'week' | 'list'>('month')
  const [showEventModal, setShowEventModal] = useState(false)

  const events = [
    {
      id: 1,
      title: 'جلسه ماهانه مدیران',
      description: 'جلسه بررسی عملکرد ماهانه',
      date: new Date(2026, 8, 20), // 1403/09/20
      time: '۱۰:۰۰ - ۱۲:۰۰',
      location: 'سالن جلسات',
      attendees: 12,
      category: 'meeting',
      color: 'blue',
    },
    {
      id: 2,
      title: 'کارگاه آموزشی امنیت',
      description: 'کارگاه آموزشی امنیت اطلاعات',
      date: new Date(2026, 8, 22), // 1403/09/22
      time: '۱۴:۰۰ - ۱۶:۰۰',
      location: 'سالن آموزش',
      attendees: 25,
      category: 'training',
      color: 'green',
    },
    {
      id: 3,
      title: 'جشن سالانه',
      description: 'جشن سالانه مرکز',
      date: new Date(2026, 8, 25), // 1403/09/25
      time: '۱۸:۰۰ - ۲۲:۰۰',
      location: 'سالن همایش',
      attendees: 150,
      category: 'celebration',
      color: 'purple',
    },
    {
      id: 4,
      title: 'بررسی فنی سیستم',
      description: 'بررسی و ارزیابی فنی سیستم‌ها',
      date: new Date(2026, 8, 28), // 1403/09/28
      time: '۰۹:۰۰ - ۱۱:۰۰',
      location: 'اتاق فنی',
      attendees: 8,
      category: 'meeting',
      color: 'blue',
    },
  ]

  const categoryStyles: Record<string, string> = {
    meeting: 'bg-blue/10 text-blue',
    training: 'bg-green/10 text-green',
    celebration: 'bg-purple/10 text-purple',
    deadline: 'bg-red/10 text-red',
  }

  const categoryLabels: Record<string, string> = {
    meeting: 'جلسه',
    training: 'آموزشی',
    celebration: 'جشن',
    deadline: 'ددلاین',
  }

  const colorStyles: Record<string, string> = {
    blue: 'bg-blue',
    green: 'bg-green',
    purple: 'bg-purple',
    red: 'bg-red',
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => event.date.toDateString() === date.toDateString())
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const monthNames = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
  ]

  const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-border bg-muted/30" />)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayEvents = getEventsForDate(date)
      const isSelected = selectedDate?.toDateString() === date.toDateString()
      const isToday = new Date().toDateString() === date.toDateString()

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-24 border border-border p-2 cursor-pointer transition-colors ${
            isSelected ? 'bg-brand/10 border-brand' : 'bg-card hover:bg-muted/50'
          } ${isToday ? 'bg-brand/5' : ''}`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-medium ${isToday ? 'text-brand' : 'text-foreground'}`}>
              {day}
            </span>
            {isToday && <div className="size-2 rounded-full bg-brand" />}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className={`text-xs px-1 py-0.5 rounded truncate ${colorStyles[event.color]} text-white`}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-muted-foreground">+{dayEvents.length - 2} بیشتر</div>
            )}
          </div>
        </div>
      )
    }

    return days
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">تقویم رویدادها</h1>
              <p className="text-muted-foreground mt-1">مدیریت رویدادها و جلسات</p>
            </div>
            <button
              onClick={() => setShowEventModal(true)}
              className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90"
            >
              <Plus className="size-4" />
              رویداد جدید
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                  <h2 className="text-lg font-semibold text-foreground">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setView('month')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      view === 'month'
                        ? 'bg-brand text-white'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    ماهانه
                  </button>
                  <button
                    onClick={() => setView('week')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      view === 'week'
                        ? 'bg-brand text-white'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    هفتگی
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      view === 'list'
                        ? 'bg-brand text-white'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    لیست
                  </button>
                </div>
              </div>

              {/* Week Days */}
              <div className="grid grid-cols-7 gap-px mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              {view === 'month' && (
                <div className="grid grid-cols-7 gap-px">{renderMonthView()}</div>
              )}

              {view === 'week' && (
                <div className="text-center py-12 text-muted-foreground">
                  نمای هفتگی در حال توسعه است
                </div>
              )}

              {view === 'list' && (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-brand/50 transition-colors"
                    >
                      <div
                        className={`size-12 rounded-lg ${colorStyles[event.color]} flex items-center justify-center text-white`}
                      >
                        <CalendarIcon className="size-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="size-3" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`rounded px-2 py-1 text-xs font-semibold ${categoryStyles[event.category]}`}
                      >
                        {categoryLabels[event.category]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Date Events */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-border bg-card p-6 sticky top-6">
              <h3 className="font-semibold text-foreground mb-4">
                {selectedDate
                  ? `رویدادهای ${selectedDate.toLocaleDateString('fa-IR')}`
                  : 'رویدادهای امروز'}
              </h3>

              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="mx-auto size-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">رویدادی یافت نشد</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 rounded-lg border border-border bg-card hover:border-brand/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-foreground text-sm">{event.title}</h4>
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-semibold ${categoryStyles[event.category]}`}
                        >
                          {categoryLabels[event.category]}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{event.description}</p>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="size-3" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="size-3" />
                          <span>{event.attendees} شرکت‌کننده</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-border">
                <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand/10 px-4 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand hover:text-white">
                  <Bell className="size-4" />
                  تنظیم یادآوری
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">ایجاد رویداد جدید</h2>
              <button
                onClick={() => setShowEventModal(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <XCircle className="size-5" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">عنوان</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                  placeholder="عنوان رویداد"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">توضیحات</label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                  placeholder="توضیحات رویداد"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">تاریخ</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">زمان</label>
                  <input
                    type="time"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">مکان</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                  placeholder="مکان برگزاری"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">دسته‌بندی</label>
                <select className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none">
                  <option value="meeting">جلسه</option>
                  <option value="training">آموزشی</option>
                  <option value="celebration">جشن</option>
                  <option value="deadline">ددلاین</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90"
                >
                  ذخیره
                </button>
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
