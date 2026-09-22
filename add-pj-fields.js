const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addPJFields() {
  try {
    console.log('🔄 Adicionando campos de qualificação PJ à tabela Contact_Xina-ES...\n');

    // Adicionar coluna tipoVinculo
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Dados_Cliente_Emprest"."Contact_Xina-ES"
      ADD COLUMN IF NOT EXISTS "tipoVinculo" VARCHAR(10) NOT NULL DEFAULT 'CLT'
    `);
    console.log('✅ Coluna tipoVinculo adicionada');

    // Adicionar coluna rendaMensal
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Dados_Cliente_Emprest"."Contact_Xina-ES"
      ADD COLUMN IF NOT EXISTS "rendaMensal" DECIMAL(12,2) NOT NULL DEFAULT 0
    `);
    console.log('✅ Coluna rendaMensal adicionada');

    // Adicionar coluna valorDesejado
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Dados_Cliente_Emprest"."Contact_Xina-ES"
      ADD COLUMN IF NOT EXISTS "valorDesejado" DECIMAL(12,2) NOT NULL DEFAULT 0
    `);
    console.log('✅ Coluna valorDesejado adicionada');

    // Adicionar coluna nomeEmpresa2
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Dados_Cliente_Emprest"."Contact_Xina-ES"
      ADD COLUMN IF NOT EXISTS "nomeEmpresa2" VARCHAR(255)
    `);
    console.log('✅ Coluna nomeEmpresa2 adicionada\n');

    // Criar índice em tipoVinculo
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Contact_tipoVinculo_idx"
      ON "Dados_Cliente_Emprest"."Contact_Xina-ES"("tipoVinculo")
    `);
    console.log('✅ Índice tipoVinculo criado\n');

    // Verificar estrutura
    const columns = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'Dados_Cliente_Emprest'
        AND table_name = 'Contact_Xina-ES'
      ORDER BY ordinal_position
    `);

    console.log('📋 Estrutura atualizada:\n');
    columns.forEach((col) => {
      const nullable = col.is_nullable === 'YES' ? 'NULLABLE' : 'NOT NULL';
      console.log(`  - ${col.column_name.padEnd(20)} ${col.data_type.padEnd(20)} ${nullable}`);
    });

    // Contar registros
    const count = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM "Dados_Cliente_Emprest"."Contact_Xina-ES"
    `);

    console.log(`\n📊 Total de registros: ${count[0].count}`);
    console.log('\n✅ Migração de campos PJ concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addPJFields();
