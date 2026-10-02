const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres@localhost:5432/irib_dwp'
    }
  }
});

prisma.$connect()
  .then(() => {
    console.log('✅ Connected to database successfully');
    return prisma.$disconnect();
  })
  .catch(e => {
    console.error('❌ Connection failed:', e.message);
    process.exit(1);
  });
