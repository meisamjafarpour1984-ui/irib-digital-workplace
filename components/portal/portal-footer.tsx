import { useTranslations } from 'next-intl'
import { PortalLogo } from './portal-logo'

export function PortalFooter() {
  const t = useTranslations('footer')
  const columns = [
    {
      titleKey: 'quickAccess',
      links: [
        { label: 'صفحه اصلی', href: '/' },
        { label: 'اخبار مرکز', href: '/news' },
        { label: 'خدمات و سامانه‌ها', href: '/it' },
        { label: 'تماس با ما', href: '/contact' },
      ],
    },
    {
      titleKey: 'systems',
      links: [
        { label: 'اتوماسیون اداری', href: '/it' },
        { label: 'ایمیل سازمانی', href: '/it' },
        { label: 'حضور و غیاب', href: '/it' },
        { label: 'درگاه پژوهش', href: '/departments/research' },
      ],
    },
    {
      titleKey: 'support',
      links: [
        { label: 'ثبت تیکت', href: '/dashboard/tickets' },
        { label: 'پرسش‌های متداول', href: '/contact' },
        { label: 'راهنمای کاربران', href: '/help' },
        { label: 'فناوری اطلاعات', href: '/it' },
      ],
    },
  ]

  return (
    <footer className="mt-4 border-t border-border bg-navy text-white/80">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-6 py-10 md:grid-cols-4">
        <div className="space-y-3">
          <PortalLogo variant="inverse" />
          <p className="text-sm leading-relaxed text-white/60">{t('about')}</p>
        </div>
        {columns.map((col) => (
          <nav key={col.titleKey} aria-label={t(col.titleKey)}>
            <h3 className="mb-3 text-sm font-bold text-white">{t(col.titleKey)}</h3>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-brand"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-[1440px] px-6 py-4 text-center text-xs text-white/50">
          {t('copyright')}
          <br />
          {t('developer')}
        </p>
      </div>
    </footer>
  )
}
