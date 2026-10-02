/**
 * IRIB Digital Workplace Platform - Connection Pool Load Testing with k6 (P1-1)
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'

// Custom metrics
const errorRate = new Rate('errors')
const dbLatency = new Trend('db_latency')

// Test configuration - High concurrency to test connection pool
export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Ramp up to 20 concurrent users
    { duration: '2m', target: 50 },    // Ramp up to 50 concurrent users
    { duration: '2m', target: 100 },   // Ramp up to 100 concurrent users
    { duration: '2m', target: 200 },   // Ramp up to 200 concurrent users (stress test)
    { duration: '1m', target: 200 },   // Stay at 200 concurrent users
    { duration: '30s', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<800', 'p(99)<2000'], // Allow higher latency under load
    http_req_failed: ['rate<0.1'], // Allow 10% error rate under stress
    errors: ['rate<0.1'],
    db_latency: ['p(95)<500'],
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

  // Test 1: Multiple concurrent database reads (tests connection pool)
  const startTime = new Date()
  const contentRes = http.get(`${BASE_URL}/content?page=1&limit=50`, { headers })
  const dbTime = new Date() - startTime
  dbLatency.add(dbTime)
  
  check(contentRes, {
    'content status is 200': (r) => r.status === 200,
    'content has items': (r) => Array.isArray(r.json('items')),
  }) || errorRate.add(1)

  sleep(0.5)

  // Test 2: Write operation (tests pool for writes)
  const auditStart = new Date()
  const auditRes = http.post(`${BASE_URL}/audit/log`, JSON.stringify({
    action: 'TEST_ACTION',
    entity: 'LoadTest',
    metadata: { test: 'connection-pool' },
  }), { headers })
  const auditTime = new Date() - auditStart
  dbLatency.add(auditTime)
  
  check(auditRes, {
    'audit log status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  }) || errorRate.add(1)

  sleep(0.5)

  // Test 3: Complex query with joins (tests pool efficiency)
  const complexStart = new Date()
  const analyticsRes = http.get(`${BASE_URL}/analytics/content-stats?period=week`, { headers })
  const complexTime = new Date() - complexStart
  dbLatency.add(complexTime)
  
  check(analyticsRes, {
    'analytics status is 200': (r) => r.status === 200,
    'analytics has stats': (r) => r.json('published') !== undefined,
  }) || errorRate.add(1)

  sleep(0.5)

  // Test 4: Paginated query on partitioned table
  const partitionStart = new Date()
  const auditLogsRes = http.get(`${BASE_URL}/audit/logs?page=1&limit=20`, { headers })
  const partitionTime = new Date() - partitionStart
  dbLatency.add(partitionTime)
  
  check(auditLogsRes, {
    'audit logs status is 200': (r) => r.status === 200,
    'audit logs has pagination': (r) => r.json('pagination') !== undefined,
  }) || errorRate.add(1)

  sleep(1)
}

export function handleSummary(data) {
  console.log('=== Connection Pool Load Test Summary ===')
  console.log(`Total Requests: ${data.metrics.http_reqs.count}`)
  console.log(`Failed Requests: ${data.metrics.http_req_failed.count}`)
  console.log(`Error Rate: ${(data.metrics.http_req_failed.rate * 100).toFixed(2)}%`)
  console.log(`95th Percentile: ${data.metrics.http_req_duration.values['p(95)']}ms`)
  console.log(`99th Percentile: ${data.metrics.http_req_duration.values['p(99)']}ms`)
  console.log(`DB Latency 95th: ${data.metrics.db_latency.values['p(95)']}ms`)
  console.log(`Max Concurrent Users: 200`)
  console.log('=== Connection Pool Recommendations ===')
  
  if (data.metrics.http_req_failed.rate > 0.05) {
    console.log('⚠️  High error rate detected - consider increasing connection pool size')
  }
  if (data.metrics.db_latency.values['p(95)'] > 500) {
    console.log('⚠️  High DB latency detected - consider optimizing queries or adding indexes')
  }
}
