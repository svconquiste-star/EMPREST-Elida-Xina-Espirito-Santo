const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function renameTable() {
  try {
    console.log('🔄 Renomeando tabela Contact para Contact_Xina-ES...\n');

    // Executar SQL para renomear a tabela
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Dados_Cliente_Emprest"."Contact" RENAME TO "Contact_Xina-ES";
    `);

    console.log('✅ Tabela renomeada com sucesso!\n');

    // Verificar se a tabela foi renomeada
    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'Dados_Cliente_Emprest'
      AND table_name = 'Contact_Xina-ES'
    `);

    if (tables.length > 0) {
      console.log('✅ Verificação: Tabela Contact_Xina-ES encontrada no banco');
    } else {
      console.log('❌ Erro: Tabela não foi renomeada');
      process.exit(1);
    }

    // Contar registros na nova tabela
    const count = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM "Dados_Cliente_Emprest"."Contact_Xina-ES"
    `);

    console.log(`📊 Total de registros na nova tabela: ${count[0].count}\n`);
    console.log('✅ Renomeação completa!');

  } catch (error) {
    console.error('❌ Erro ao renomear tabela:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

renameTable();
