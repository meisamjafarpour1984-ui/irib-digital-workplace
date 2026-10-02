/**
 * IRIB Digital Workplace Platform - Content Editor Page
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import { Save, Eye, AlertCircle, X, FileText, Sparkles, Plus, Archive } from 'lucide-react'
import { FileUploader } from '@/components/molecules/file-uploader'
import { useSearchParams } from 'next/navigation'
import { contentApi, contentHtml } from '@/lib/services/content'

// Dynamic import with SSR disabled to avoid hydration issues
// Add version key to force re-render when component changes
const RichTextEditor = dynamic(
  () =>
    import('@/components/molecules/rich-text-editor').then((mod) => ({
      default: mod.RichTextEditor,
    })),
  { ssr: false }
)

const contentTypes = [
  { id: 'news', label: 'خبر', icon: '📰' },
  { id: 'article', label: 'مقاله', icon: '📝' },
  { id: 'announcement', label: 'اطلاعیه', icon: '📢' },
  { id: 'event', label: 'رویداد', icon: '📅' },
  { id: 'page', label: 'صفحه', icon: '📄' },
]

// Content templates with sample content and beautiful layout
const contentTemplates = [
  {
    id: 'news',
    name: 'قالب خبر',
    icon: '📰',
    content: `<h1 style="font-size: 2.2em; font-weight: 700; margin-bottom: 1.2em; color: #1a1a1a; line-height: 1.3;">افتتاح مرکز نوآوری صدا و سیما در آذربایجان شرقی</h1>
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2em; border-radius: 16px; margin-bottom: 2.5em; color: white; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
  <p style="margin: 0; font-size: 1.15em; line-height: 1.8; font-weight: 500;">📌 مرکز نوآوری و کارآفرینی صدا و سیما با هدف حمایت از استارتاپ‌های حوزه رسانه و فناوری در تبریز افتتاح شد. این مرکز با سرمایه‌گذاری ۵۰ میلیارد ریالی و زیربنای ۲۰۰۰ مترمربع، فضایی برای توسعه ایده‌های نوین فراهم کرده است.</p>
</div>
<h2 style="font-size: 1.6em; font-weight: 700; margin: 2em 0 1.2em; color: #333; border-bottom: 4px solid #667eea; padding-bottom: 0.6em;">📋 جزئیات خبر</h2>
<p style="line-height: 2; color: #444; margin-bottom: 1.2em; font-size: 1.05em;">در مراسم افتتاحیه که با حضور معاون توسعه و فناوری سازمان صدا و سیما برگزار شد، بر اهمیت نوآوری در صنعت رسانه تأکید شد. این مرکز شامل فضای کار اشتراکی، آزمایشگاه فناوری، سالن همایش و فضای آموزشی است.</p>
<p style="line-height: 2; color: #444; margin-bottom: 1.2em; font-size: 1.05em;">طبق برنامه‌ریزی‌ها، این مرکز سالانه از ۵۰ استارتاپ حمایت خواهد کرد و امکاناتی نظیر مشاوره تخصصی، دسترسی به سرمایه‌گذاران و شبکه‌سازی با صنایع مرتبط را فراهم می‌کند.</p>
<ul style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 2em; border-radius: 12px; margin: 2em 0; list-style-position: inside; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
  <li style="margin-bottom: 0.8em; color: #555; font-size: 1.05em; line-height: 1.8;">✅ سرمایه‌گذاری ۵۰ میلیارد ریالی برای تجهیزات و زیرساخت</li>
  <li style="margin-bottom: 0.8em; color: #555; font-size: 1.05em; line-height: 1.8;">✅ حمایت از ۵۰ استارتاپ در سال اول</li>
  <li style="margin-bottom: 0.8em; color: #555; font-size: 1.05em; line-height: 1.8;">✅ ایجاد ۲۰۰ فرصت شغلی مستقیم</li>
</ul>
<h2 style="font-size: 1.6em; font-weight: 700; margin: 2em 0 1.2em; color: #333; border-bottom: 4px solid #764ba2; padding-bottom: 0.6em;">🎯 نتیجه‌گیری</h2>
<p style="line-height: 2; color: #444; font-size: 1.05em;">افتتاح این مرکز گامی مهم در جهت توسعه اکوسیستم نوآوری در منطقه است و می‌تواند به رشد صنعت رسانه و فناوری در آذربایجان شرقی کمک شایانی کند.</p>
<div style="background: #fff3cd; padding: 1.5em; border-radius: 8px; margin-top: 2em; border-left: 4px solid #ffc107;">
  <p style="margin: 0; color: #856404; font-size: 0.95em;"><strong>💡 نکته:</strong> علاقه‌مندان می‌توانند از تاریخ ۱۵ شهریور برای ثبت‌نام در برنامه‌های حمایت‌ای اقدام کنند.</p>
</div>`,
  },
  {
    id: 'article',
    name: 'قالب مقاله',
    icon: '📝',
    content: `<h1 style="font-size: 2.2em; font-weight: 700; margin-bottom: 1.2em; color: #1a1a1a; line-height: 1.3;">تأثیر هوش مصنوعی بر آینده صنعت رسانه</h1>
<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 2em; border-radius: 16px; margin-bottom: 2.5em; color: white; box-shadow: 0 4px 15px rgba(240, 147, 251, 0.3);">
  <p style="margin: 0; font-size: 1.15em; line-height: 1.8; font-weight: 500;">📖 هوش مصنوعی در حال تغییر شکل صنعت رسانه است. از تولید محتوا تا تحلیل داده‌ها، AI فرصت‌ها و چالش‌های جدیدی ایجاد کرده است. این مقاله به بررسی تأثیرات این فناوری بر آینده رسانه می‌پردازد.</p>
</div>
<h2 style="font-size: 1.6em; font-weight: 700; margin: 2em 0 1.2em; color: #333; border-bottom: 4px solid #f093fb; padding-bottom: 0.6em;">🔍 مقدمه و پیش‌زمینه</h2>
<p style="line-height: 2; color: #444; margin-bottom: 1.2em; font-size: 1.05em;">در سال‌های اخیر، هوش مصنوعی به یکی از مهم‌ترین فناوری‌های transformative تبدیل شده است. در صنعت رسانه، این فناوری از تولید خودکار محتوا تا شخصی‌سازی تجربه کاربری، کاربردهای گسترده‌ای پیدا کرده است.</p>
<p style="line-height: 2; color: #444; margin-bottom: 1.2em; font-size: 1.05em;">طبق گزارش‌ها، بازار هوش مصنوعی در رسانه تا سال ۲۰۲۵ به ۱۰ میلیارد دلار خواهد رسید. این رشد نشان‌دهنده اهمیت روزافزون این فناوری در صنعت است.</p>
<h2 style="font-size: 1.6em; font-weight: 700; margin: 2em 0 1.2em; color: #333; border-bottom: 4px solid #f5576c; padding-bottom: 0.6em;">📊 کاربردهای هوش مصنوعی در رسانه</h2>
<p style="line-height: 2; color: #444; margin-bottom: 1.2em; font-size: 1.05em;">هوش مصنوعی در رسانه کاربردهای متنوعی دارد:</p>
<ul style="background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%); padding: 2em; border-radius: 12px; margin: 2em 0; list-style-position: inside; box-shadow: 0 2px 8px rgba(245, 87, 108, 0.1);">
  <li style="margin-bottom: 0.8em; color: #555; font-size: 1.05em; line-height: 1.8;">تولید خودکار محتوا و خبر</li>
  <li style="margin-bottom: 0.8em; color: #555; font-size: 1.05em; line-height: 1.8;">تحلیل داده‌های مخاطبان</li>
  <li style="margin-bottom: 0.8em; color: #555; font-size: 1.05em; line-height: 1.8;">شخصی‌سازی محتوا برای هر کاربر</li>
  <li style="margin-bottom: 0.8em; color: #555; font-size: 1.05em; line-height: 1.8;">ترجمه و زیرنویس خودکار</li>
</ul>
<blockquote style="border-right: 5px solid #f5576c; background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%); padding: 2em; margin: 2em 0; border-radius: 0 12px 12px 0; color: #555; box-shadow: 0 2px 8px rgba(245, 87, 108, 0.1);">
  <p style="margin: 0; font-style: italic; font-size: 1.1em; line-height: 1.8;">💬 "هوش مصنوعی جایگزین انسان نمی‌شود، اما انسان‌هایی که از هوش مصنوعی استفاده می‌کنند، جایگزین کسانی می‌شوند که از آن استفاده نمی‌کنند."</p>
</blockquote>
<h2 style="font-size: 1.6em; font-weight: 700; margin: 2em 0 1.2em; color: #333; border-bottom: 4px solid #f093fb; padding-bottom: 0.6em;">✨ نتیجه‌گیری</h2>
<p style="line-height: 2; color: #444; margin-bottom: 1.2em; font-size: 1.05em;">هوش مصنوعی آینده صنعت رسانه را شکل می‌دهد. سازمان‌هایی که این فناوری را پذیرفته و از آن استفاده می‌کنند، در آینده مزیت رقابتی خواهند داشت.</p>`,
  },
  {
    id: 'announcement',
    name: 'قالب اطلاعیه',
    icon: '📢',
    content: `<h1 style="font-size: 2.2em; font-weight: 700; margin-bottom: 1.2em; color: #1a1a1a; line-height: 1.3;">اطلاعیه مهم: تغییر ساعات کاری از ۱۵ شهریور</h1>
<div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 2em; border-radius: 16px; margin-bottom: 2.5em; color: white; box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);">
  <p style="margin: 0; font-size: 1.15em; line-height: 1.8; font-weight: 500;">📢 با توجه به شروع فصل پاییز و تغییر ساعت رسمی کشور، ساعات کاری سازمان از تاریخ ۱۵ شهریور ۱۴۰۳ تغییر می‌کند. لطفاً از این تاریخ برنامه‌ریزی خود را متناسب با ساعات جدید انجام دهید.</p>
</div>
<div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 2em; border-radius: 12px; margin-bottom: 2.5em; border-left: 5px solid #4facfe; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
  <p style="margin: 0.8em 0; color: #555; font-size: 1.05em;"><strong>📅 تاریخ اجرا:</strong> ۱۵ شهریور ۱۴۰۳</p>
  <p style="margin: 0.8em 0; color: #555; font-size: 1.05em;"><strong>👥 مخاطبان:</strong> همه کارکنان صدا و سیمای آذربایجان شرقی</p>
  <p style="margin: 0.8em 0; color: #555; font-size: 1.05em;"><strong>⏰ اعتبار:</strong> تا اطلاع ثانوی</p>
  <p style="margin: 0.8em 0; color: #555; font-size: 1.05em;"><strong>🏢 واحد صادرکننده:</strong> معاونت اداری و مالی</p>
</div>
<h2 style="font-size: 1.6em; font-weight: 700; margin: 2em 0 1.2em; color: #333; border-bottom: 4px solid #4facfe; padding-bottom: 0.6em;">📝 ساعات کاری جدید</h2>
<p style="line-height: 2; color: #444; margin-bottom: 1.2em; font-size: 1.05em;">ساعات کاری جدید به شرح زیر است:</p>
<ul style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 2em; border-radius: 12px; margin: 2em 0; list-style-position: inside; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
  <li style="margin-bottom: 0.8em; color: #555; font-size: 1.05em; line-height: 1.8;">🔹 شنبه تا چهارشنبه: ۷:۳۰ تا ۱۶:۰۰</li>
  <li style="margin-bottom: 0.8em; color: #555; font-size: 1.05em; line-height: 1.8;">🔹 پنج‌شنبه: ۷:۳۰ تا ۱۲:۳۰</li>
  <li style="margin-bottom: 0.8em; color: #555; font-size: 1.05em; line-height: 1.8;">🔹 جمعه: تعطیل</li>
</ul>
<h2 style="font-size: 1.6em; font-weight: 700; margin: 2em 0 1.2em; color: #333; border-bottom: 4px solid #00f2fe; padding-bottom: 0.6em;">⚡ اقدامات مورد نیاز</h2>
<ol style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 2em; border-radius: 12px; margin: 2em 0; list-style-position: inside; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
  <li style="margin-bottom: 0.8em; color: #555; font-size: 1.05em; line-height: 1.8;">🔹 هماهنگی جلسات و ملاقات‌ها با ساعات جدید</li>
  <li style="margin-bottom: 0.8em; color: #555; font-size: 1.05em; line-height: 1.8;">🔹 تنظیم سیستم‌های حضور و غیاب</li>
  <li style="margin-bottom: 0.8em; color: #555; font-size: 1.05em; line-height: 1.8;">🔹 اطلاع‌رسانی به همکاران و مراجعین</li>
</ol>
<div style="background: #fff3cd; padding: 1.5em; border-radius: 8px; margin-top: 2em; border-left: 4px solid #ffc107; box-shadow: 0 2px 8px rgba(255, 193, 7, 0.2);">
  <p style="margin: 0; color: #856404; font-size: 0.95em;"><strong>ℹ️ برای اطلاعات بیشتر:</strong> با واحد منابع انسانی به شماره ۰۴۱-۳۳۳۳۴۴۴۴ تماس بگیرید.</p>
</div>`,
  },
  {
    id: 'event',
    name: 'قالب رویداد',
    icon: '📅',
    content: `<h1 style="font-size: 2.2em; font-weight: 700; margin-bottom: 1.2em; color: #1a1a1a; line-height: 1.3;">جشنواره ملی تولید محتوای دیجیتال ۱۴۰۳</h1>
<div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 2em; border-radius: 16px; margin-bottom: 2.5em; color: white; box-shadow: 0 4px 15px rgba(250, 112, 154, 0.3);">
  <p style="margin: 0; font-size: 1.15em; line-height: 1.8; font-weight: 500;">🎉 جشنواره ملی تولید محتوای دیجیتال با هدف کشف و حمایت از تولیدکنندگان محتوای برتر در حوزه‌های خبر، فرهنگ، هنر و فناوری برگزار می‌شود. این رویداد فرصتی عالی برای نمایش توانمندی‌ها و شبکه‌سازی است.</p>
</div>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5em; margin-bottom: 2.5em;">
  <div style="background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%); padding: 1.5em; border-radius: 12px; border: 2px solid #fa709a; box-shadow: 0 2px 8px rgba(250, 112, 154, 0.1);">
    <p style="margin: 0.8em 0; color: #555; font-size: 1.05em;"><strong>📅 تاریخ:</strong> ۲۰ تا ۲۲ مهر ۱۴۰۳</p>
  </div>
  <div style="background: linear-gradient(135deg, #fffbf0 0%, #ffe0a0 100%); padding: 1.5em; border-radius: 12px; border: 2px solid #fee140; box-shadow: 0 2px 8px rgba(254, 225, 64, 0.1);">
    <p style="margin: 0.8em 0; color: #555; font-size: 1.05em;"><strong>⏰ زمان:</strong> ۹:۰۰ تا ۱۸:۰۰</p>
  </div>
  <div style="background: linear-gradient(135deg, #f0f8ff 0%, #d0e8ff 100%); padding: 1.5em; border-radius: 12px; border: 2px solid #4facfe; box-shadow: 0 2px 8px rgba(79, 172, 254, 0.1);">
    <p style="margin: 0.8em 0; color: #555; font-size: 1.05em;"><strong>📍 مکان:</strong> مرکز همایش‌های صدا و سیما، تبریز</p>
  </div>
</div>
<h2 style="font-size: 1.6em; font-weight: 700; margin: 2em 0 1.2em; color: #333; border-bottom: 4px solid #fa709a; padding-bottom: 0.6em;">🎯 درباره رویداد</h2>
<p style="line-height: 2; color: #444; margin-bottom: 1.2em; font-size: 1.05em;">این جشنواره با حضور بیش از ۵۰۰ تولیدکننده محتوا از سراسر کشور برگزار می‌شود. شرکت‌کنندگان می‌توانند آثار خود را در ۴ دسته‌بندی اصلی ارائه دهند و جوایز ارزشمند دریافت کنند.</p>
<p style="line-height: 2; color: #444; margin-bottom: 1.2em; font-size: 1.05em;">جشنواره شامل کارگاه‌های آموزشی، پنل‌های تخصصی، نمایشگاه آثار و مراسم اهدای جوایز است. این فرصتی عالی برای یادگیری، شبکه‌سازی و نمایش توانمندی‌هاست.</p>
<h2 style="font-size: 1.6em; font-weight: 700; margin: 2em 0 1.2em; color: #333; border-bottom: 4px solid #fee140; padding-bottom: 0.6em;">📋 برنامه زمانی</h2>
<table style="width: 100%; border-collapse: collapse; margin: 2em 0; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
  <thead>
    <tr style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white;">
      <th style="padding: 1.2em; text-align: right; border-radius: 12px 0 0 0; font-weight: 600;">زمان</th>
      <th style="padding: 1.2em; text-align: right; border-radius: 0 12px 0 0; font-weight: 600;">فعالیت</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid #eee; background: #fafafa;">
      <td style="padding: 1.2em; color: #555; font-weight: 500;">۹:۰۰ - ۱۰:۰۰</td>
      <td style="padding: 1.2em; color: #555;">ثبت‌نام و پذیرش</td>
    </tr>
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 1.2em; color: #555; font-weight: 500;">۱۰:۰۰ - ۱۱:۳۰</td>
      <td style="padding: 1.2em; color: #555;">مراسم افتتاحیه</td>
    </tr>
    <tr style="border-bottom: 1px solid #eee; background: #fafafa;">
      <td style="padding: 1.2em; color: #555; font-weight: 500;">۱۱:۳۰ - ۱۳:۰۰</td>
      <td style="padding: 1.2em; color: #555;">کارگاه آموزشی: تولید محتوای ویدیویی</td>
    </tr>
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 1.2em; color: #555; font-weight: 500;">۱۴:۰۰ - ۱۶:۰۰</td>
      <td style="padding: 1.2em; color: #555;">پنل تخصصی: آینده رسانه دیجیتال</td>
    </tr>
    <tr style="border-bottom: 1px solid #eee; background: #fafafa;">
      <td style="padding: 1.2em; color: #555; font-weight: 500;">۱۶:۰۰ - ۱۷:۳۰</td>
      <td style="padding: 1.2em; color: #555;">نمایشگاه آثار و شبکه‌سازی</td>
    </tr>
    <tr>
      <td style="padding: 1.2em; color: #555; font-weight: 500;">۱۷:۳۰ - ۱۸:۰۰</td>
      <td style="padding: 1.2em; color: #555;">مراسم اهدای جوایز و پایان</td>
    </tr>
  </tbody>
</table>
<h2 style="font-size: 1.6em; font-weight: 700; margin: 2em 0 1.2em; color: #333; border-bottom: 4px solid #4facfe; padding-bottom: 0.6em;">🎫 نحوه ثبت‌نام</h2>
<p style="line-height: 2; color: #444; margin-bottom: 1.2em; font-size: 1.05em;">ثبت‌نام در این جشنواره رایگان است و از طریق وب‌سایت رسمی جشنواره انجام می‌شود. شرکت‌کنندگان باید تا تاریخ ۱۵ مهر آثار خود را بارگذاری کنند.</p>
<p style="line-height: 2; color: #444; margin-bottom: 1.2em; font-size: 1.05em;">هر شرکت‌کننده می‌تواند حداکثر ۳ اثر در یک دسته‌بندی ارائه دهد. آثار باید جدید و تولید شده در سال ۱۴۰۳ باشند.</p>
<div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); padding: 1.5em; border-radius: 8px; margin-top: 2em; border-left: 4px solid #28a745; box-shadow: 0 2px 8px rgba(40, 167, 69, 0.2);">
  <p style="margin: 0; color: #155724; font-size: 0.95em;"><strong>✅ نکته مهم:</strong> ظرفیت محدود است. ثبت‌نام زودتر انجام دهید! برای ثبت‌نام به festival.irib.ir مراجعه کنید.</p>
</div>`,
  },
]

interface SavedContentItem {
  id: string
  title: string
  contentType: string
  status: string
  content?: string
  tags?: string[]
  department?: string
  published?: boolean
  featured?: boolean
  scheduledAt?: string
  expiresAt?: string
  createdAt: string
  updatedAt?: string
}

function EditorContent() {
  const searchParams = useSearchParams()
  const contentId = searchParams.get('id')
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [contentType, setContentType] = useState('news')
  const [department, setDepartment] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [published, setPublished] = useState(false)
  const [featured, setFeatured] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [customTemplates, setCustomTemplates] = useState<
    Array<{ id: string; name: string; content: string }>
  >([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [editorKey, setEditorKey] = useState(0)

  // Real departments from backend
  const [availableDepartments] = useState<
    Array<{ id: string; name: string | { fa?: string; en?: string } }>
  >([
    {
      id: '10000000-0000-0000-0000-000000000001',
      name: { fa: 'معاونت توسعه و فناوری', en: 'Deputy of Development and Technology' },
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      name: { fa: 'معاونت برنامه‌ریزی', en: 'Deputy of Planning' },
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      name: { fa: 'معاونت خبر', en: 'Deputy of News' },
    },
    { id: '10000000-0000-0000-0000-000000000004', name: { fa: 'معاونت سیما', en: 'Deputy of TV' } },
    {
      id: '10000000-0000-0000-0000-000000000005',
      name: { fa: 'معاونت صدا', en: 'Deputy of Radio' },
    },
    {
      id: '20000000-0000-0000-0000-000000000001',
      name: { fa: 'واحد شبکه و زیرساخت', en: 'Network and Infrastructure Unit' },
    },
    {
      id: '20000000-0000-0000-0000-000000000002',
      name: { fa: 'واحد نرم‌افزار', en: 'Software Unit' },
    },
    {
      id: '20000000-0000-0000-0000-000000000003',
      name: { fa: 'واحد سخت‌افزار', en: 'Hardware Unit' },
    },
    {
      id: '20000000-0000-0000-0000-000000000004',
      name: { fa: 'واحد امنیت اطلاعات', en: 'Information Security Unit' },
    },
    {
      id: '30000000-0000-0000-0000-000000000001',
      name: { fa: 'واحد منابع انسانی', en: 'Human Resources Unit' },
    },
    { id: '30000000-0000-0000-0000-000000000002', name: { fa: 'واحد مالی', en: 'Finance Unit' } },
    {
      id: '30000000-0000-0000-0000-000000000003',
      name: { fa: 'واحد اداری', en: 'Administrative Unit' },
    },
    {
      id: '40000000-0000-0000-0000-000000000001',
      name: { fa: 'واحد تولید', en: 'Production Unit' },
    },
    {
      id: '40000000-0000-0000-0000-000000000002',
      name: { fa: 'واحد روابط عمومی', en: 'Public Relations Unit' },
    },
    { id: '40000000-0000-0000-0000-000000000003', name: { fa: 'واحد آرشیو', en: 'Archive Unit' } },
  ])

  // Load existing content if editing
  useEffect(() => {
    if (contentId) {
      const loadContent = async () => {
        setLoading(true)
        try {
          // Try localStorage first
          const savedContent = JSON.parse(localStorage.getItem('savedContent') || '[]')
          const localContent = savedContent.find((item: SavedContentItem) => item.id === contentId)

          if (localContent) {
            setTitle(localContent.title)
            setContentType(localContent.contentType.toLowerCase())
            setContent(localContent.content)
            setTags(localContent.tags || [])
            setDepartment(localContent.department || '')
            setPublished(localContent.published || false)
            setFeatured(localContent.featured || false)
            setScheduledAt(
              localContent.scheduledAt
                ? new Date(localContent.scheduledAt).toISOString().slice(0, 16)
                : ''
            )
            setExpiresAt(
              localContent.expiresAt
                ? new Date(localContent.expiresAt).toISOString().slice(0, 16)
                : ''
            )
            // Force re-render of RichTextEditor
            setEditorKey((prev) => prev + 1)
          } else {
            // Try backend if not in localStorage
            const contentData = await contentApi.findOne(contentId)
            setTitle(
              typeof contentData.title === 'string'
                ? contentData.title
                : contentData.title?.fa || contentData.title?.en || ''
            )
            setContentType(contentData.contentType.toLowerCase())
            setContent(contentHtml(contentData.body) || '')
            setTags(contentData.tags.map((t) => t.tag.name))
          }
        } catch (err) {
          console.error('Failed to load content:', err)
          setError('خطا در بارگذاری محتوا')
        } finally {
          setLoading(false)
        }
      }
      loadContent()
    }
  }, [contentId])

  // Load departments on mount - disabled temporarily to fix page loading
  // useEffect(() => {
  //   const loadDepartments = async () => {
  //     try {
  //       const departments = await contentApi.listDepartments()
  //       setAvailableDepartments(departments)
  //     } catch (err) {
  //       setAvailableDepartments([])
  //     }
  //   }
  //   loadDepartments()
  // }, [])

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      setError('لطفاً عنوان محتوا را وارد کنید.')
      return
    }

    if (!content.trim()) {
      setError('لطفاً متن محتوا را وارد کنید.')
      return
    }

    setLoading(true)
    setError(null)

    const contentData = {
      title,
      contentType: contentType.toUpperCase() as
        'NEWS' | 'ANNOUNCEMENT' | 'EVENT' | 'GALLERY' | 'BANNER' | 'FILE' | 'VIDEO',
      content,
      tags,
      department,
      published,
      featured,
      status: scheduledAt ? 'SCHEDULED' : published ? 'PUBLISHED' : 'DRAFT',
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    }

    // Save to localStorage directly (backend is unavailable)
    try {
      const savedContent = {
        id: contentId || Date.now().toString(),
        ...contentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Get existing saved content
      const existingContent = JSON.parse(localStorage.getItem('savedContent') || '[]')
      const index = existingContent.findIndex((c: SavedContentItem) => c.id === savedContent.id)

      if (index >= 0) {
        existingContent[index] = savedContent
      } else {
        existingContent.push(savedContent)
      }

      localStorage.setItem('savedContent', JSON.stringify(existingContent))

      // Dispatch custom event to trigger refresh in list page
      window.dispatchEvent(new CustomEvent('contentUpdated'))

      setError('محتوا با موفقیت ذخیره شد.')
      setTimeout(() => setError(null), 2000)

      // Navigate after short delay
      setTimeout(() => router.push('/dashboard/content'), 1000)
    } catch (localStorageErr) {
      console.error('Failed to save to localStorage:', localStorageErr)
      setError('خطا در ذخیره محتوا. لطفاً دوباره تلاش کنید.')
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = () => {
    const previewData = {
      title,
      contentType,
      content,
      tags,
      published,
      featured,
    }

    const previewUrl = `/dashboard/content/preview?data=${encodeURIComponent(JSON.stringify(previewData))}`
    window.open(previewUrl, '_blank')
  }

  const handleCancel = () => {
    // Check if there are unsaved changes
    const hasChanges = title || content || tags.length > 0

    if (hasChanges) {
      if (confirm('آیا مطمئن هستید که می‌خواهید خارج شوید؟ تغییرات ذخیره نخواهند شد.')) {
        router.push('/dashboard/content')
      }
    } else {
      router.push('/dashboard/content')
    }
  }

  const handleArchive = async () => {
    if (!confirm('آیا از بایگانی این محتوا اطمینان دارید؟')) {
      return
    }

    const savedContent = JSON.parse(localStorage.getItem('savedContent') || '[]')
    const index = savedContent.findIndex((item: SavedContentItem) => item.id === (contentId || ''))

    if (index >= 0) {
      savedContent[index].status = 'ARCHIVED'
      localStorage.setItem('savedContent', JSON.stringify(savedContent))

      // Dispatch custom event to trigger refresh in list page
      window.dispatchEvent(new CustomEvent('contentUpdated'))

      setError('محتوا بایگانی شد')
      setTimeout(() => setError(null), 2000)
      setTimeout(() => router.push('/dashboard/content'), 1000)
    }
  }

  const handlePublish = async () => {
    // Validation
    if (!title.trim()) {
      setError('لطفاً عنوان محتوا را وارد کنید.')
      return
    }

    if (!content.trim()) {
      setError('لطفاً متن محتوا را وارد کنید.')
      return
    }

    setLoading(true)
    setError(null)

    const contentData = {
      title,
      contentType: contentType.toUpperCase() as
        'NEWS' | 'ANNOUNCEMENT' | 'EVENT' | 'GALLERY' | 'BANNER' | 'FILE' | 'VIDEO',
      content,
      tags,
      department,
      published: true,
      featured,
      status: scheduledAt ? 'SCHEDULED' : 'PUBLISHED',
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    }

    // Save to localStorage directly (backend is unavailable)
    try {
      const savedContent = {
        id: contentId || Date.now().toString(),
        ...contentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Get existing saved content
      const existingContent = JSON.parse(localStorage.getItem('savedContent') || '[]')
      const index = existingContent.findIndex((c: SavedContentItem) => c.id === savedContent.id)

      if (index >= 0) {
        existingContent[index] = savedContent
      } else {
        existingContent.push(savedContent)
      }

      localStorage.setItem('savedContent', JSON.stringify(existingContent))

      // Dispatch custom event to trigger refresh in list page
      window.dispatchEvent(new CustomEvent('contentUpdated'))

      setError('محتوا با موفقیت منتشر شد.')
      setTimeout(() => setError(null), 2000)

      // Navigate after short delay
      setTimeout(() => router.push('/dashboard/content'), 1000)
    } catch (localStorageErr) {
      console.error('Failed to save to localStorage:', localStorageErr)
      setError('خطا در انتشار محتوا. لطفاً دوباره تلاش کنید.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTemplate = (
    templateId: string,
    templateContent: string,
    _templateName: string
  ) => {
    if (content && !confirm('استفاده از قالب محتوای فعلی را پاک می‌کند. آیا ادامه می‌دهید؟')) {
      return
    }
    setContent(templateContent)
    setSelectedTemplateId(templateId)
    setShowTemplates(false)
    // Force re-render of RichTextEditor by changing key
    setEditorKey((prev) => prev + 1)
  }

  const handleSaveAsTemplate = () => {
    const templateName = prompt('نام قالب جدید را وارد کنید:')
    if (templateName && content) {
      const newTemplate = {
        id: Date.now().toString(),
        name: templateName,
        content: content,
      }
      setCustomTemplates([...customTemplates, newTemplate])
      alert('قالب با موفقیت ذخیره شد')
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col">
        <DashboardTopbar />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {contentId ? 'ویرایش محتوا' : 'محتوای جدید'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  ایجاد و ویرایش محتوای مرکز صدا و سیمای آذربایجان شرقی
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground border border-input rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                  انصراف
                </button>
                {contentId && (
                  <button
                    onClick={handleArchive}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground border border-input rounded-lg hover:bg-muted transition-colors"
                  >
                    <Archive className="w-4 h-4" />
                    بایگانی
                  </button>
                )}
                <button
                  onClick={handlePreview}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground border border-input rounded-lg hover:bg-muted transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  پیش‌نمایش
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'در حال ذخیره...' : 'ذخیره'}
                </button>
                <button
                  onClick={handlePublish}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-success rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'در حال انتشار...' : 'انتشار'}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Form */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  عنوان محتوا
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="عنوان محتوا را وارد کنید..."
                  className="w-full px-4 py-3 text-sm border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
                  title="عنوان محتوا - عنوان اصلی و کوتاه برای محتوا"
                />
              </div>

              {/* Content Type & Department */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    نوع محتوا
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
                    title="نوع محتوا - انتخاب نوع محتوا (خبر، مقاله، اطلاعیه، رویداد، صفحه)"
                  >
                    {contentTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    واحد سازمانی
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
                    disabled={availableDepartments.length === 0}
                    title="واحد سازمانی - انتخاب واحد سازمانی مربوطه"
                  >
                    {availableDepartments.length === 0 ? (
                      <option value="">در حال بارگذاری...</option>
                    ) : (
                      <>
                        <option value="">انتخاب کنید</option>
                        {availableDepartments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {typeof dept.name === 'string'
                              ? dept.name
                              : dept.name?.fa || dept.name?.en || dept.id}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Content Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-foreground">متن محتوا</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand border border-brand/20 rounded-lg hover:bg-brand/10 transition-colors"
                      title="انتخاب قالب آماده"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      قالب‌ها
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAsTemplate}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground border border-input rounded-lg hover:bg-muted transition-colors"
                      title="ذخیره محتوای فعلی به عنوان قالب"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      ذخیره به عنوان قالب
                    </button>
                  </div>
                </div>

                {/* Selected Template Indicator */}
                {selectedTemplateId && (
                  <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-brand/5 border border-brand/20 rounded-lg">
                    <FileText className="w-4 h-4 text-brand" />
                    <span className="text-sm text-brand">
                      قالب انتخاب شده:{' '}
                      {contentTemplates.find((t) => t.id === selectedTemplateId)?.name ||
                        customTemplates.find((t) => t.id === selectedTemplateId)?.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedTemplateId(null)}
                      className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                      title="حذف قالب"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Template Selector */}
                {showTemplates && (
                  <div className="mb-4 p-4 bg-muted/30 rounded-xl border border-border">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      انتخاب قالب
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Default Templates */}
                      {contentTemplates.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() =>
                            handleSelectTemplate(template.id, template.content, template.name)
                          }
                          className="flex flex-col items-start gap-3 p-4 bg-background border border-input rounded-lg hover:border-brand/50 hover:bg-brand/5 transition-all text-right"
                          title={`استفاده از قالب ${template.name}`}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <span className="text-3xl">{template.icon}</span>
                            <div className="text-right flex-1">
                              <div className="text-sm font-medium text-foreground">
                                {template.name}
                              </div>
                              <div className="text-xs text-muted-foreground">قالب پیش‌فرض</div>
                            </div>
                          </div>
                          <div
                            className="text-xs text-muted-foreground line-clamp-3 w-full text-right"
                            dangerouslySetInnerHTML={{ __html: template.content }}
                          />
                        </button>
                      ))}
                      {/* Custom Templates */}
                      {customTemplates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() =>
                            handleSelectTemplate(template.id, template.content, template.name)
                          }
                          className="flex flex-col items-start gap-3 p-4 bg-background border border-input rounded-lg hover:border-brand/50 hover:bg-brand/5 transition-all text-right"
                          title={`استفاده از قالب ${template.name}`}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <span className="text-3xl">📋</span>
                            <div className="text-right flex-1">
                              <div className="text-sm font-medium text-foreground">
                                {template.name}
                              </div>
                              <div className="text-xs text-muted-foreground">قالب سفارشی</div>
                            </div>
                          </div>
                          <div
                            className="text-xs text-muted-foreground line-clamp-3 w-full text-right"
                            dangerouslySetInnerHTML={{ __html: template.content }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <RichTextEditor
                  key={`rich-text-editor-${editorKey}`}
                  content={content}
                  onChange={setContent}
                  placeholder="متن محتوا را اینجا بنویسید..."
                  editable={true}
                  className="min-h-[400px]"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">برچسب‌ها</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="برچسب جدید..."
                    className="flex-1 px-4 py-2 text-sm border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
                    title="برچسب جدید - وارد کردن برچسب و فشردن Enter برای اضافه کردن"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand/90 transition-colors"
                    title="اضافه کردن برچسب - اضافه کردن برچسب به لیست"
                  >
                    <Plus className="w-4 h-4" />
                    اضافه
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-muted text-foreground rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive transition-colors"
                        title="حذف برچسب"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Scheduling & Expiration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    زمان انتشار برنامه‌ریزی شده
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
                    title="زمان انتشار برنامه‌ریزی شده - تنظیم زمان خودکار برای انتشار"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    زمان انقضا
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
                    title="زمان انقضا - محتوا به صورت خودکار بایگانی می‌شود"
                  />
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label
                  className="block text-sm font-medium text-foreground mb-2"
                  title="فایل‌های پیوست - آپلود تصاویر و PDF"
                >
                  فایل‌های پیوست
                </label>
                <FileUploader
                  onUpload={(files) => console.warn('Uploaded files:', files)}
                  accept={['image/*', 'application/pdf']}
                  maxSize={10 * 1024 * 1024}
                />
              </div>

              {/* Options */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="w-4 h-4 text-brand border-input rounded focus:ring-brand/50"
                    title="منتشر شده - علامت‌گذاری محتوا به عنوان منتشر شده"
                  />
                  <span className="text-sm text-foreground">منتشر شده</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 text-brand border-input rounded focus:ring-brand/50"
                    title="ویژه - علامت‌گذاری محتوا به عنوان ویژه"
                  />
                  <span className="text-sm text-foreground">ویژه</span>
                </label>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function ContentEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen bg-background flex items-center justify-center">
          در حال بارگذاری...
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  )
}
