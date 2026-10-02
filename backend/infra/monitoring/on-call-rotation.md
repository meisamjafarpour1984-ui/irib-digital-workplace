# On-Call Rotation Setup - IRIB Digital Workplace Platform

**تاریخ ایجاد:** ۱۴۰۵/۰۶/۱۸ (۲۰۲۶-۰۹-۰۸)  
**نسخه:** ۱.۰.۰  
**وضعیت:** P1-5 - پیاده‌سازی Alerting و On-Call Rotation

---

## 📋 Overview

این مستند راهنمای راه‌اندازی On-Call Rotation برای تیم‌های فنی IRIB Digital Workplace Platform است.

---

## 🏢 تیم‌های On-Call

### Backend Team

- **مسئول:** تیم Backend Development
- **پوشش:** API errors, High latency, Service downtime, Memory issues
- **زمان پاسخگویی:** ۱۵ دقیقه برای critical alerts

### Database Team

- **مسئول:** تیم Database Administration
- **پوشش:** Database connections, Slow queries, Replication lag, Database downtime
- **زمان پاسخگویی:** ۱۰ دقیقه برای critical alerts

### Infrastructure Team

- **مسئول:** تیم Infrastructure & DevOps
- **پوشش:** Redis, Kafka, System resources (CPU, Memory, Disk), Node availability
- **زمان پاسخگویی:** ۱۰ دقیقه برای critical alerts

---

## 📅 نوبت‌دهی On-Call

### هفتگی Rotation

- هر تیم یک هفته مسئول On-Call است
- Rotation هر دوشنبه ساعت ۰۹:۰۰ تغییر می‌کند
- Schedule در Google Calendar مدیریت می‌شود

### Schedule Template

```
Week 1: Backend Team
Week 2: Database Team
Week 3: Infrastructure Team
Week 4: Backend Team
(Repeat)
```

---

## 🔔 Alert Routing

### Critical Alerts (Severity: critical)

- **Channel:** SMS + Email + PagerDuty
- **Response Time:** ۱۰-۱۵ دقیقه
- **Escalation:** اگر در ۳۰ دقیقه پاسخ داده نشد → escalate به team lead

### Warning Alerts (Severity: warning)

- **Channel:** Email + Slack
- **Response Time:** ۱ ساعت
- **Escalation:** اگر در ۴ ساعت پاسخ داده نشد → escalate به team lead

---

## 📱 Notification Channels

### 1. PagerDuty

- **Integration:** Prometheus Alertmanager → PagerDuty
- **Service:** IRIB DWP Production
- **Escalation Policy:**
  - Level 1: On-Call Engineer (۱۰ min)
  - Level 2: Team Lead (۳۰ min)
  - Level 3: Engineering Manager (۱ hour)

### 2. Slack

- **Channels:**
  - `#dwp-alerts-critical` - Critical alerts only
  - `#dwp-alerts-warning` - Warning alerts
  - `#dwp-on-call` - On-Call coordination

### 3. Email

- **Recipients:** On-Call engineer email
- **Format:** Alert summary + runbook link + Grafana dashboard link

### 4. SMS

- **Provider:** IdehPayam (configured in SMS module)
- **Trigger:** Critical alerts only
- **Content:** Alert summary + action required

---

## 🚨 Alert Severity Levels

### Critical

- Service down (Backend, Database, Redis, Kafka)
- High error rate (> ۵٪)
- Database connection pool exhausted
- Disk space > ۹۰٪
- Node down

### Warning

- High latency (p95 > ۱s)
- High memory usage (> ۵۱۲ MB)
- Slow database queries
- High CPU usage (> ۸۰٪)
- Kafka consumer lag > ۱۰۰۰

---

## 📚 Runbooks

هر alert دارای runbook اختصاصی است:

