
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeding do banco de dados...');

  // Limpar dados existentes
  await prisma.matricula.deleteMany();
  await prisma.curso.deleteMany();
  await prisma.user.deleteMany();
  await prisma.escola.deleteMany();

  // Criar escolas de exemplo
  const escolas = await Promise.all([
    prisma.escola.create({
      data: {
        nome: 'Escola Municipal João Silva',
        cidade: 'São Paulo',
        bairro: 'Centro',
        estado: 'SP',
        rua: 'Rua das Flores, 123',
        numero: '123',
        descricao: 'Escola municipal com foco em educação básica'
      }
    }),
    prisma.escola.create({
      data: {
        nome: 'Colégio Estadual Maria Santos',
        cidade: 'Rio de Janeiro',
        bairro: 'Copacabana',
        estado: 'RJ',
        rua: 'Av. Atlântica, 456',
        numero: '456',
        descricao: 'Colégio estadual de ensino médio'
      }
    }),
    prisma.escola.create({
      data: {
        nome: 'Instituto Federal de Tecnologia',
        cidade: 'Brasília',
        bairro: 'Asa Norte',
        estado: 'DF',
        rua: 'SGAN 610, Módulo D',
        numero: 'S/N',
        descricao: 'Instituto federal com cursos técnicos e superiores'
      }
    })
  ]);

  console.log(`✅ Criadas ${escolas.length} escolas`);

  // Criar usuários com diferentes tipos
  const usuarios = [];

  // Gestor
  const gestor = await prisma.user.create({
    data: {
      nome: 'Ivan Gestor',
      email: 'ivan@gestor.com',
      login: 'ivan',
      password: await bcrypt.hash('gestor', 10),
      tipoUser: 'Gestor',
      cpf: '12345678901',
      dataNascimento: '1980-01-15',
      profissao: 'Administrador',
      estadoCivil: 'Casado',
      endCidadeEstado: 'São Paulo - SP',
      endRua: 'Rua dos Gestores, 100',
      endNum: '100',
      endCep: '01234-567',
      whatsapp: '11999999999',
      telefone: '1133333333',
      escolaId: escolas[0].id,
      descricao: 'Gestor responsável pela administração geral'
    }
  });
  usuarios.push(gestor);

  // Diretor
  const diretor = await prisma.user.create({
    data: {
      nome: 'Carlos Diretor',
      email: 'diretor@escola.com',
      login: 'diretor',
      password: await bcrypt.hash('diretor', 10),
      tipoUser: 'Diretor',
      cpf: '23456789012',
      dataNascimento: '1975-05-20',
      profissao: 'Diretor Escolar',
      estadoCivil: 'Solteiro',
      endCidadeEstado: 'Rio de Janeiro - RJ',
      endRua: 'Rua da Direção, 200',
      endNum: '200',
      endCep: '20123-456',
      whatsapp: '21888888888',
      telefone: '2122222222',
      escolaId: escolas[1].id,
      descricao: 'Diretor da unidade escolar'
    }
  });
  usuarios.push(diretor);

  // Secretária
  const secretaria = await prisma.user.create({
    data: {
      nome: 'Ana Secretária',
      email: 'secretaria@escola.com',
      login: 'secretaria',
      password: await bcrypt.hash('secretaria', 10),
      tipoUser: 'Secretaria',
      cpf: '34567890123',
      dataNascimento: '1985-03-10',
      profissao: 'Secretária Escolar',
      estadoCivil: 'Casada',
      endCidadeEstado: 'Brasília - DF',
      endRua: 'Rua da Secretaria, 300',
      endNum: '300',
      endCep: '70123-456',
      whatsapp: '61777777777',
      telefone: '6111111111',
      escolaId: escolas[2].id,
      descricao: 'Responsável pela secretaria escolar'
    }
  });
  usuarios.push(secretaria);

  // Professor
  const professor = await prisma.user.create({
    data: {
      nome: 'João Professor',
      email: 'professor@escola.com',
      login: 'professor',
      password: await bcrypt.hash('professor', 10),
      tipoUser: 'Professor',
      cpf: '45678901234',
      dataNascimento: '1982-07-25',
      profissao: 'Professor de Matemática',
      estadoCivil: 'Divorciado',
      endCidadeEstado: 'São Paulo - SP',
      endRua: 'Rua dos Professores, 400',
      endNum: '400',
      endCep: '04567-890',
      whatsapp: '11666666666',
      telefone: '1144444444',
      escolaId: escolas[0].id,
      descricao: 'Professor especialista em matemática e física'
    }
  });
  usuarios.push(professor);

  // Aluno
  const aluno = await prisma.user.create({
    data: {
      nome: 'Maria Aluna',
      email: 'aluno@escola.com',
      login: 'aluno',
      password: await bcrypt.hash('aluno', 10),
      tipoUser: 'Aluno',
      cpf: '56789012345',
      dataNascimento: '2005-12-08',
      profissao: 'Estudante',
      estadoCivil: 'Solteiro',
      endCidadeEstado: 'São Paulo - SP',
      endRua: 'Rua dos Estudantes, 500',
      endNum: '500',
      endCep: '05678-901',
      whatsapp: '11555555555',
      telefone: '1155555555',
      escolaId: escolas[0].id,
      descricao: 'Aluna do ensino médio'
    }
  });
  usuarios.push(aluno);

  console.log(`✅ Criados ${usuarios.length} usuários`);

  // Atualizar escolas com responsáveis
  await prisma.escola.update({
    where: { id: escolas[0].id },
    data: { responsavelId: gestor.id }
  });

  await prisma.escola.update({
    where: { id: escolas[1].id },
    data: { responsavelId: diretor.id }
  });

  await prisma.escola.update({
    where: { id: escolas[2].id },
    data: { responsavelId: secretaria.id }
  });

  // Criar cursos de exemplo
  const cursos = await Promise.all([
    prisma.curso.create({
      data: {
        titulo: 'Matemática Básica',
        descricao: 'Curso de matemática para iniciantes',
        instrutorId: professor.id,
        categoria: 'Exatas',
        nivel: 'Básico',
        duracao: '40 horas',
        preco: 150.00,
        status: 'ativo',
        tags: 'matemática, básico, números'
      }
    }),
    prisma.curso.create({
      data: {
        titulo: 'Física Aplicada',
        descricao: 'Curso de física com aplicações práticas',
        instrutorId: professor.id,
        categoria: 'Exatas',
        nivel: 'Intermediário',
        duracao: '60 horas',
        preco: 220.00,
        status: 'ativo',
        tags: 'física, mecânica, energia'
      }
    }),
    prisma.curso.create({
      data: {
        titulo: 'Inglês Conversação',
        descricao: 'Curso de inglês focado na conversação',
        categoria: 'Idiomas',
        nivel: 'Intermediário',
        duracao: '80 horas',
        preco: 300.00,
        status: 'ativo',
        tags: 'inglês, conversação, idioma'
      }
    })
  ]);

  console.log(`✅ Criados ${cursos.length} cursos`);

  // Criar matrículas de exemplo
  const matriculas = await Promise.all([
    prisma.matricula.create({
      data: {
        usuarioId: aluno.id,
        escolaId: escolas[0].id,
        valorCurso: 150.00,
        numeroParcelas: 3,
        valorParcela: 50.00,
        tipoCobranca: 'parcelado',
        primeiraDataPagamento: new Date('2024-02-15'),
        status: 'ativo',
        nivelIdioma: 'Básico',
        horarioInicio: '08:00',
        horarioFim: '12:00',
        escolaridade: 'Ensino Médio',
        localNascimento: 'São Paulo - SP',
        redeSocial: '@maria_aluna',
        nomePai: 'José Silva',
        contatoPai: '11987654321',
        nomeMae: 'Ana Silva',
        contatoMae: '11987654322'
      }
    }),
    prisma.matricula.create({
      data: {
        usuarioId: aluno.id,
        escolaId: escolas[0].id,
        valorCurso: 300.00,
        valorMensalidade: 100.00,
        tipoCobranca: 'mensalidade',
        primeiraDataPagamento: new Date('2024-01-10'),
        status: 'ativo',
        nivelIdioma: 'Intermediário',
        horarioInicio: '14:00',
        horarioFim: '18:00',
        escolaridade: 'Ensino Médio',
        localNascimento: 'São Paulo - SP',
        redeSocial: '@maria_aluna',
        nomePai: 'José Silva',
        contatoPai: '11987654321',
        nomeMae: 'Ana Silva',
        contatoMae: '11987654322'
      }
    })
  ]);

  console.log(`✅ Criadas ${matriculas.length} matrículas`);

  console.log('\n🎉 Seeding concluído com sucesso!');
  console.log('\n👥 Usuários criados:');
  console.log('- Gestor: login "ivan", senha "gestor"');
  console.log('- Diretor: login "diretor", senha "diretor"');
  console.log('- Secretária: login "secretaria", senha "secretaria"');
  console.log('- Professor: login "professor", senha "professor"');
  console.log('- Aluno: login "aluno", senha "aluno"');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
