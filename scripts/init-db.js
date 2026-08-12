const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createContactTable() {
  try {
    console.log('Creating Contact table...');

    // Create table using raw SQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Contact" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "nomeEmpresa" VARCHAR(255) NOT NULL,
        "nome" VARCHAR(255) NOT NULL,
        "telefone" VARCHAR(20) NOT NULL,
        "email" VARCHAR(255),
        "cidade" VARCHAR(255) NOT NULL,
        "deviceType" VARCHAR(50),
        "operatingSystem" VARCHAR(50),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "ipAddress" VARCHAR(45),
        "userAgent" TEXT
      );
    `);

    console.log('✓ Contact table created successfully');

    // Create indexes
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Contact_telefone_idx" ON "Contact"("telefone");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Contact_email_idx" ON "Contact"("email");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Contact_createdAt_idx" ON "Contact"("createdAt");`);

    console.log('✓ Indexes created successfully');

  } catch (error) {
    console.error('Error creating table:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createContactTable();
