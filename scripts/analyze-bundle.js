#!/usr/bin/env node
// Bundle Analyzer Script
// Run: node scripts/analyze-bundle.js

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log('Analyzing bundle size...\n')

// Run build with ANALYZE=true
try {
  execSync('pnpm build', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, ANALYZE: 'true' },
  })
} catch {
  console.error('Build failed')
  process.exit(1)
}

// Check build output size
const buildDir = path.resolve(__dirname, '..', '.next')
const staticDir = path.join(buildDir, 'static')

if (fs.existsSync(staticDir)) {
  const files = fs.readdirSync(staticDir, { recursive: true })
  let totalSize = 0
  const jsFiles = []
  const cssFiles = []

  files.forEach((file) => {
    const filePath = path.join(staticDir, file.toString())
    const stats = fs.statSync(filePath)
    totalSize += stats.size

    if (file.toString().endsWith('.js')) {
      jsFiles.push({ name: file.toString(), size: stats.size })
    } else if (file.toString().endsWith('.css')) {
      cssFiles.push({ name: file.toString(), size: stats.size })
    }
  })

  console.log('=== Bundle Analysis Report ===\n')
  console.log(`Total build size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
  console.log(`JS files: ${jsFiles.length}`)
  console.log(`CSS files: ${cssFiles.length}`)

  // Sort by size and show top 10
  jsFiles.sort((a, b) => b.size - a.size)
  console.log('\nTop 10 JS bundles:')
  jsFiles.slice(0, 10).forEach((f) => {
    console.log(`  ${(f.size / 1024).toFixed(1)} KB - ${f.name}`)
  })
}
