import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { CommunicationService } from './communication.service'

describe('CommunicationService', () => {
  it('rejects message access for a non-member', async () => {
    const prisma = {
      conversationParticipant: { findUnique: jest.fn().mockResolvedValue(null) },
      message: { findMany: jest.fn() },
    }
    const service = new CommunicationService(prisma as never)
    await expect(service.messages('conversation-1', 'outsider')).rejects.toBeInstanceOf(
      ForbiddenException
    )
    expect(prisma.message.findMany).not.toHaveBeenCalled()
  })

  it('rejects unknown participants when creating a conversation', async () => {
    const prisma = {
      user: { count: jest.fn().mockResolvedValue(1) },
      conversation: { create: jest.fn() },
    }
    const service = new CommunicationService(prisma as never)
    await expect(
      service.create(
        {
          subject: 'گفت‌وگوی تست',
          entityType: 'Custom',
          entityId: 'custom',
          priority: 'NORMAL',
          participantIds: ['00000000-0000-4000-8000-000000000001'],
        },
        '00000000-0000-4000-8000-000000000002'
      )
    ).rejects.toBeInstanceOf(NotFoundException)
    expect(prisma.conversation.create).not.toHaveBeenCalled()
  })

  it('stores the authenticated sender instead of client input', async () => {
    const prisma = {
      conversationParticipant: { findUnique: jest.fn().mockResolvedValue({ id: 'membership-1' }) },
      $transaction: jest.fn().mockImplementation((callback) =>
        callback({
          message: { create: jest.fn().mockImplementation(({ data }) => data) },
          conversation: { update: jest.fn() },
        })
      ),
    }
    const service = new CommunicationService(prisma as never)
    await expect(service.send('conversation-1', 'user-1', ' سلام ')).resolves.toMatchObject({
      conversationId: 'conversation-1',
      senderId: 'user-1',
      content: { text: 'سلام' },
    })
  })
})
