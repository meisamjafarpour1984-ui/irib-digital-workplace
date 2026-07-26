import { notFound } from 'next/navigation'
import { Container } from '@/components/layout/container'
import { Section } from '@/components/layout/section'
import { GridLayout } from '@/components/layout/grid-layout'
import { MicrositeNav } from '@/components/microsite/microsite-nav'
import { MicrositeHero } from '@/components/microsite/microsite-hero'
import { SoftwareList } from '@/components/microsite/software-list'
import { ItAnnouncements } from '@/components/microsite/it-announcements'
import { ItNews } from '@/components/microsite/it-news'
import { MicroActions } from '@/components/microsite/micro-actions'
import { PortalFooter } from '@/components/portal/portal-footer'

// Department configs
const departments: Record<
  string,
  {
    name: string
    subtitle: string
    description: string
    heroImage: string
    theme?: { primary: string }
  }
> = {
  it: {
    name: 'فناوری اطلاعات',
    subtitle: 'نوآوری، پشتیبانی، توسعه',
    description:
      'معاونت فناوری اطلاعات با هدف پشتیبانی از زیرساخت‌های فنی و ارائه خدمات نوین به کارکنان، همواره در مسیر تحول دیجیتال سازمان گام برمی‌دارد.',
    heroImage: '/images/it-hero.png',
  },
  research: {
    name: 'پژوهش',
    subtitle: 'تحقیق، نوآوری، توسعه دانش',
    description:
      'معاونت پژوهش با هدف ارتقای سطح علمی و پژوهشی مرکز، همواره در مسیر تولید دانش نوین گام برمی‌دارد.',
    heroImage: '/images/research-hero.png',
  },
  production: {
    name: 'تولید',
    subtitle: 'تولید محتوای فاخر',
    description:
      'معاونت تولید با هدف تولید برنامه‌های با کیفیت و متنوع، همواره در مسیر خلاقیت و نوآوری گام برمی‌دارد.',
    heroImage: '/images/production-hero.png',
  },
}

interface DepartmentPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return Object.keys(departments).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: DepartmentPageProps) {
  const { slug } = await params
  const dept = departments[slug]
  if (!dept) return { title: 'صفحه یافت نشد' }
  return {
    title: `معاونت ${dept.name} | پرتال دیجیتال کارکنان`,
    description: dept.description,
  }
}

export default async function DepartmentPage({ params }: DepartmentPageProps) {
  const { slug } = await params
  const dept = departments[slug]

  if (!dept) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Section>
        <Container>
          <MicrositeNav />
          <div className="mt-6">
            <MicrositeHero />
          </div>

          <GridLayout cols={2} gap="lg" className="mt-6">
            <ItAnnouncements />
            <SoftwareList />
          </GridLayout>

          <div className="mt-6">
            <MicroActions />
          </div>

          <div className="mt-6">
            <ItNews />
          </div>
        </Container>
      </Section>
      <PortalFooter />
    </div>
  )
}
