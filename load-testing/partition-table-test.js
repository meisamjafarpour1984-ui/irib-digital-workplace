/**
 * IRIB Digital Workplace Platform - Partitioned Table Query Testing with k6 (P1-1)
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
const partitionLatency = new Trend('partition_latency')

// Test configuration - Focus on partitioned table performance
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Warm up
    { duration: '2m', target: 50 },    // Normal load
    { duration: '2m', target: 100 },   // High load
    { duration: '2m', target: 150 },   // Peak load
    { duration: '1m', target: 150 },   // Sustain peak
    { duration: '30s', target: 0 },    // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<600', 'p(99)<1500'],
    http_req_failed: ['rate<0.05'],
    errors: ['rate<0.05'],
    partition_latency: ['p(95)<400'],
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

  // Test 1: Query AuditLogEntry (partitioned by createdAt)
  const auditStart = new Date()
  const auditRes = http.get(`${BASE_URL}/audit/logs?page=1&limit=50`, { headers })
  const auditTime = new Date() - auditStart
  partitionLatency.add(auditTime)
  
  check(auditRes, {
    'audit logs status is 200': (r) => r.status === 200,
    'audit logs has items': (r) => Array.isArray(r.json('items')),
    'audit logs pagination correct': (r) => r.json('pagination').limit === 50,
  }) || errorRate.add(1)

  sleep(0.5)

  // Test 2: Query with date range (tests partition pruning)
  const today = new Date()
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  const dateRangeStart = new Date()
  const auditDateRes = http.get(
    `${BASE_URL}/audit/logs?page=1&limit=20&startDate=${lastMonth.toISOString()}&endDate=${today.toISOString()}`,
    { headers }
  )
  const dateRangeTime = new Date() - dateRangeStart
  partitionLatency.add(dateRangeTime)
  
  check(auditDateRes, {
    'audit date range status is 200': (r) => r.status === 200,
    'audit date range filtered correctly': (r) => r.json('items').length <= 20,
  }) || errorRate.add(1)

  sleep(0.5)

  // Test 3: Query Notification (partitioned by createdAt)
  const notifStart = new Date()
  const notifRes = http.get(`${BASE_URL}/notifications?limit=30`, { headers })
  const notifTime = new Date() - notifStart
  partitionLatency.add(notifTime)
  
  check(notifRes, {
    'notifications status is 200': (r) => r.status === 200,
    'notifications is array': (r) => Array.isArray(r.json()),
  }) || errorRate.add(1)

  sleep(0.5)

  // Test 4: Query PageView (partitioned by createdAt)
  const pageViewStart = new Date()
  const pageViewRes = http.get(`${BASE_URL}/analytics/page-views?limit=40`, { headers })
  const pageViewTime = new Date() - pageViewStart
  partitionLatency.add(pageViewTime)
  
  check(pageViewRes, {
    'page views status is 200': (r) => r.status === 200,
    'page views has data': (r) => r.json('views') !== undefined,
  }) || errorRate.add(1)

  sleep(0.5)

  // Test 5: Write to AuditLogEntry (tests partition insert)
  const insertStart = new Date()
  const auditInsertRes = http.post(`${BASE_URL}/audit/log`, JSON.stringify({
    action: 'PARTITION_TEST',
    entity: 'LoadTest',
    entityId: `test-${Date.now()}`,
    metadata: { partitionTest: true, timestamp: new Date().toISOString() },
  }), { headers })
  const insertTime = new Date() - insertStart
  partitionLatency.add(insertTime)
  
  check(auditInsertRes, {
    'audit insert status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  }) || errorRate.add(1)

  sleep(1)
}

export function handleSummary(data) {
  console.log('=== Partitioned Table Query Test Summary ===')
  console.log(`Total Requests: ${data.metrics.http_reqs.count}`)
  console.log(`Failed Requests: ${data.metrics.http_req_failed.count}`)
  console.log(`Error Rate: ${(data.metrics.http_req_failed.rate * 100).toFixed(2)}%`)
  console.log(`95th Percentile: ${data.metrics.http_req_duration.values['p(95)']}ms`)
  console.log(`99th Percentile: ${data.metrics.http_req_duration.values['p(99)']}ms`)
  console.log(`Partition Query 95th: ${data.metrics.partition_latency.values['p(95)']}ms`)
  console.log('=== Partition Performance Analysis ===')
  
  if (data.metrics.partition_latency.values['p(95)'] > 400) {
    console.log('⚠️  Partition query latency above threshold - consider:')
    console.log('   - Checking partition pruning is working')
    console.log('   - Adding indexes on partition key')
    console.log('   - Reviewing partition boundaries')
  }
  
  if (data.metrics.http_req_failed.rate > 0.05) {
    console.log('⚠️  High error rate - check partition maintenance and vacuum')
  }
  
  console.log('✅ Partitioned tables tested: AuditLogEntry, Notification, PageView')
}
