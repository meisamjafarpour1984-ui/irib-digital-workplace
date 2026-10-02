/**
 * IRIB Digital Workplace Platform - Tickets Hook
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export interface Ticket {
  id: string
  title: string
  description: string
  category: string
  status: string
  priority: string
  requesterId: string
  assigneeId?: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
}

export interface TicketStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  byCategory: Array<{ category: string; count: number }>
  byPriority: Array<{ priority: string; count: number }>
}

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [stats, setStats] = useState<TicketStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTickets = async (params?: {
    status?: string
    category?: string
    priority?: string
    search?: string
  }) => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiClient.get<Ticket[]>('/tickets', {
        params: {
          ...(params?.status && { status: params.status }),
          ...(params?.category && { category: params.category }),
          ...(params?.priority && { priority: params.priority }),
          ...(params?.search && { search: params.search }),
        },
      })

      setTickets(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Stats endpoint doesn't exist, calculate from tickets
      const statsData: TicketStats = {
        total: tickets.length,
        open: tickets.filter((t) => t.status === 'OPEN').length,
        inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
        resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
        byCategory: [],
        byPriority: [],
      }
      setStats(statsData)
    } catch (err) {
      console.error('Error fetching ticket stats:', err)
    }
  }

  const createTicket = async (ticketData: {
    title: string
    description: string
    category: string
    priority: string
  }) => {
    try {
      const newTicket = await apiClient.post<Ticket>('/tickets', ticketData)
      setTickets([...tickets, newTicket])
      await fetchStats()
      return newTicket
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket')
      throw err
    }
  }

  const updateTicket = async (id: string, ticketData: Partial<Ticket>) => {
    try {
      const updatedTicket = await apiClient.put<Ticket>(`/tickets/${id}`, ticketData)
      setTickets(tickets.map((t) => (t.id === id ? updatedTicket : t)))
      return updatedTicket
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket')
      throw err
    }
  }

  useEffect(() => {
    void fetchTickets()
    void fetchStats()
  }, [])

  return {
    tickets,
    stats,
    loading,
    error,
    fetchTickets,
    fetchStats,
    createTicket,
    updateTicket,
  }
}
