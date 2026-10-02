/**
 * IRIB Digital Workplace Platform - Organization Hook
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

export interface Department {
  id: string
  slug: string
  name: { fa: string; en: string }
  type: 'DEPARTMENT' | 'UNIT'
  parentId?: string | null
  parent?: Department
  children?: Department[]
}

export interface OrganizationStats {
  totalDepartments: number
  totalUnits: number
  totalEmployees: number
  totalMembers: number
}

export interface OrganizationUnit {
  id: string
  name: string
  manager?: string
  memberCount?: number
  children: OrganizationUnit[]
}

export function useOrganization() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiClient.get<Department[]>('/organization')
      setDepartments(data || [])
    } catch {
      // Silently use fallback data if API fails
      console.warn('Organization API not available, using fallback data')
      setDepartments(getFallbackDepartments())
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Stats endpoint doesn't exist, calculate from departments
      const statsData: OrganizationStats = {
        totalDepartments: departments.filter((d) => d.type === 'DEPARTMENT').length,
        totalUnits: departments.filter((d) => d.type === 'UNIT').length,
        totalEmployees: 0,
        totalMembers: 0,
      }
      return statsData
    } catch (err) {
      console.error('Error fetching organization stats:', err)
      return { totalDepartments: 0, totalUnits: 0, totalEmployees: 0, totalMembers: 0 }
    }
  }

  useEffect(() => {
    // Use fallback data directly since API endpoint doesn't exist yet
    setDepartments(getFallbackDepartments())
    setLoading(false)
  }, [])

  const tree = buildOrganizationTree(departments)
  const stats: OrganizationStats = {
    totalDepartments: departments.filter((department) => department.type === 'DEPARTMENT').length,
    totalUnits: departments.filter((department) => department.type === 'UNIT').length,
    totalEmployees: 0,
    totalMembers: 0,
  }

  return {
    departments,
    organization: tree,
    tree,
    stats,
    loading,
    error,
    fetchDepartments,
    fetchStats,
  }
}

function buildOrganizationTree(departments: Department[]): OrganizationUnit[] {
  const nodes = new Map<string, OrganizationUnit>()
  departments.forEach((department) => {
    nodes.set(department.id, {
      id: department.id,
      name: department.name.fa || department.name.en,
      children: [],
    })
  })

  const roots: OrganizationUnit[] = []
  departments.forEach((department) => {
    const node = nodes.get(department.id)
    if (!node) return
    const parent = department.parentId ? nodes.get(department.parentId) : undefined
    if (parent) parent.children.push(node)
    else roots.push(node)
  })
  return roots
}

// Fallback data for when API is not available
function getFallbackDepartments(): Department[] {
  return [
    {
      id: '1',
      slug: 'deputy-technical',
      name: { fa: 'معاونت فنی', en: 'Technical Deputy' },
      type: 'DEPARTMENT',
      parentId: null,
    },
    {
      id: '2',
      slug: 'deputy-program',
      name: { fa: 'معاونت برنامه‌ریزی', en: 'Program Deputy' },
      type: 'DEPARTMENT',
      parentId: null,
    },
    {
      id: '3',
      slug: 'deputy-admin',
      name: { fa: 'معاونت اداری', en: 'Administrative Deputy' },
      type: 'DEPARTMENT',
      parentId: null,
    },
    {
      id: '4',
      slug: 'unit-technical',
      name: { fa: 'واحد فنی', en: 'Technical Unit' },
      type: 'UNIT',
      parentId: '1',
    },
    {
      id: '5',
      slug: 'unit-program',
      name: { fa: 'واحد برنامه‌ریزی', en: 'Program Unit' },
      type: 'UNIT',
      parentId: '2',
    },
  ]
}
