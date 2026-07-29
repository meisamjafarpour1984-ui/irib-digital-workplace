import { PortalLogo } from './portal-logo'

const columns = [
  {
    title: 'دسترسی سریع',
    links: ['صفحه اصلی', 'اخبار مرکز', 'خدمات و سامانه‌ها', 'تماس با ما'],
  },
  {
    title: 'سامانه‌ها',
    links: ['اتوماسیون اداری', 'ایمیل سازمانی', 'حضور و غیاب', 'پرتال پژوهش'],
  },
  {
    title: 'پشتیبانی',
    links: ['ثبت تیکت', 'پرسش‌های متداول', 'راهنمای کاربران', 'فناوری اطلاعات'],
  },
]

export function PortalFooter() {
  return (
    <footer className="mt-4 border-t border-border bg-navy text-white/80">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-6 py-10 md:grid-cols-4">
        <div className="space-y-3">
          <PortalLogo variant="inverse" />
          <p className="text-sm leading-relaxed text-white/60">
            واحد فناوری اطلاعات صدا و سیمای مرکز آذربایجان شرقی
          </p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="mb-3 text-sm font-bold text-white">{col.title}</h3>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="/" className="text-sm text-white/60 transition-colors hover:text-brand">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-[1440px] px-6 py-4 text-center text-xs text-white/50">
          کلیه حقوق این پرتال متعلق به صدا و سیمای مرکز آذربایجان شرقی است. © ۱۴۰۴
        </p>
      </div>
    </footer>
  )
}
