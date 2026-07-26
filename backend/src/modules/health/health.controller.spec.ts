import { Test } from '@nestjs/testing'
import { HealthController } from './health.controller'

describe('HealthController', () => {
  it('reports process liveness', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile()

    expect(moduleRef.get(HealthController).live()).toEqual({
      status: 'ok',
      service: 'irib-dwp-backend',
    })
  })
})
