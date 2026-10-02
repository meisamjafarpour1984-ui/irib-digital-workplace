import { Test, TestingModule } from '@nestjs/testing'
import { SearchService } from './search.service'
import { PrismaService } from '../../prisma/prisma.service'

describe('SearchService', () => {
  let service: SearchService
  let prisma: PrismaService

  const mockPrisma = {
    content: {
      findMany: jest.fn().mockResolvedValue([
        { id: 'c1', title: 'News 1' },
        { id: 'c2', title: 'News 2' },
      ]),
    },
    $queryRaw: jest.fn().mockResolvedValue([
      { id: 'c1', title: 'News 1' },
      { id: 'c2', title: 'News 2' },
    ]),
    user: {
      findMany: jest.fn().mockResolvedValue([{ id: 'u1', name: 'Ali' }]),
    },
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const m: TestingModule = await Test.createTestingModule({
      providers: [SearchService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile()
    service = m.get<SearchService>(SearchService)
    prisma = m.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => expect(service).toBeDefined())

  describe('searchContent', () => {
    it('searches content by title with pagination', async () => {
      const r = await service.searchContent({ query: 'News', page: 1, limit: 10 })
      expect(prisma.$queryRaw).toHaveBeenCalled()
      expect(r.items).toHaveLength(2)
    })
  })

  describe('searchUsers', () => {
    it('searches users by name', async () => {
      const r = await service.searchUsers({ query: 'Ali', page: 1, limit: 10 })
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ name: { contains: 'Ali' } }),
          skip: 0,
          take: 10,
        })
      )
      expect(r.items).toHaveLength(1)
    })
  })
})
