/**
 * IRIB Digital Workplace Platform - Task Management Widget
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

'use client'

import { useState } from 'react'
import { CheckSquare, Plus, Calendar, Trash2, Bell, Search } from 'lucide-react'

export default function TaskManagementWidget() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'تکمیل گزارش فنی',
      description: 'گزارش عملکرد سیستم را تکمیل کنید',
      priority: 'high',
      dueDate: '۱۴۰۳/۰۹/۲۰',
      status: 'pending',
      reminder: true,
    },
    {
      id: 2,
      title: 'بررسی درخواست‌های جدید',
      description: 'درخواست‌های انتقال را بررسی کنید',
      priority: 'medium',
      dueDate: '۱۴۰۳/۰۹/۲۲',
      status: 'in_progress',
      reminder: false,
    },
    {
      id: 3,
      title: 'آماده‌سازی برای جلسه',
      description: 'اسلایدهای جلسه را آماده کنید',
      priority: 'low',
      dueDate: '۱۴۰۳/۰۹/۲۵',
      status: 'pending',
      reminder: true,
    },
    {
      id: 4,
      title: 'بروزرسانی مستندات',
      description: 'مستندات کاربران را به‌روزرسانی کنید',
      priority: 'medium',
      dueDate: '۱۴۰۳/۰۹/۲۸',
      status: 'completed',
      reminder: false,
    },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const priorityStyles: Record<string, string> = {
    high: 'bg-error/10 text-error',
    medium: 'bg-warning/10 text-warning',
    low: 'bg-success/10 text-success',
  }

  const priorityLabels: Record<string, string> = {
    high: 'بالا',
    medium: 'متوسط',
    low: 'پایین',
  }

  const statusStyles: Record<string, string> = {
    pending: 'bg-gray/10 text-gray-700',
    in_progress: 'bg-blue/10 text-blue',
    completed: 'bg-success/10 text-success',
  }

  const statusLabels: Record<string, string> = {
    pending: 'در انتظار',
    in_progress: 'در حال انجام',
    completed: 'تکمیل شده',
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = filter === 'all' || task.status === filter
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const toggleTaskStatus = (id: number) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          if (task.status === 'pending') return { ...task, status: 'in_progress' as const }
          if (task.status === 'in_progress') return { ...task, status: 'completed' as const }
          return { ...task, status: 'pending' as const }
        }
        return task
      })
    )
  }

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const toggleReminder = (id: number) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, reminder: !task.reminder } : task)))
  }

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <CheckSquare className="size-5 text-brand" />
          <h3 className="font-semibold text-foreground">مدیریت تسک‌ها</h3>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand/90"
        >
          <Plus className="size-4" />
          تسک جدید
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 p-3 border-b border-border">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground">کل</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{stats.pending}</p>
          <p className="text-xs text-muted-foreground">در انتظار</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{stats.inProgress}</p>
          <p className="text-xs text-muted-foreground">در حال انجام</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{stats.completed}</p>
          <p className="text-xs text-muted-foreground">تکمیل شده</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-3 border-b border-border flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="جستجو در تسک‌ها..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded border border-border bg-background pr-8 pl-3 py-1.5 text-sm text-foreground focus:border-brand focus:outline-none"
          />
        </div>
        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value as 'all' | 'pending' | 'in_progress' | 'completed')
          }
          className="rounded border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-brand focus:outline-none"
        >
          <option value="all">همه</option>
          <option value="pending">در انتظار</option>
          <option value="in_progress">در حال انجام</option>
          <option value="completed">تکمیل شده</option>
        </select>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-4 border-b border-border bg-muted/50">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="عنوان تسک"
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
            />
            <textarea
              placeholder="توضیحات"
              rows={2}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
            />
            <div className="flex gap-2">
              <select className="flex-1 rounded border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none">
                <option value="high">اولویت بالا</option>
                <option value="medium">اولویت متوسط</option>
                <option value="low">اولویت پایین</option>
              </select>
              <input
                type="date"
                className="flex-1 rounded border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex-1 rounded bg-brand px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
                ذخیره
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 rounded border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="max-h-64 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center">
            <CheckSquare className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">تسکی یافت نشد</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`flex gap-3 p-3 border-b border-border hover:bg-muted/50 transition-colors ${
                task.status === 'completed' ? 'opacity-60' : ''
              }`}
            >
              <button
                onClick={() => toggleTaskStatus(task.id)}
                className={`mt-1 size-5 rounded border flex items-center justify-center transition-colors ${
                  task.status === 'completed'
                    ? 'bg-success border-success text-white'
                    : 'border-border hover:border-brand'
                }`}
              >
                {task.status === 'completed' && <CheckSquare className="size-3" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={`font-medium text-foreground text-sm ${
                      task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-1">
                    {task.reminder && (
                      <button
                        onClick={() => toggleReminder(task.id)}
                        className="rounded p-1 text-brand"
                        title="یادآوری فعال"
                      >
                        <Bell className="size-3" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-error"
                      title="حذف"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {task.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs font-semibold ${priorityStyles[task.priority]}`}
                  >
                    {priorityLabels[task.priority]}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs font-semibold ${statusStyles[task.status]}`}
                  >
                    {statusLabels[task.status]}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="size-3" />
                    <span>{task.dueDate}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
