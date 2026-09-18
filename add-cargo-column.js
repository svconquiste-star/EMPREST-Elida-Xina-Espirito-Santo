const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addCargoColumn() {
  try {
    console.log('🔄 Adicionando coluna "cargo" à tabela Contact_Xina-ES...\n');

    // Adicionar coluna cargo se não existir
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Dados_Cliente_Emprest"."Contact_Xina-ES"
      ADD COLUMN IF NOT EXISTS "cargo" VARCHAR(255) NOT NULL DEFAULT 'Não informado'
    `);

    console.log('✅ Coluna "cargo" adicionada com sucesso!\n');

    // Verificar estrutura
    const columns = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'Dados_Cliente_Emprest'
        AND table_name = 'Contact_Xina-ES'
      ORDER BY ordinal_position
    `);

    console.log('📋 Estrutura atual da tabela:\n');
    columns.forEach((col) => {
      console.log(`  - ${col.column_name.padEnd(20)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'YES' ? 'NULLABLE' : 'NOT NULL'}`);
    });

    console.log('\n✅ Estrutura da tabela atualizada!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addCargoColumn();
