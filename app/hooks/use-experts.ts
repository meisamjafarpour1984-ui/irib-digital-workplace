/**
 * IRIB Digital Workplace Platform - Experts Hook
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export interface Expert {
  id: string
  name: string
  title: string
  department: string
  skills: string[]
  bio: string
  isLegend: boolean
  createdAt: string
}

export interface Legend {
  id: string
  name: string
  title: string
  awards: string[]
  keyWorks: string[]
  festivals: string[]
  interviewVideo?: string
  createdAt: string
}

export interface Skill {
  id: string
  name: string
  category: string
  expertCount: number
}

export interface ExpertStats {
  totalExperts: number
  totalLegends: number
  totalSkills: number
  totalInterviews: number
}

export function useExperts() {
  const [experts, setExperts] = useState<Expert[]>([])
  const [legends, setLegends] = useState<Legend[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [stats, setStats] = useState<ExpertStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExperts = async (params?: {
    departmentId?: string
    isLegend?: boolean
    search?: string
  }) => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiClient.get<Expert[]>('/experts', {
        params: {
          ...(params?.departmentId && { departmentId: params.departmentId }),
          ...(params?.isLegend !== undefined && { isLegend: params.isLegend.toString() }),
          ...(params?.search && { search: params.search }),
        },
      })

      setExperts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching experts:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchLegends = async () => {
    try {
      const data = await apiClient.get<Legend[]>('/experts/legends')
      setLegends(data || [])
    } catch (err) {
      console.error('Error fetching legends:', err)
    }
  }

  const fetchSkills = async () => {
    try {
      const data = await apiClient.get<Skill[]>('/experts/skills/list')
      setSkills(data || [])
    } catch (err) {
      console.error('Error fetching skills:', err)
    }
  }

  const fetchStats = async () => {
    try {
      // Stats endpoint doesn't exist, calculate from data
      const statsData: ExpertStats = {
        totalExperts: experts.length,
        totalLegends: legends.length,
        totalSkills: skills.length,
        totalInterviews: legends.filter((l) => l.interviewVideo).length,
      }
      setStats(statsData)
    } catch (err) {
      console.error('Error fetching expert stats:', err)
    }
  }

  useEffect(() => {
    void fetchExperts()
    void fetchLegends()
    void fetchSkills()
  }, [])

  return {
    experts,
    legends,
    skills,
    stats,
    loading,
    error,
    fetchExperts,
    fetchLegends,
    fetchSkills,
    fetchStats,
  }
}
