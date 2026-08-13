const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixTimezone() {
  try {
    console.log('🔄 Corrigindo fuso horário para Brasília (GMT-3)...\n');

    // 1. Verificar dados atuais
    console.log('📋 Dados antes da correção:\n');
    const beforeData = await prisma.$queryRawUnsafe(`
      SELECT
        "id",
        "nome",
        "createdAt",
        "updatedAt",
        "createdAt" AT TIME ZONE 'America/Sao_Paulo' as createdAt_Brasilia,
        "updatedAt" AT TIME ZONE 'America/Sao_Paulo' as updatedAt_Brasilia
      FROM "Dados_Cliente_Emprest"."Contact_Xina-ES"
      LIMIT 3
    `);

    beforeData.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.nome}`);
      console.log(`   UTC: ${row.createdAt}`);
      console.log(`   Brasília: ${row.createdAt_Brasilia}\n`);
    });

    // 2. Converter colunas para TIMESTAMP WITH TIME ZONE
    console.log('🔧 Atualizando tipo de coluna para TIMESTAMP WITH TIME ZONE...\n');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Dados_Cliente_Emprest"."Contact_Xina-ES"
      ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt" AT TIME ZONE 'UTC';
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Dados_Cliente_Emprest"."Contact_Xina-ES"
      ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITH TIME ZONE USING "updatedAt" AT TIME ZONE 'UTC';
    `);

    console.log('✅ Colunas atualizadas para TIMESTAMP WITH TIME ZONE\n');

    // 3. Verificar dados após correção
    console.log('📋 Dados após correção:\n');
    const afterData = await prisma.$queryRawUnsafe(`
      SELECT
        "id",
        "nome",
        "createdAt",
        "createdAt" AT TIME ZONE 'America/Sao_Paulo' as createdAt_Brasilia
      FROM "Dados_Cliente_Emprest"."Contact_Xina-ES"
      LIMIT 3
    `);

    afterData.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.nome}`);
      console.log(`   UTC: ${row.createdAt}`);
      console.log(`   Brasília: ${row.createdAt_Brasilia}\n`);
    });

    console.log('✅ Fuso horário corrigido com sucesso!');
    console.log('   Todos os timestamps agora estão em TIMESTAMP WITH TIME ZONE');
    console.log('   Fuso padrão: America/Sao_Paulo (GMT-3)');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixTimezone();
