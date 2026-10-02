import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Adding SMS provider configuration...')

  // Create a mock SMS provider for testing
  const provider = await prisma.smsProviderConfig.create({
    data: {
      name: 'Mock SMS Provider',
      type: 'MOCK',
      apiUrl: 'http://localhost:3000/mock/sms',
      apiToken: 'mock-token',
      senderNumber: '30005006007',
      isActive: true,
      isDefault: true,
      config: {
        mock: true,
        delay: 0,
      },
    },
  })

  console.log('✅ SMS provider configured:', provider.name)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
