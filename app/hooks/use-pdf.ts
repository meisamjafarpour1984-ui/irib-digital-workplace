/**
 * IRIB Digital Workplace Platform - PDF Hook
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export interface PdfTemplate {
  id: string
  name: string
  description: string
  category: string
  lastUsed: string
  usageCount: number
  createdAt: string
  updatedAt: string
  layout?: Record<string, unknown>
}

export interface GeneratedPdf {
  id: string
  templateId: string
  templateName: string
  fileName: string
  status: 'generating' | 'completed' | 'failed'
  generatedAt: string
  generatedBy: string
  fileSize?: number
  downloadUrl?: string
}

export interface PdfHistory {
  id: string
  action: 'created' | 'downloaded' | 'deleted'
  templateId: string
  templateName: string
  userId: string
  userName: string
  timestamp: string
}

export interface PdfStats {
  totalTemplates: number
  totalGenerated: number
  totalHistory: number
  totalDownloads: number
}

export function usePdf() {
  const [templates, setTemplates] = useState<PdfTemplate[]>([])
  const [generatedPdfs, setGeneratedPdfs] = useState<GeneratedPdf[]>([])
  const [history, setHistory] = useState<PdfHistory[]>([])
  const [stats, setStats] = useState<PdfStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = async () => {
    try {
      const data = await apiClient.get<PdfTemplate[]>('/pdf/templates')
      setTemplates(data || [])
    } catch (err) {
      console.error('Error fetching PDF templates:', err)
    }
  }

  const fetchGeneratedPdfs = async () => {
    try {
      const data = await apiClient.get<GeneratedPdf[]>('/pdf/generated')
      setGeneratedPdfs(data || [])
    } catch (err) {
      console.error('Error fetching generated PDFs:', err)
    }
  }

  const fetchHistory = async () => {
    try {
      const data = await apiClient.get<PdfHistory[]>('/pdf/history')
      setHistory(data || [])
    } catch (err) {
      console.error('Error fetching PDF history:', err)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await apiClient.get<PdfStats>('/pdf/stats')
      setStats(data)
    } catch (err) {
      console.error('Error fetching PDF stats:', err)
    }
  }

  const createTemplate = async (data: {
    name: string
    description: string
    category: string
    layout?: Record<string, unknown>
  }) => {
    try {
      const result = await apiClient.post<PdfTemplate>('/pdf/templates', data)
      setTemplates([...templates, result])
      await fetchStats()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create PDF template')
      throw err
    }
  }

  const generatePdf = async (templateId: string, data: Record<string, unknown>) => {
    try {
      const result = await apiClient.post<GeneratedPdf>('/pdf/generate', { templateId, data })
      setGeneratedPdfs([...generatedPdfs, result])
      await fetchStats()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF')
      throw err
    }
  }

  const deletePdf = async (pdfId: string) => {
    try {
      await apiClient.delete(`/pdf/generated/${pdfId}`)
      setGeneratedPdfs(generatedPdfs.filter((p) => p.id !== pdfId))
      await fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete PDF')
      throw err
    }
  }

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      await Promise.all([fetchTemplates(), fetchGeneratedPdfs(), fetchHistory(), fetchStats()])
      setLoading(false)
    }
    loadAll()
  }, [])

  return {
    templates,
    generatedPdfs,
    history,
    stats,
    loading,
    error,
    fetchTemplates,
    fetchGeneratedPdfs,
    fetchHistory,
    fetchStats,
    createTemplate,
    generatePdf,
    deletePdf,
  }
}
