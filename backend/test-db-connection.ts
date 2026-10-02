import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://irib_admin:irib_secret_2024@localhost:5433/irib_dwp',
    },
  },
})

async function testConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Database connection successful')
    const result = await prisma.$queryRaw`SELECT version()`
    console.log('Database version:', result)
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

testConnection()
