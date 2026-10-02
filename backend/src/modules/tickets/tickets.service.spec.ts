import { Test, TestingModule } from '@nestjs/testing'
import { TicketsService } from './tickets.service'
import { TicketsRepository } from './tickets.repository'

describe('TicketsService', () => {
  let service: TicketsService
  let repository: TicketsRepository

  const mockTicket = { id: 't1', title: 'Bug', status: 'NEW', userId: 'u1', assigneeId: null }
  const mockRepository = {
    create: jest.fn().mockResolvedValue(mockTicket),
    findAll: jest.fn().mockResolvedValue({ items: [mockTicket], pagination: { totalPages: 1 } }),
    addComment: jest.fn().mockResolvedValue({ id: 'comment-1' }),
    changeStatus: jest.fn().mockResolvedValue({ ...mockTicket, status: 'IN_PROGRESS' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const m: TestingModule = await Test.createTestingModule({
      providers: [TicketsService, { provide: TicketsRepository, useValue: mockRepository }],
    }).compile()
    service = m.get<TicketsService>(TicketsService)
    repository = m.get<TicketsRepository>(TicketsRepository)
  })

  it('should be defined', () => expect(service).toBeDefined())

  describe('create', () => {
    it('creates ticket with userId', async () => {
      const r = await service.create({
        title: 'Bug',
        description: 'Desc',
        category: 'OTHER',
        priority: 'NORMAL',
        creatorId: 'u1',
      })
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ creatorId: 'u1' }))
      expect(r).toEqual(mockTicket)
    })
  })

  describe('findAll', () => {
    it('paginates and filters by status', async () => {
      const r = await service.findAll({ page: 1, limit: 10, status: 'NEW' })
      expect(repository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10, status: 'NEW' })
      expect(r.pagination.totalPages).toBe(1)
    })
  })

  describe('addComment', () => {
    it('adds comment to ticket', async () => {
      await service.addComment('t1', { authorId: 'u1', content: 'Comment text' })
      expect(repository.addComment).toHaveBeenCalledWith('t1', {
        authorId: 'u1',
        content: 'Comment text',
      })
    })
  })

  describe('changeStatus', () => {
    it('updates ticket status', async () => {
      const r = await service.changeStatus('t1', 'IN_PROGRESS', 'u1')
      expect(repository.changeStatus).toHaveBeenCalledWith('t1', 'IN_PROGRESS', 'u1')
      expect(r.status).toBe('IN_PROGRESS')
    })
  })
})
