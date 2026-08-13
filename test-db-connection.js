const { PrismaClient } = require('@prisma/client');

console.log('🔍 Testando conexão com banco de dados...\n');
console.log('DATABASE_URL:', process.env.DATABASE_URL || 'NÃO DEFINIDA');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function test() {
  try {
    console.log('\n📡 Tentando conectar ao banco...\n');

    // Simple test query
    const result = await prisma.$queryRawUnsafe(
      'SELECT NOW() as current_time'
    );

    console.log('✅ Conexão bem-sucedida!');
    console.log('Hora do banco:', result[0].current_time);

    // Check tables in Dados_Cliente_Emprest schema
    console.log('\n📋 Tabelas no schema Dados_Cliente_Emprest:\n');
    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'Dados_Cliente_Emprest'
    `);

    console.log('Tabelas encontradas:', tables.length);
    tables.forEach(t => console.log(`  - ${t.table_name}`));

    // Try to create a test contact
    console.log('\n📝 Tentando criar um contato de teste...\n');
    const contact = await prisma.contact.create({
      data: {
        nomeEmpresa: 'TEST-EMPRESA',
        nome: 'Teste Silva',
        telefone: '31999999999',
        email: 'teste@example.com',
        cidade: 'Teste',
        whatsappLink: 'https://wa.me/5531999999999',
      },
    });

    console.log('✅ Contato criado com sucesso!');
    console.log('ID:', contact.id);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.meta) {
      console.error('Detalhes:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
  }
}

test();
