
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearData() {
  console.log('🧹 Iniciando limpeza completa dos dados de exemplo...');

  try {
    console.log('🗑️  Removendo matrículas...');
    const deletedMatriculas = await prisma.matricula.deleteMany();
    console.log(`✅ ${deletedMatriculas.count} matrículas removidas`);

    console.log('🗑️  Removendo turmas...');
    const deletedTurmas = await prisma.turma.deleteMany();
    console.log(`✅ ${deletedTurmas.count} turmas removidas`);

    console.log('🗑️  Removendo cursos...');
    const deletedCursos = await prisma.curso.deleteMany();
    console.log(`✅ ${deletedCursos.count} cursos removidos`);

    console.log('🗑️  Removendo usuários...');
    const deletedUsers = await prisma.user.deleteMany();
    console.log(`✅ ${deletedUsers.count} usuários removidos`);

    console.log('🗑️  Removendo escolas...');
    const deletedEscolas = await prisma.escola.deleteMany();
    console.log(`✅ ${deletedEscolas.count} escolas removidas`);

    console.log('\n🎉 Todos os dados de exemplo foram removidos com sucesso!');
    console.log('\n📊 Resumo da limpeza:');
    console.log(`- ${deletedMatriculas.count} matrículas`);
    console.log(`- ${deletedTurmas.count} turmas`);
    console.log(`- ${deletedCursos.count} cursos`);
    console.log(`- ${deletedUsers.count} usuários`);
    console.log(`- ${deletedEscolas.count} escolas`);
    console.log('\n💡 Banco de dados limpo e pronto para novos dados!');
    
  } catch (error) {
    console.error('❌ Erro ao limpar dados:', error);
    if (error.code === 'P2003') {
      console.log('\n⚠️  Erro de constraint de chave estrangeira detectado.');
      console.log('Tentando limpeza individual por tabela...');
      
      try {
        await prisma.matricula.deleteMany();
        console.log('✅ Matrículas removidas');
        
        await prisma.turma.deleteMany();
        console.log('✅ Turmas removidas');
        
        await prisma.curso.deleteMany();
        console.log('✅ Cursos removidos');
        
        await prisma.user.deleteMany();
        console.log('✅ Usuários removidos');
        
        await prisma.escola.deleteMany();
        console.log('✅ Escolas removidas');
        
        console.log('\n🎉 Limpeza individual concluída com sucesso!');
      } catch (individualError) {
        console.error('❌ Erro na limpeza individual:', individualError);
      }
    }
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
