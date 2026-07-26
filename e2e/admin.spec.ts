// ============================================================
// IRIB DWP — Admin E2E Tests
// Tests: Admin Console, Page Builder, Theme Manager, RBAC
// ============================================================

import { test, expect } from '@playwright/test'

test.describe('Admin Console', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin')
  })

  test('should display admin hub', async ({ page }) => {
    await expect(page.getByText('کنسول مدیریت')).toBeVisible()
  })

  test('should display admin cards', async ({ page }) => {
    await expect(page.getByText('سازنده صفحه')).toBeVisible()
    await expect(page.getByText('مدیریت پوسته')).toBeVisible()
    await expect(page.getByText('مدیریت دسترسی‌ها')).toBeVisible()
    await expect(page.getByText('نمودار سازمانی')).toBeVisible()
    await expect(page.getByText('مدیریت استوریج')).toBeVisible()
    await expect(page.getByText('لاگ فعالیت‌ها')).toBeVisible()
  })
})

test.describe('Page Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/pages')
  })

  test('should display page builder', async ({ page }) => {
    await expect(page.getByText('سازنده صفحه')).toBeVisible()
  })

  test('should display widget palette', async ({ page }) => {
    await expect(page.getByText('ویجت‌ها')).toBeVisible()
  })

  test('should display device preview buttons', async ({ page }) => {
    await expect(page.getByLabel('دسکتاپ')).toBeVisible()
    await expect(page.getByLabel('تبلت')).toBeVisible()
    await expect(page.getByLabel('موبایل')).toBeVisible()
  })

  test('should have save button', async ({ page }) => {
    await expect(page.getByText('ذخیره')).toBeVisible()
  })
})

test.describe('Theme Manager', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/themes')
  })

  test('should display theme manager', async ({ page }) => {
    await expect(page.getByText('مدیریت پوسته')).toBeVisible()
  })

  test('should display color pickers', async ({ page }) => {
    await expect(page.getByText('رنگ‌ها و توکن‌ها')).toBeVisible()
  })

  test('should display occasion themes', async ({ page }) => {
    await expect(page.getByText('تم‌های مناسبتی')).toBeVisible()
    await expect(page.getByText('نوروز')).toBeVisible()
    await expect(page.getByText('محرم')).toBeVisible()
  })

  test('should display live preview', async ({ page }) => {
    await expect(page.getByText('پیش‌نمایش زنده')).toBeVisible()
  })
})

test.describe('RBAC Matrix', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/rbac')
  })

  test('should display RBAC matrix', async ({ page }) => {
    await expect(page.getByText('مدیریت دسترسی‌ها')).toBeVisible()
    await expect(page.getByText('ماتریس نقش‌ها و مجوزها')).toBeVisible()
  })

  test('should display role headers', async ({ page }) => {
    await expect(page.getByText('کارمند')).toBeVisible()
    await expect(page.getByText('کارشناس')).toBeVisible()
    await expect(page.getByText('مدیر معاونت')).toBeVisible()
  })
})

test.describe('Organization Chart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/org-chart')
  })

  test('should display org chart', async ({ page }) => {
    await expect(page.getByText('نمودار سازمانی')).toBeVisible()
  })

  test('should display add unit button', async ({ page }) => {
    await expect(page.getByText('افزودن واحد')).toBeVisible()
  })
})

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/users')
  })

  test('should display user management', async ({ page }) => {
    await expect(page.getByText('مدیریت کاربران')).toBeVisible()
  })

  test('should display user table', async ({ page }) => {
    await expect(page.getByText('نام')).toBeVisible()
    await expect(page.getByText('کد پرسنلی')).toBeVisible()
    await expect(page.getByText('واحد')).toBeVisible()
  })

  test('should have add user button', async ({ page }) => {
    await expect(page.getByText('کاربر جدید')).toBeVisible()
  })

  test('should have search functionality', async ({ page }) => {
    const searchInput = page.getByPlaceholder('جستجو در کاربران...')
    await expect(searchInput).toBeVisible()
  })
})
