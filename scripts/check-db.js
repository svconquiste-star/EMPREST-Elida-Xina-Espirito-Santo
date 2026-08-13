const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Verificando banco de dados...\n');

    // Verificar se tabela Contact existe
    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'Contact'
    `);

    if (tables.length === 0) {
      console.log('❌ Tabela Contact NÃO foi encontrada!');
      return;
    }

    console.log('✅ Tabela Contact encontrada!\n');

    // Listar todas as colunas da tabela Contact
    const columns = await prisma.$queryRawUnsafe(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'Contact'
      ORDER BY ordinal_position
    `);

    console.log('📋 Colunas da tabela Contact:\n');
    console.log('┌─────────────────────────┬─────────────────┬──────────┬──────────────┐');
    console.log('│ Coluna                  │ Tipo de Dado    │ Nullable │ Default      │');
    console.log('├─────────────────────────┼─────────────────┼──────────┼──────────────┤');

    columns.forEach((col) => {
      const colName = col.column_name.padEnd(23);
      const dataType = col.data_type.padEnd(15);
      const nullable = col.is_nullable === 'YES' ? 'SIM' : 'NÃO';
      const def = col.column_default ? col.column_default.substring(0, 12) : 'Nenhum';

      console.log(`│ ${colName} │ ${dataType} │ ${nullable.padEnd(8)} │ ${def.padEnd(12)} │`);
    });

    console.log('└─────────────────────────┴─────────────────┴──────────┴──────────────┘');

    // Verificar índices
    console.log('\n📊 Índices criados:\n');
    const indexes = await prisma.$queryRawUnsafe(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'Contact'
    `);

    if (indexes.length === 0) {
      console.log('⚠️  Nenhum índice encontrado');
    } else {
      indexes.forEach((idx) => {
        console.log(`✅ ${idx.indexname}`);
      });
    }

    // Contar registros
    console.log('\n');
    const count = await prisma.contact.count();
    console.log(`📈 Total de registros: ${count}`);

    // Listar últimos registros
    if (count > 0) {
      console.log('\n📝 Últimos 3 registros:\n');
      const recent = await prisma.contact.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nomeEmpresa: true,
          nome: true,
          telefone: true,
          createdAt: true,
        },
      });

      recent.forEach((contact, idx) => {
        console.log(`${idx + 1}. ${contact.nomeEmpresa} | ${contact.nome} | ${contact.telefone}`);
        console.log(`   Criado em: ${new Date(contact.createdAt).toLocaleString('pt-BR')}\n`);
      });
    }

  } catch (error) {
    console.error('❌ Erro ao verificar banco de dados:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
