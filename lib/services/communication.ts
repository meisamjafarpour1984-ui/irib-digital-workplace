import { io, type Socket } from 'socket.io-client'
import { apiClient } from '@/lib/api-client'

export interface Participant {
  id: string
  userId: string
  role: string
  lastReadAt: string | null
  user: { id: string; name: string | { fa?: string } }
}
export interface Message {
  id: string
  conversationId: string
  senderId: string | null
  type: string
  content: { text?: string } | string
  createdAt: string
  sender: { id: string; name: string | { fa?: string } } | null
}
export interface Conversation {
  id: string
  subject: string
  entityType: string
  entityId: string
  status: string
  priority: string
  updatedAt: string
  participants: Participant[]
  messages: Message[]
}

export const messageText = (content: Message['content']) =>
  typeof content === 'string' ? content : (content.text ?? '')
export const communicationApi = {
  list: (role?: string) => apiClient.get<Conversation[]>('/conversations', { params: { role } }),
  messages: (id: string) => apiClient.get<Message[]>(`/conversations/${id}/messages`),
  send: (id: string, text: string) =>
    apiClient.post<Message>(`/conversations/${id}/messages`, { text }),
  markRead: (id: string) => apiClient.post<{ success: boolean }>(`/conversations/${id}/read`),
  create: (input: { subject: string; participantIds?: string[] }) =>
    apiClient.post<Conversation>('/conversations', input),
}

export function connectInbox(token: string) {
  return io(`${process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001'}/inbox`, {
    auth: { token },
    transports: ['websocket'],
  }) as Socket
}
