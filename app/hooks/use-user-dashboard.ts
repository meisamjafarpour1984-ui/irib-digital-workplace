/**
 * IRIB Digital Workplace Platform - User Dashboard Hook
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export interface DashboardKPI {
  totalContent: number
  publishedContent: number
  totalForms: number
  formSubmissions: number
  openTickets: number
  newNotifications: number
  pendingTasks: number
}

export interface VisitData {
  date: string
  visits: number
  pageViews: number
}

export interface TrafficSource {
  source: string
  value: number
  color: string
}

export interface Activity {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
  user: string
}

export interface Ticket {
  id: string
  title: string
  status: string
  priority: string
  createdAt: string
  assignee?: string
}

export function useUserDashboard() {
  const [kpi, setKpi] = useState<DashboardKPI | null>(null)
  const [visits, setVisits] = useState<VisitData[]>([])
  const [traffic] = useState<TrafficSource[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error] = useState<string | null>(null)

  const fetchKPI = async () => {
    try {
      const data = await apiClient.get<{
        content?: { total: number; published: number }
        forms?: { total: number; submissions: number }
      }>('/analytics/dashboard/overview')

      setKpi({
        totalContent: data.content?.total || 0,
        publishedContent: data.content?.published || 0,
        totalForms: data.forms?.total || 0,
        formSubmissions: data.forms?.submissions || 0,
        openTickets: 0, // Will come from tickets API
        newNotifications: 0, // Will come from notifications API
        pendingTasks: 0, // Will come from tasks API
      })
    } catch (err) {
      console.error('Error fetching KPI:', err)
    }
  }

  const fetchVisits = async () => {
    try {
      const data = await apiClient.get<{ activity: VisitData[] }>(
        '/analytics/dashboard/user-activity',
        {
          params: { period: '30d' },
        }
      )
      setVisits(data.activity || [])
    } catch (err) {
      console.error('Error fetching visits:', err)
    }
  }

  const fetchActivities = async () => {
    try {
      const data = await apiClient.get<{ items: Activity[] }>('/audit/search', {
        params: { limit: '10' },
      })
      setActivities(data.items || [])
    } catch (err) {
      console.error('Error fetching activities:', err)
    }
  }

  const fetchTickets = async () => {
    try {
      // This will come from a Tickets API when implemented
      setTickets([])
    } catch (err) {
      console.error('Error fetching tickets:', err)
    }
  }

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      await Promise.all([fetchKPI(), fetchVisits(), fetchActivities(), fetchTickets()])
      setLoading(false)
    }
    loadAll()
  }, [])

  return {
    kpi,
    visits,
    traffic,
    activities,
    tickets,
    loading,
    error,
    fetchKPI,
    fetchVisits,
    fetchActivities,
    fetchTickets,
  }
}
