/**
 * IRIB Digital Workplace Platform - Notifications Hook
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export interface Notification {
  id: string
  type: 'content' | 'message' | 'ticket' | 'system'
  title: string
  body: string
  time: string
  read: boolean
  userId: string
  createdAt: string
}

export interface NotificationStats {
  total: number
  unread: number
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.get<Notification[]>('/notifications')
      setNotifications(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await apiClient.get<NotificationStats>('/notifications/stats')
      setStats(data)
    } catch (err) {
      console.error('Error fetching notification stats:', err)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await apiClient.post(`/notifications/${id}/read`)
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
      await fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read')
      throw err
    }
  }

  const markAllAsRead = async () => {
    try {
      await apiClient.post('/notifications/read-all')
      setNotifications(notifications.map((n) => ({ ...n, read: true })))
      await fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all as read')
      throw err
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await apiClient.delete(`/notifications/${id}`)
      setNotifications(notifications.filter((n) => n.id !== id))
      await fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification')
      throw err
    }
  }

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      await Promise.all([fetchNotifications(), fetchStats()])
      setLoading(false)
    }
    loadAll()
  }, [])

  return {
    notifications,
    stats,
    loading,
    error,
    fetchNotifications,
    fetchStats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
}
