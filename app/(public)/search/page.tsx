import { Suspense } from 'react'
import SearchContent from './search-content'
import { UtilityBar } from '@/components/portal/utility-bar'
import { PortalHeader } from '@/components/portal/portal-header'
import { PortalFooter } from '@/components/portal/portal-footer'
import { Container } from '@/components/layout/container'

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <UtilityBar />
      <PortalHeader />
      <Container>
        <Suspense
          fallback={
            <div className="py-8 text-center text-muted-foreground">در حال بارگذاری...</div>
          }
        >
          <SearchContent />
        </Suspense>
      </Container>
      <PortalFooter />
    </div>
  )
}
