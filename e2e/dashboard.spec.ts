// ============================================================
// IRIB DWP — Dashboard E2E Tests
// Tests: Dashboard Layout, KPI Cards, Charts
// ============================================================

import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('should display dashboard layout', async ({ page }) => {
    await expect(page.getByText('داشبورد مدیریتی')).toBeVisible()
  })

  test('should display sidebar navigation', async ({ page }) => {
    await expect(page.getByText('مدیریت سامانه')).toBeVisible()
    await expect(page.getByText('مرکز آذربایجان شرقی')).toBeVisible()
  })

  test('should display KPI cards', async ({ page }) => {
    await expect(page.getByText('بازدید امروز')).toBeVisible()
    await expect(page.getByText('کاربران فعال')).toBeVisible()
    await expect(page.getByText('اطلاعیه‌ها')).toBeVisible()
    await expect(page.getByText('نظرسنجی‌ها')).toBeVisible()
  })

  test('should display charts section', async ({ page }) => {
    await expect(page.getByText('نمودار بازدیدها')).toBeVisible()
    await expect(page.getByText('منابع ترافیک')).toBeVisible()
  })

  test('should display activity list', async ({ page }) => {
    await expect(page.getByText('آخرین فعالیت‌ها')).toBeVisible()
  })

  test('should display tickets list', async ({ page }) => {
    await expect(page.getByText('آخرین تیکت‌ها')).toBeVisible()
  })

  test('should have search functionality', async ({ page }) => {
    const searchInput = page.getByPlaceholder('جستجو در سامانه مدیریت...')
    await expect(searchInput).toBeVisible()
  })

  test('should display user menu', async ({ page }) => {
    await expect(page.getByText('مدیر سیستم')).toBeVisible()
  })
})

test.describe('Content Manager', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/content')
  })

  test('should display content table', async ({ page }) => {
    await expect(page.getByText('مدیریت محتوا')).toBeVisible()
    await expect(page.getByText('عنوان')).toBeVisible()
    await expect(page.getByText('وضعیت')).toBeVisible()
  })

  test('should have create content button', async ({ page }) => {
    await expect(page.getByText('محتوای جدید')).toBeVisible()
  })

  test('should have filter tabs', async ({ page }) => {
    await expect(page.getByText('همه محتوا')).toBeVisible()
    await expect(page.getByText('در حال بازبینی')).toBeVisible()
  })

  test('should have search functionality', async ({ page }) => {
    const searchInput = page.getByPlaceholder('جستجو در محتوا...')
    await expect(searchInput).toBeVisible()
  })
})

test.describe('Inbox', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/inbox')
  })

  test('should display inbox layout', async ({ page }) => {
    await expect(page.getByText('کارتابل ارتباطات')).toBeVisible()
  })

  test('should display conversation list', async ({ page }) => {
    await expect(page.getByText('درخواست دسترسی به آرشیو تصویری')).toBeVisible()
  })

  test('should have filter tabs', async ({ page }) => {
    await expect(page.getByText('منتسب به من')).toBeVisible()
    await expect(page.getByText('ایجاد شده توسط من')).toBeVisible()
  })

  test('should display message composer', async ({ page }) => {
    await expect(page.getByPlaceholder('پیام خود را بنویسید...')).toBeVisible()
  })
})
