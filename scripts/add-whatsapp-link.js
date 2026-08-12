const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addWhatsappLinkColumn() {
  try {
    console.log('Adicionando coluna whatsappLink à tabela Contact...\n');

    // Adicionar coluna se não existir
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Contact"
      ADD COLUMN IF NOT EXISTS "whatsappLink" TEXT;
    `);

    console.log('✅ Coluna whatsappLink adicionada com sucesso!');

    // Verificar a estrutura da tabela
    const columns = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'Contact'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Estrutura da tabela Contact:\n');
    columns.forEach((col) => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addWhatsappLinkColumn();
