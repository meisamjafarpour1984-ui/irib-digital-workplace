import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Resetting admin password...')

  const hashedPassword = await bcrypt.hash('admin123', 10)

  await prisma.user.update({
    where: { personnelCode: 'ADMIN001' },
    data: { passwordHash: hashedPassword },
  })

  console.log('✅ Admin password reset to: admin123')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
