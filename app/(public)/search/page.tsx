/**
 * IRIB Digital Workplace Platform - Advanced Search Page
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Metadata } from 'next'
import { SearchClient } from './search-client'

export const metadata: Metadata = {
  title: 'جستجوی پیشرفته | درگاه دیجیتال کارکنان',
  description: 'جستجوی پیشرفته در محتوای درگاه',
}

export default function SearchPage() {
  return <SearchClient />
}
