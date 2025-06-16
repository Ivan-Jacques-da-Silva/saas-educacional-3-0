
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearData() {
  console.log('🧹 Iniciando limpeza dos dados de exemplo...');

  try {
    // Deletar em ordem para respeitar as foreign keys
    await prisma.matricula.deleteMany();
    console.log('✅ Matrículas removidas');

    await prisma.curso.deleteMany();
    console.log('✅ Cursos removidos');

    await prisma.user.deleteMany();
    console.log('✅ Usuários removidos');

    await prisma.escola.deleteMany();
    console.log('✅ Escolas removidas');

    console.log('\n🎉 Todos os dados de exemplo foram removidos com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao limpar dados:', error);
  }
}

clearData()
  .catch((e) => {
    console.error('❌ Erro durante a limpeza:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