- [High Error Rate](https://docs.irib.ir/runbooks/high-error-rate)
- [High Latency](https://docs.irib.ir/runbooks/high-latency)
- [Service Down](https://docs.irib.ir/runbooks/service-down)
- [High DB Connections](https://docs.irib.ir/runbooks/high-db-connections)
- [Slow Queries](https://docs.irib.ir/runbooks/slow-queries)
- [Database Down](https://docs.irib.ir/runbooks/database-down)
- [Redis Down](https://docs.irib.ir/runbooks/redis-down)

---

## 🔄 Handoff Procedure

### End of Shift

1. Review open alerts in Grafana
2. Document any ongoing issues in `#dwp-on-call` Slack
3. Update handoff document
4. Notify next on-call engineer

### Start of Shift

1. Review handoff document
2. Check Grafana dashboards
3. Verify notification channels working
4. Acknowledge receipt in `#dwp-on-call`

---

## 📊 Monitoring Dashboards

### Grafana Dashboards

- **Main Dashboard:** IRIB DWP Dashboard
- **Alerts Dashboard:** Active alerts overview
- **System Dashboard:** CPU, Memory, Disk metrics
- **Database Dashboard:** PostgreSQL metrics
- **Kafka Dashboard:** Consumer lag, throughput

### Access

- URL: https://grafana.irib.ir
- Authentication: SSO with IRIB accounts

---

## 🆘 Emergency Contacts

### Team Leads

- **Backend Lead:** backend-lead@irib.ir
- **Database Lead:** dba-lead@irib.ir
- **Infrastructure Lead:** infra-lead@irib.ir

### Engineering Manager

- **Manager:** eng-manager@irib.ir
- **Phone:** +98 21 XXXX XXXX (emergency only)

---

## 🧪 Testing Alerts

### Weekly Test

- هر جمعه ساعت ۱۴:۰۰ یک test alert ارسال می‌شود
- هدف: بررسی عملکرد notification channels
- Action: On-Call engineer باید در Slack ack کند

### Monthly Drill

- آخرین سه‌شنبه هر ماه
- Simulation of critical alert scenario
- Review response time and procedure

---

## 📝 Maintenance Windows

### Scheduled Maintenance

- **Time:** شنبه‌ها ساعت ۰۲:۰۰-۰۴:۰۰
- **Notification:** ۴۸ ساعت قبل اطلاع‌رسانی
- **Alert Suppression:** Alerts در این زمان suppressed می‌شوند

### Emergency Maintenance

- نیاز به approval از Engineering Manager
- Minimum ۲ ساعت notice
- Communication via `#dwp-announcements`

---

## 🔧 Configuration Files

### Prometheus Alerts

- **File:** `backend/infra/monitoring/alerts.yml`
- **Groups:** backend_alerts, database_alerts, redis_alerts, kafka_alerts, system_alerts
- **Total Alerts:** ۱۸ alert rules

### Alertmanager Config

- **File:** `backend/infra/monitoring/alertmanager.yml`
- **Routes:** Based on severity and team labels
- **Templates:** Custom notification templates

---

## 📈 Metrics to Monitor

### Key Metrics

- **API:** Request rate, Error rate, Latency (p50, p95, p99)
- **Database:** Connections, Query time, Locks, Replication lag
- **Redis:** Memory usage, Connections, Hit rate
- **Kafka:** Consumer lag, Throughput, Disk usage
- **System:** CPU, Memory, Disk, Network

### SLO Targets

- **API Availability:** ۹۹.۹٪
- **API Latency (p95):** < ۵۰۰ms
- **Database Availability:** ۹۹.۹۵٪
- **Redis Availability:** ۹۹.۹٪
- **Kafka Consumer Lag:** < ۱۰۰ messages

---

## 🎯 Best Practices

1. **Always acknowledge alerts** - even if investigating
2. **Document actions** - update runbooks with new findings
3. **Escalate early** - don't wait if unsure
4. **Communicate** - keep team informed via Slack
5. **Learn from incidents** - post-mortem for every critical incident
