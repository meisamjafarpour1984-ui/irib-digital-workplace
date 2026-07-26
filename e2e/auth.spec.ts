// ============================================================
// IRIB DWP — Authentication E2E Tests
// Tests: Login Flow, OTP Verification, Session Management
// ============================================================

import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login')

      await expect(page.getByLabel('کد پرسنلی')).toBeVisible()
      await expect(page.getByLabel('رمز عبور')).toBeVisible()
      await expect(page.getByRole('button', { name: 'ورود' })).toBeVisible()
    })

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto('/login')

      await page.getByRole('button', { name: 'ورود' }).click()

      // Form should not submit with empty fields
      await expect(page).toHaveURL('/login')
    })

    test('should toggle password visibility', async ({ page }) => {
      await page.goto('/login')

      const passwordInput = page.getByLabel('رمز عبور')
      const toggleButton = page.getByLabel('نمایش رمز')

      await expect(passwordInput).toHaveAttribute('type', 'password')
      await toggleButton.click()
      await expect(passwordInput).toHaveAttribute('type', 'text')
      await toggleButton.click()
      await expect(passwordInput).toHaveAttribute('type', 'password')
    })

    test('should navigate to registration page', async ({ page }) => {
      await page.goto('/login')

      await page.getByText('ثبت‌نام جدید').click()
      await expect(page).toHaveURL('/mobile/register')
    })
  })

  test.describe('Registration Flow', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/mobile/register')

      await expect(page.getByText('ثبت‌نام در پرتال')).toBeVisible()
      await expect(page.getByText('کد پرسنلی')).toBeVisible()
    })

    test('should show OTP step after registration', async ({ page }) => {
      await page.goto('/mobile/register')

      // Fill registration form
      await page.getByPlaceholder('کد پرسنلی خود را وارد کنید').fill('12345')
      await page.getByPlaceholder('09xxxxxxxxx').fill('09123456789')

      // Click register button
      await page.getByRole('button', { name: 'ارسال کد تأیید' }).click()

      // Should show OTP step
      await expect(page.getByText('کد تأیید')).toBeVisible()
    })
  })
})

test.describe('Navigation', () => {
  test('should navigate between main pages', async ({ page }) => {
    // Homepage
    await page.goto('/')
    await expect(page).toHaveTitle(/صدا و سیما/)

    // Login
    await page.goto('/login')
    await expect(page.getByText('ورود به پرتال')).toBeVisible()

    // Search
    await page.goto('/search')
    await expect(page.getByText('جستجو')).toBeVisible()

    // Mobile Welcome
    await page.goto('/mobile/welcome')
    await expect(page.getByText('پرتال IRIB در موبایل')).toBeVisible()
  })

  test('should navigate department microsites', async ({ page }) => {
    await page.goto('/departments/it')
    await expect(page.getByText('فناوری اطلاعات')).toBeVisible()

    await page.goto('/departments/research')
    await expect(page.getByText('پژوهش')).toBeVisible()

    await page.goto('/departments/production')
    await expect(page.getByText('تولید')).toBeVisible()
  })
})
