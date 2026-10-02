import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { SmsService } from './sms.service'
import { SmsRepository } from './sms.repository'
import { IdehPayamAdapter } from './adapters/idehpayam.adapter'
import { MockSmsAdapter } from './adapters/mock-sms.adapter'

describe('SmsService', () => {
  let service: SmsService
  const provider = {
    id: 'p1',
    name: 'Mock Provider',
    apiToken: 'token',
    apiUrl: 'http://sms.local',
    senderNumber: '1000',
    updatedAt: new Date(),
  }
  const mockRepository = {
    getActiveProvider: jest.fn().mockResolvedValue(provider),
    createMessage: jest.fn().mockResolvedValue({ id: 'm1' }),
    updateProviderCredit: jest.fn(),
  }
  const mockAdapter = {
    send: jest.fn().mockResolvedValue({ success: true, messageId: 'msg-1' }),
    getCredit: jest.fn().mockResolvedValue(100000),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmsService,
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('mock') } },
        { provide: SmsRepository, useValue: mockRepository },
        { provide: IdehPayamAdapter, useValue: mockAdapter },
        { provide: MockSmsAdapter, useValue: mockAdapter },
      ],
    }).compile()
    service = module.get<SmsService>(SmsService)
  })

  it('should be defined', () => expect(service).toBeDefined())

  it('sends through the configured mock adapter and persists the message', async () => {
    const result = await service.send('09123456789', 'Test message')

    expect(mockAdapter.send).toHaveBeenCalledWith('09123456789', 'Test message', provider)
    expect(mockRepository.createMessage).toHaveBeenCalledWith(
      expect.objectContaining({ providerConfigId: 'p1', recipient: '09123456789', status: 'SENT' })
    )
    expect(result).toEqual({ success: true, messageId: 'msg-1' })
  })

  it('returns a controlled error when no provider is configured', async () => {
    mockRepository.getActiveProvider.mockResolvedValueOnce(null)
    await expect(service.send('09123456789', 'Test message')).resolves.toEqual({
      success: false,
      error: 'No active SMS provider configured',
    })
  })

  it('reports provider credit', async () => {
    const result = await service.getProviderStatus()
    expect(mockAdapter.getCredit).toHaveBeenCalledWith(provider)
    expect(result).toMatchObject({ connected: true, provider: 'Mock Provider', credit: 100000 })
  })

  it('keeps bulk sending explicitly unavailable while queue integration is disabled', async () => {
    await expect(service.sendBulk(['09123456789'], 'Test message')).resolves.toEqual({
      success: false,
      error: 'Bulk SMS not available - queue service disabled',
    })
  })
})
