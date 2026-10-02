/**
 * IRIB Digital Workplace Platform - Reporting Module Widget
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
  BarChart3,
  TrendingUp,
  Download,
  MoreVertical,
  PieChart,
  LineChart,
  FileText,
  RefreshCw,
} from 'lucide-react'

export default function ReportingModuleWidget() {
  const [activeReport, setActiveReport] = useState('overview')
  const [timeRange, setTimeRange] = useState('month')

  const reports = [
    { id: 'overview', name: 'نمای کلی', icon: BarChart3 },
    { id: 'performance', name: 'عملکرد', icon: TrendingUp },
    { id: 'usage', name: 'استفاده', icon: PieChart },
    { id: 'trends', name: 'روندها', icon: LineChart },
  ]

  const reportData = {
    overview: {
      title: 'نمای کلی سیستم',
      metrics: [
        { label: 'کاربران فعال', value: '۱,۲۳۴', change: '+۱۲٪', positive: true },
        { label: 'محتوای منتشر شده', value: '۴۵۶', change: '+۸٪', positive: true },
        { label: 'زمان پاسخگویی', value: '۲.۳s', change: '-۱۵٪', positive: true },
        { label: 'نرخ خطا', value: '۰.۲٪', change: '-۵٪', positive: true },
      ],
      chart: 'bar',
    },
    performance: {
      title: 'عملکرد سیستم',
      metrics: [
        { label: 'زمان بارگذاری', value: '۱.۸s', change: '-۲۰٪', positive: true },
        { label: 'تعداد درخواست‌ها', value: '۱۲,۳۴۵', change: '+۲۵٪', positive: true },
        { label: 'مصرف CPU', value: '۴۵٪', change: '+۵٪', positive: false },
        { label: 'مصرف حافظه', value: '۶۲٪', change: '+۸٪', positive: false },
      ],
      chart: 'line',
    },
    usage: {
      title: 'استفاده از سیستم',
      metrics: [
        { label: 'ورودی روزانه', value: '۸۹۰', change: '+۱۵٪', positive: true },
        { label: 'زمان صرف شده', value: '۴۵m', change: '+۱۰٪', positive: true },
        { label: 'صفحات بازدید شده', value: '۳,۴۵۶', change: '+۲۲٪', positive: true },
        { label: 'نرخ خروج', value: '۳۲٪', change: '-۸٪', positive: true },
      ],
      chart: 'pie',
    },
    trends: {
      title: 'روندها',
      metrics: [
        { label: 'رشد کاربران', value: '+۲۳٪', change: '+۵٪', positive: true },
        { label: 'رشد محتوا', value: '+۱۸٪', change: '+۳٪', positive: true },
        { label: 'فعالیت کاربران', value: '+۳۵٪', change: '+۱۲٪', positive: true },
        { label: 'تعاملات', value: '+۲۸٪', change: '+۷٪', positive: true },
      ],
      chart: 'line',
    },
  }

  const currentReport = reportData[activeReport as keyof typeof reportData]

  const renderChart = () => {
    const chartData = [
      { value: 65, label: 'شنبه' },
      { value: 45, label: 'یک‌شنبه' },
      { value: 78, label: 'دوشنبه' },
      { value: 52, label: 'سه‌شنبه' },
      { value: 89, label: 'چهارشنبه' },
      { value: 67, label: 'پنج‌شنبه' },
      { value: 72, label: 'جمعه' },
    ]

    if (currentReport.chart === 'bar') {
      return (
        <div className="h-48 flex items-end justify-between gap-2 px-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-brand/60 rounded-t transition-all hover:bg-brand"
                style={{ height: `${item.value}%` }}
              />
              <span className="text-xs text-muted-foreground mt-2">{item.label}</span>
            </div>
          ))}
        </div>
      )
    }

    if (currentReport.chart === 'line') {
      return (
        <div className="h-48 flex items-end justify-between gap-2 px-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-success/60 rounded-t transition-all hover:bg-success"
                style={{ height: `${item.value}%` }}
              />
              <span className="text-xs text-muted-foreground mt-2">{item.label}</span>
            </div>
          ))}
        </div>
      )
    }

    if (currentReport.chart === 'pie') {
      return (
        <div className="h-48 flex items-center justify-center">
          <div className="relative w-40 h-40">
            <div
              className="absolute inset-0 rounded-full border-8 border-brand"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
            />
            <div
              className="absolute inset-0 rounded-full border-8 border-success"
              style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
            />
            <div
              className="absolute inset-0 rounded-full border-8 border-warning"
              style={{ clipPath: 'polygon(0 0, 25% 0, 25% 100%, 0 100%)' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-foreground">۷ روز</span>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 text-brand" />
          <h3 className="font-semibold text-foreground">گزارش‌دهی</h3>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-brand focus:outline-none"
          >
            <option value="week">هفته</option>
            <option value="month">ماه</option>
            <option value="quarter">فصل</option>
            <option value="year">سال</option>
          </select>
          <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <RefreshCw className="size-4" />
          </button>
          <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <MoreVertical className="size-4" />
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-1 p-2 border-b border-border">
        {reports.map((report) => {
          const Icon = report.icon
          return (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeReport === report.id
                  ? 'bg-brand text-white'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Icon className="size-4" />
              {report.name}
            </button>
          )
        })}
      </div>

      {/* Report Content */}
      <div className="p-4">
        <h4 className="font-semibold text-foreground mb-4">{currentReport.title}</h4>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {currentReport.metrics.map((metric, index) => (
            <div key={index} className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-lg font-bold text-foreground">{metric.value}</p>
                <span
                  className={`text-xs font-medium ${metric.positive ? 'text-success' : 'text-error'}`}
                >
                  {metric.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="rounded-lg border border-border bg-card p-4">{renderChart()}</div>
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-border flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 rounded bg-brand px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
          <Download className="size-4" />
          دانلود گزارش
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 rounded border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted">
          <FileText className="size-4" />
          مشاهده جزئیات
        </button>
      </div>
    </div>
  )
}
