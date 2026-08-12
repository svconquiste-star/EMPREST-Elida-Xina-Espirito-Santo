const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateContactTable() {
  try {
    console.log('🔄 Migrando tabela Contact para schema Dados_Cliente_Emprest...\n');

    // 1. Criar schema se não existir
    await prisma.$executeRawUnsafe(`
      CREATE SCHEMA IF NOT EXISTS "Dados_Cliente_Emprest";
    `);
    console.log('✅ Schema Dados_Cliente_Emprest criado/verificado');

    // 2. Criar tabela no schema correto
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Dados_Cliente_Emprest"."Contact" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "nomeEmpresa" VARCHAR(255) NOT NULL,
        "nome" VARCHAR(255) NOT NULL,
        "telefone" VARCHAR(20) NOT NULL,
        "email" VARCHAR(255),
        "cidade" VARCHAR(255) NOT NULL,
        "deviceType" VARCHAR(50),
        "operatingSystem" VARCHAR(50),
        "whatsappLink" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "ipAddress" VARCHAR(45),
        "userAgent" TEXT
      );
    `);
    console.log('✅ Tabela Contact criada no schema Dados_Cliente_Emprest');

    // 3. Criar índices
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Contact_telefone_idx"
        ON "Dados_Cliente_Emprest"."Contact"("telefone");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Contact_email_idx"
        ON "Dados_Cliente_Emprest"."Contact"("email");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Contact_createdAt_idx"
        ON "Dados_Cliente_Emprest"."Contact"("createdAt");
    `);
    console.log('✅ Índices criados');

    // 4. Copiar dados de public para novo schema (se houver)
    try {
      const count = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM "Contact"
      `);

      if (count && count[0] && count[0].count > 0) {
        console.log(`\n📊 Encontrados ${count[0].count} registros em public.Contact`);

        await prisma.$executeRawUnsafe(`
          INSERT INTO "Dados_Cliente_Emprest"."Contact"
          SELECT * FROM public."Contact"
          ON CONFLICT DO NOTHING;
        `);
        console.log('✅ Dados copiados com sucesso');
      }
    } catch (e) {
      console.log('ℹ️  Nenhum dado para copiar de public.Contact');
    }

    // 5. Deletar tabela antiga (opcional - comentado por segurança)
    // await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS public."Contact";`);
    console.log('\n⚠️  Tabela antiga em public.Contact NÃO foi deletada (por segurança)');

    // 6. Verificar estrutura
    console.log('\n📋 Estrutura da tabela Contact em Dados_Cliente_Emprest:\n');
    const columns = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'Dados_Cliente_Emprest'
        AND table_name = 'Contact'
      ORDER BY ordinal_position
    `);

    columns.forEach((col) => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    // 7. Contar registros
    const recordCount = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM "Dados_Cliente_Emprest"."Contact"
    `);

    console.log(`\n📊 Total de registros: ${recordCount[0].count}`);
    console.log('\n✅ Migração concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante migração:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateContactTable();
