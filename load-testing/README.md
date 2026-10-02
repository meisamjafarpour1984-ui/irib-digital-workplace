# Load Testing with k6 - IRIB Digital Workplace Platform

**تاریخ ایجاد:** ۱۴۰۵/۰۶/۱۸ (۲۰۲۶-۰۹-۰۸)  
**نسخه:** ۱.۰.۰  
**وضعیت:** P1-1 - پیاده‌سازی Load Testing با k6

---

## 📋 Overview

این مجموعه تست‌های Load Testing با استفاده از k6 برای اعتبارسنجی Connection Pooling و Partitioning جداول پایگاه داده طراحی شده است.

---

## 🚀 پیش‌نیازها

```bash
# نصب k6
choco install k6  # Windows
brew install k6   # macOS
```

---

## 📁 ساختار فایل‌ها

```
load-testing/
├── api-load-test.js           # تست بار عمومی API
├── connection-pool-test.js    # تست Connection Pool با همزمانی بالا
├── partition-table-test.js    # تست عملکرد جداول پارتیشن‌بندی شده
└── README.md                  # این فایل
```

---

## 🔧 تنظیمات محیط

```bash
# تنظیم URL API
export API_URL="http://localhost:3000/api/v1"

# یا در PowerShell
$env:API_URL="http://localhost:3000/api/v1"
```

---

## 🧪 اجرای تست‌ها

### 1. تست بار عمومی API

```bash
k6 run api-load-test.js
```

**هدف:** تست عملکرد کلی API با ۱۰۰ کاربر همزمان

**شامل:**

- احراز هویت کاربر
- دریافت پروفایل کاربر
- دریافت اعلان‌ها
- دریافت KPIs
- دریافت لاگ‌های Audit

---

### 2. تست Connection Pool

```bash
k6 run connection-pool-test.js
```

**هدف:** اعتبارسنجی Connection Pool با ۲۰۰ کاربر همزمان

**شامل:**

- خواندن‌های همزمان از دیتابیس
- عملیات نوشتن
- کوئری‌های پیچیده با JOIN
- کوئری‌های صفحه‌بندی روی جداول پارتیشن‌بندی شده

**آستانه‌ها:**

- ۹۵٪ درخواست‌ها < ۸۰۰ms
- نرخ خطا < ۱۰٪
- Latency دیتابیس ۹۵٪ < ۵۰۰ms

---

### 3. تست جداول پارتیشن‌بندی شده

```bash
k6 run partition-table-test.js
```

**هدف:** تست عملکرد Partition Pruning و کوئری‌های روی جداول پارتیشن‌بندی شده

**جداول تست شده:**

- AuditLogEntry (پارتیشن‌بندی شده توسط createdAt)
- Notification (پارتیشن‌بندی شده توسط createdAt)
- PageView (پارتیشن‌بندی شده توسط createdAt)

**آستانه‌ها:**

- ۹۵٪ درخواست‌ها < ۶۰۰ms
- نرخ خطا < ۵٪
- Latency پارتیشن ۹۵٪ < ۴۰۰ms

---

## 📊 نتایج تست

هر تست پس از اتمام یک خلاصه از نتایج را نمایش می‌دهد:

```
=== Load Test Summary ===
Total Requests: 1234
Failed Requests: 12
Error Rate: 0.97%
95th Percentile: 450ms
99th Percentile: 890ms
```

---

## 🔍 تحلیل نتایج

### Connection Pool

اگر نرخ خطا > ۵٪:

- اندازه Connection Pool را افزایش دهید
- تنظیمات PgBouncer را بررسی کنید

اگر Latency دیتابیس ۹۵٪ > ۵۰۰ms:

- کوئری‌ها را بهینه کنید
- Indexهای مناسب اضافه کنید

### Partitioned Tables

اگر Latency پارتیشن ۹۵٪ > ۴۰۰ms:

- Partition Pruning را بررسی کنید
- Index روی کلید پارتیشن اضافه کنید
- مرزهای پارتیشن را بازبینی کنید

---

## 📝 نکات مهم

1. **احراز هویت:** همه تست‌ها از یک کاربر تست استفاده می‌کنند. برای محیط production، کاربران متعدد ایجاد کنید.

2. **داده‌های تست:** مطمئن شوید که داده‌های کافی در دیتابیس برای تست‌های صفحه‌بندی وجود دارد.

3. **محیط تست:** این تست‌ها را روی محیط staging اجرا کنید، نه production.

4. **مانیتورینگ:** در حین اجرای تست، مانیتورینگ دیتابیس و API را فعال نگه دارید.

---

## 🔗 ارجاع‌ها

- [k6 Documentation](https://k6.io/docs/)
- [PostgreSQL Partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html)
- [Prisma Connection Pool](https://www.prisma.io/docs/concepts/components/prisma-client/connection-pool)
