/**
 * IRIB Digital Workplace Platform - API Load Testing with k6 (P1-1)
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

// Custom metrics
const errorRate = new Rate('errors')

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 10 },    // Stay at 10 users
    { duration: '30s', target: 50 },   // Ramp up to 50 users
    { duration: '1m', target: 50 },    // Stay at 50 users
    { duration: '30s', target: 100 },  // Ramp up to 100 users
    { duration: '1m', target: 100 },   // Stay at 100 users
    { duration: '30s', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.05'], // Error rate must be below 5%
    errors: ['rate<0.05'],
  },
}

const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api/v1'

// Helper function for authentication
function authenticate() {
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    personnelCode: '10001',
    password: 'TestPassword123!',
  }), {
    headers: { 'Content-Type': 'application/json' },
  })

  if (loginRes.status === 200) {
    return loginRes.json('accessToken')
  }
  return null
}

export default function () {
  // Authenticate
  const token = authenticate()
  if (!token) {
    errorRate.add(1)
    return
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }

  // Test 1: Get user profile
  const profileRes = http.get(`${BASE_URL}/users/me`, { headers })
  check(profileRes, {
    'profile status is 200': (r) => r.status === 200,
    'profile has data': (r) => r.json('id') !== undefined,
  }) || errorRate.add(1)

  sleep(1)

  // Test 2: Get notifications
  const notifRes = http.get(`${BASE_URL}/notifications?limit=10`, { headers })
  check(notifRes, {
    'notifications status is 200': (r) => r.status === 200,
    'notifications is array': (r) => Array.isArray(r.json()),
  }) || errorRate.add(1)

  sleep(1)

  // Test 3: Get analytics KPIs
  const kpiRes = http.get(`${BASE_URL}/analytics/kpis`, { headers })
  check(kpiRes, {
    'kpis status is 200': (r) => r.status === 200,
    'kpis has data': (r) => r.json('activeUsers') !== undefined,
  }) || errorRate.add(1)

  sleep(1)

  // Test 4: Get audit logs (tests partitioned table)
  const auditRes = http.get(`${BASE_URL}/audit/logs?page=1&limit=10`, { headers })
  check(auditRes, {
    'audit logs status is 200': (r) => r.status === 200,
    'audit logs has pagination': (r) => r.json('pagination') !== undefined,
  }) || errorRate.add(1)

  sleep(2)
}

export function handleSummary(data) {
  console.log('=== Load Test Summary ===')
  console.log(`Total Requests: ${data.metrics.http_reqs.count}`)
  console.log(`Failed Requests: ${data.metrics.http_req_failed.count}`)
  console.log(`Error Rate: ${(data.metrics.http_req_failed.rate * 100).toFixed(2)}%`)
  console.log(`95th Percentile: ${data.metrics.http_req_duration.values['p(95)']}ms`)
  console.log(`99th Percentile: ${data.metrics.http_req_duration.values['p(99)']}ms`)
}
