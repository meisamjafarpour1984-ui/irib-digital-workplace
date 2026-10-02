import { Test, TestingModule } from '@nestjs/testing'
import { PdfGeneratorService } from './pdf-generator.service'

describe('PdfGeneratorService', () => {
  let service: PdfGeneratorService

  beforeEach(async () => {
    const m: TestingModule = await Test.createTestingModule({
      providers: [PdfGeneratorService],
    }).compile()

    service = m.get<PdfGeneratorService>(PdfGeneratorService)

    ;(service as any).browser = {
      newPage: jest.fn().mockResolvedValue({
        setContent: jest.fn(),
        pdf: jest.fn().mockResolvedValue(Buffer.from('%PDF-1.4 test')),
        close: jest.fn(),
      }),
    }
  })

  it('should be defined', () => expect(service).toBeDefined())

  describe('generateFromHtml', () => {
    it('generates pdf from html content', async () => {
      const r = await service.generateFromHtml('<h1>Direct</h1>')
      expect(r).toEqual(
        expect.objectContaining({
          success: true,
          contentType: 'application/pdf',
          data: expect.any(String),
        })
      )
    })
  })

  describe('generatePdf', () => {
    it('generates pdf from a content payload', async () => {
      const r = await service.generatePdf({ content: '<h1>Hello</h1>' })
      expect(r).toEqual(
        expect.objectContaining({
          success: true,
          contentType: 'application/pdf',
          data: expect.any(String),
        })
      )
    })
  })
})
