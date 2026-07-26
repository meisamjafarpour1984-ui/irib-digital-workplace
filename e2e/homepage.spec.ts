// ============================================================
// IRIB DWP — Homepage E2E Tests
// Tests: Widget Rendering, Responsive, Interactive Elements
// ============================================================

import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display hero section', async ({ page }) => {
    const hero = page.locator('[aria-label="اخبار برگزیده"]')
    await expect(hero).toBeVisible()
  })

  test('should display quick access links', async ({ page }) => {
    await expect(page.getByText('دسترسی سریع به سامانه‌ها')).toBeVisible()
  })

  test('should display news timeline', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'آخرین اخبار', exact: true })).toBeVisible()
  })

  test('should display services grid', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'خدمات و سامانه‌ها' })).toBeVisible()
  })

  test('should display help cards', async ({ page }) => {
    await expect(page.getByText('ثبت تیکت پشتیبانی')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'پرسش‌های متداول' })).toBeVisible()
  })

  test('should display portal header', async ({ page }) => {
    await expect(page.getByRole('banner').getByText('صدا و سیمای آذربایجان شرقی')).toBeVisible()
  })

  test('should display portal footer', async ({ page }) => {
    await expect(page.getByText('کلیه حقوق این پرتال')).toBeVisible()
  })

  test('should have working search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder('جستجو در پورتال...')
    await expect(searchInput).toBeVisible()
    await searchInput.fill('اخبار')
    await expect(searchInput).toHaveValue('اخبار')
  })

  test('should display occasion banner', async ({ page }) => {
    await expect(page.getByText('مناسبت ملی گرامی باد')).toBeVisible()
  })

  test.describe('Responsive Design', () => {
    test('should show mobile menu on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      const menuButton = page.getByLabel('باز کردن منو')
      await expect(menuButton).toBeVisible()
    })

    test('should hide desktop nav on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      const desktopNav = page.locator('nav[aria-label="ناوبری اصلی"]')
      await expect(desktopNav).not.toBeVisible()
    })
  })
})
