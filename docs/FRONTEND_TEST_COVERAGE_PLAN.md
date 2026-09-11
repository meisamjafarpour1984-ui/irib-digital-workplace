# برنامه افزایش پوشش تست فرانت‌اند

## وضعیت فعلی

- **تست‌های موجود**: 4 فایل (api-client.test.ts, jalali.test.ts, utils.test.ts, validators.test.ts)
- **پوشش برآوردی**: 10-15%
- **framework**: Vitest
- **environment**: jsdom

## اهداف

- پوشش حداقل 50% برای critical components
- پوشش 70% برای core utilities
- پوشش 30% برای UI components

## برنامه اجرایی

### فاز 1: Critical Utilities (Priorità بالا)

**هدف**: پوشش 70% تا 1 هفته

#### فایل‌های هدف

1. `lib/api-client.ts` - API communication
2. `lib/services/auth.ts` - Authentication logic
3. `lib/services/content.ts` - Content management
4. `lib/dashboard-data.ts` - Dashboard data fetching
5. `hooks/use-portal-content.ts` - Content hooks

#### تست‌های مورد نیاز

```typescript
// tests/lib/api-client.test.ts (expand existing)
describe('APIClient', () => {
  it('should handle successful requests', () => {})
  it('should handle authentication errors', () => {})
  it('should retry failed requests', () => {})
  it('should handle network errors', () => {})
  it('should timeout after configured duration', () => {})
})

// tests/lib/services/auth.test.ts (new)
describe('AuthService', () => {
  it('should login with valid credentials', () => {})
  it('should handle login failures', () => {})
  it('should logout correctly', () => {})
  it('should refresh tokens', () => {})
  it('should handle OTP verification', () => {})
})
```

### فاز 2: Core Components (Priorità متوسط)

**هدف**: پوشش 50% تا 2 هفته

#### فایل‌های هدف

1. `components/auth/auth-button.tsx`
2. `components/dashboard/dashboard-sidebar.tsx`
3. `components/portal/portal-header.tsx`
4. `components/widgets/*.tsx` (critical widgets)

#### تست‌های مورد نیاز

```typescript
// tests/components/auth/auth-button.test.tsx (new)
describe('AuthButton', () => {
  it('should render login button when not authenticated', () => {})
  it('should render logout button when authenticated', () => {})
  it('should call login handler on click', () => {})
  it('should show loading state during authentication', () => {})
})

// tests/components/widgets/admin-kpi.test.tsx (new)
describe('AdminKPI', () => {
  it('should render KPI cards', () => {})
  it('should handle data updates', () => {})
  it('should show loading state', () => {})
  it('should handle errors gracefully', () => {})
})
```

### فاز 3: Page Components (Priorità پایین)

**هدف**: پوشش 30% تا 3 هفته

#### فایل‌های هدف

1. `app/(public)/page.tsx` - Homepage
2. `app/(authenticated)/dashboard/page.tsx` - Dashboard
3. `app/(admin)/admin/page.tsx` - Admin panel

#### تست‌های مورد نیاز

```typescript
// tests/app/homepage.test.tsx (new)
describe('Homepage', () => {
  it('should render hero section', () => {})
  it('should render quick access links', () => {})
  it('should render latest news', () => {})
  it('should handle navigation', () => {})
})
```

## ابزارها و تنظیمات

### به‌روزرسانی vitest.config.ts

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/middleware.ts',
        'app/api/',
      ],
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 40,
        statements: 50,
      },
    },
  },
})
```

### به‌روزرسانی package.json scripts

```json
{
  "scripts": {
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:unit:coverage": "vitest run --coverage",
    "test:component": "vitest run --config vitest.component.config.ts"
  }
}
```

## CI/CD Integration

### به‌روزرسانی .github/workflows/ci-cd.yml

```yaml
test-frontend:
  name: Test Frontend
  runs-on: ubuntu-latest
  needs: lint-and-typecheck

  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup pnpm
      uses: pnpm/action-setup@v2
      with:
        version: ${{ env.PNPM_VERSION }}

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'pnpm'

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Run unit tests
      run: pnpm test:unit

    - name: Run test coverage
      run: pnpm test:unit:coverage

    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/coverage-final.json
        flags: frontend
        name: frontend-coverage
        fail_ci_if_error: true
```

## مراحل اجرا

### هفته 1

- [ ] به‌روزرسانی vitest.config.ts با coverage thresholds
- [ ] نوشتن تست‌های برای lib/api-client.ts
- [ ] نوشتن تست‌های برای lib/services/auth.ts
- [ ] نوشتن تست‌های برای hooks/use-portal-content.ts
- [ ] اضافه کردن coverage thresholds به CI

### هفته 2

- [ ] نوشتن تست‌های برای components/auth/
- [ ] نوشتن تست‌های برای components/dashboard/
- [ ] نوشتن تست‌های برای critical widgets
- [ ] بررسی و بهبود coverage report

### هفته 3

- [ ] نوشتن تست‌های برای page components
- [ ] نوشتن تست‌های برای remaining utilities
- [ ] نهایی‌سازی coverage thresholds
- [ ] documentation و team training

## معیار موفقیت

- ✅ Coverage lines: ≥50%
- ✅ Coverage functions: ≥50%
- ✅ Coverage branches: ≥40%
- ✅ Coverage statements: ≥50%
- ✅ All critical paths covered
- ✅ CI fail اگر coverage پایین بیاید

## منابع

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [React Testing Library](https://testing-library.com/react)

## تاریخچه

- 2026-09-11: برنامه‌ریزی برای افزایش پوشش تست فرانت‌اند
