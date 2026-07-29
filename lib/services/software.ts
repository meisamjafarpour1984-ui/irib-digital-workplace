import { apiClient } from '@/lib/api-client'

export interface TicketRecord {
  id: string
  title: string | { fa?: string; en?: string }
  status: string
  createdAt: string
  updatedAt?: string
}

export const softwareApi = {
  listTickets: (params?: { status?: string; limit?: number }) =>
    apiClient.get<TicketRecord[]>('/tickets', { params }),
}
