import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/پرتال دیجیتال کارکنان/)
  })

  test('displays hero carousel', async ({ page }) => {
    await page.goto('/')
    const hero = page.locator('[aria-label="اخبار برگزیده"]')
    await expect(hero).toBeVisible()
  })

  test('displays quick access links', async ({ page }) => {
    await page.goto('/')
    const quickAccess = page.getByText('دسترسی سریع به سامانه‌ها')
    await expect(quickAccess).toBeVisible()
  })

  test('displays news timeline', async ({ page }) => {
    await page.goto('/')
    const news = page.getByText('آخرین اخبار')
    await expect(news).toBeVisible()
  })

  test('navigation works', async ({ page }) => {
    await page.goto('/')
    const dashboardLink = page.getByText('داشبورد مدیریتی')
    await expect(dashboardLink).toBeVisible()
  })
})

test.describe('Dashboard', () => {
  test('loads dashboard page', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('داشبورد مدیریتی')).toBeVisible()
  })
})

test.describe('IT Microsite', () => {
  test('loads IT page', async ({ page }) => {
    await page.goto('/departments/it')
    await expect(page.getByText('معاونت فناوری اطلاعات')).toBeVisible()
  })
})
