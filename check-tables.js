const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTables() {
  try {
    console.log('🔍 Verificando tabelas no schema Dados_Cliente_Emprest...\n');

    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'Dados_Cliente_Emprest'
      ORDER BY table_name
    `);

    console.log('Tabelas encontradas:');
    tables.forEach(t => {
      console.log(`  - ${t.table_name}`);
    });

    // Tentar contar registros em cada tabela
    console.log('\n📊 Tentando verificar registros...\n');

    if (tables.some(t => t.table_name === 'Contact_Xina-ES')) {
      const count = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM "Dados_Cliente_Emprest"."Contact_Xina-ES"
      `);
      console.log(`✅ Contact_Xina-ES: ${count[0].count} registros`);
    }

    if (tables.some(t => t.table_name === 'Contact')) {
      const count = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM "Dados_Cliente_Emprest"."Contact"
      `);
      console.log(`✅ Contact: ${count[0].count} registros`);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
