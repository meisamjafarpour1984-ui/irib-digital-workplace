/**
 * IRIB Digital Workplace Platform - Export/Import Service
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable, Logger } from '@nestjs/common'

type ExportRow = Record<string, unknown>

@Injectable()
export class ExportImportService {
  private readonly logger = new Logger(ExportImportService.name)

  exportToCSV(data: ExportRow[], filename: string): { filename: string; content: string } {
    try {
      if (!data || data.length === 0) {
        throw new Error('No data to export')
      }

      const headers = Object.keys(data[0])
      const rows = data.map((item) =>
        headers.map((header) => {
          const value = item[header]
          if (value === null || value === undefined) return ''
          if (typeof value === 'object') return JSON.stringify(value)
          return String(value)
        })
      )

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n')

      return {
        filename: `${filename}-${new Date().toISOString().split('T')[0]}.csv`,
        content: csvContent,
      }
    } catch (error) {
      this.logger.error('Error exporting to CSV:', error)
      throw new Error('Failed to export to CSV')
    }
  }

  exportToJSON(data: ExportRow[], filename: string): { filename: string; content: string } {
    try {
      if (!data || data.length === 0) {
        throw new Error('No data to export')
      }

      const jsonContent = JSON.stringify(data, null, 2)

      return {
        filename: `${filename}-${new Date().toISOString().split('T')[0]}.json`,
        content: jsonContent,
      }
    } catch (error) {
      this.logger.error('Error exporting to JSON:', error)
      throw new Error('Failed to export to JSON')
    }
  }

  parseCSV(csvContent: string): ExportRow[] {
    try {
      const lines = csvContent.trim().split('\n')
      if (lines.length < 2) {
        throw new Error('Invalid CSV format')
      }

      const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim())
      const rows = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.replace(/^"|"$/g, '').trim())
        const obj: Record<string, string> = {}
        headers.forEach((header, index) => {
          obj[header] = values[index] || ''
        })
        return obj
      })

      return rows
    } catch (error) {
      this.logger.error('Error parsing CSV:', error)
      throw new Error('Failed to parse CSV')
    }
  }

  parseJSON(jsonContent: string): unknown[] {
    try {
      const data = JSON.parse(jsonContent)
      if (!Array.isArray(data)) {
        throw new Error('JSON must be an array')
      }
      return data
    } catch (error) {
      this.logger.error('Error parsing JSON:', error)
      throw new Error('Failed to parse JSON')
    }
  }

  validateImportData(
    data: ExportRow[],
    requiredFields: string[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data || data.length === 0) {
      errors.push('No data to import')
      return { valid: false, errors }
    }

    requiredFields.forEach((field) => {
      if (!Object.prototype.hasOwnProperty.call(data[0], field)) {
        errors.push(`Missing required field: ${field}`)
      }
    })

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}
