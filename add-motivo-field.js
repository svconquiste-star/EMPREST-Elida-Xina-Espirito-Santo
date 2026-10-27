const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addMotivoField() {
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Dados_Cliente_Emprest"."Contact_Xina-ES"
      ADD COLUMN IF NOT EXISTS "motivo" VARCHAR(255)
    `);
    console.log('✅ Coluna motivo adicionada');

    const columns = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'Dados_Cliente_Emprest'
        AND table_name = 'Contact_Xina-ES'
        AND column_name = 'motivo'
    `);
    console.log('📋 Verificação:', columns);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addMotivoField();
