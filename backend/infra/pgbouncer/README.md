# PgBouncer Setup - IRIB Digital Workplace Platform

**تاریخ ایجاد:** ۱۴۰۵/۰۶/۱۸ (۲۰۲۶-۰۹-۰۸)  
**نسخه:** ۱.۰.۰  
**وضعیت:** P1-2 - راه‌اندازی Production PgBouncer با Transaction Pooling

---

## 📋 Overview

PgBouncer یک connection pooler برای PostgreSQL است که با Transaction Pooling به بهینه‌سازی استفاده از اتصال‌های دیتابیس کمک می‌کند.

---

## 🔧 Configuration

### Pooling Mode: Transaction

- هر تراکنش یک اتصال جداگانه از pool دریافت می‌کند
- مناسب برای serverless و microservices
- سازگار با Prisma relationMode="prisma"

### Connection Limits

- **max_client_conn:** ۱۰۰۰ (حداکثر اتصال کلاینت)
- **default_pool_size:** ۲۵ (اندازه پیش‌فرض pool)
- **min_pool_size:** ۵ (حداقل اتصال در pool)
- **reserve_pool_size:** ۵ (reserve pool برای peak times)

---

## 🚀 Deployment

### Kubernetes Deployment

```bash
kubectl apply -f backend/infra/pgbouncer/deployment.yaml
```

### Manual Deployment

```bash
docker run -d \
  --name pgbouncer \
  -p 6432:6432 \
  -v $(pwd)/pgbouncer.ini:/etc/pgbouncer/pgbouncer.ini \
  pgbouncer/pgbouncer:latest
```

---

## 🔗 Prisma Configuration

### Development (Direct Connection)

```env
DATABASE_URL=postgresql://irib_admin:irib_secret_2024@localhost:5433/irib_dwp
```

### Production (via PgBouncer)

```env
DATABASE_URL=postgresql://irib_admin:irib_secret_2024@pgbouncer:6432/irib_dwp
```

### Prisma Schema Settings

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"  // Required for PgBouncer transaction pooling
}
```

---

## 📊 Monitoring

### PgBouncer Stats

```bash
# Connect to pgbouncer admin console
psql -h pgbouncer -p 6432 -U pgbouncer_admin pgbouncer

# Show stats
SHOW STATS;

# Show pools
SHOW POOLS;

# Show databases
SHOW DATABASES;
```

### Prometheus Metrics

PgBouncer metrics را می‌توان از طریق Prometheus exporter جمع‌آوری کرد.

---

## 🔒 Security

### Authentication

- **auth_type:** md5
- **admin_users:** pgbouncer_admin
- **stats_users:** pgbouncer_stats

### TLS (Optional)

برای production، TLS را در `pgbouncer.ini` فعال کنید:

```ini
tls_ca_file = /etc/pgbouncer/ca.crt
tls_cert_file = /etc/pgbouncer/server.crt
tls_key_file = /etc/pgbouncer/server.key
```

---

## 📝 Best Practices

1. **Transaction Pooling:** برای اکثر کاربردها مناسب است
2. **Session Pooling:** برای برنامه‌هایی که نیاز به session features دارند
3. **Statement Pooling:** برای برنامه‌هایی با queryهای ساده و تکراری

---

## 🐛 Troubleshooting

### Connection Exhausted

- افزایش `default_pool_size`
- بررسی connection leaks در application

### High Latency

- بررسی `server_connect_timeout`
- بررسی network latency به PostgreSQL

### Pool Starvation

- افزایش `reserve_pool_size`
- کاهش `server_idle_timeout`
