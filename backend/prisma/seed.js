
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeding completo do banco de dados...');

  // Limpar dados existentes
  await prisma.matricula.deleteMany();
  await prisma.curso.deleteMany();
  await prisma.user.deleteMany();
  await prisma.escola.deleteMany();

  // 1. CRIAR GESTOR
  console.log('👤 Criando gestor...');
  const gestor = await prisma.user.create({
    data: {
      nome: 'Ivan Gestor',
      email: 'ivan@gestor.com',
      login: 'ivan',
      password: await bcrypt.hash('gestor', 10),
      tipoUser: 1, // Gestor
      cpf: '12345678901',
      dataNascimento: '1980-01-15',
      profissao: 'Administrador Geral',
      estadoCivil: 'Casado',
      endCidadeEstado: 'São Paulo - SP',
      endRua: 'Rua dos Gestores, 100',
      endNum: '100',
      endCep: '01234-567',
      whatsapp: '11999999999',
      telefone: '1133333333',
      descricao: 'Gestor responsável pela administração geral do sistema'
    }
  });

  // 2. CRIAR ESCOLAS
  console.log('🏫 Criando escolas...');
  const escolas = await Promise.all([
    prisma.escola.create({
      data: {
        nome: 'Escola de Idiomas Centro',
        cidade: 'São Paulo',
        bairro: 'Centro',
        estado: 'SP',
        rua: 'Rua Augusta, 1500',
        numero: '1500',
        descricao: 'Escola de idiomas localizada no centro de São Paulo'
      }
    }),
    prisma.escola.create({
      data: {
        nome: 'Instituto de Línguas Vila Madalena',
        cidade: 'São Paulo',
        bairro: 'Vila Madalena',
        estado: 'SP',
        rua: 'Rua Harmonia, 800',
        numero: '800',
        descricao: 'Instituto de ensino de idiomas na Vila Madalena'
      }
    }),
    prisma.escola.create({
      data: {
        nome: 'Centro de Idiomas Copacabana',
        cidade: 'Rio de Janeiro',
        bairro: 'Copacabana',
        estado: 'RJ',
        rua: 'Av. Atlântica, 2000',
        numero: '2000',
        descricao: 'Centro de idiomas em Copacabana'
      }
    }),
    prisma.escola.create({
      data: {
        nome: 'Escola Multicultural Ipanema',
        cidade: 'Rio de Janeiro',
        bairro: 'Ipanema',
        estado: 'RJ',
        rua: 'Rua Visconde de Pirajá, 500',
        numero: '500',
        descricao: 'Escola multicultural de idiomas em Ipanema'
      }
    }),
    prisma.escola.create({
      data: {
        nome: 'Instituto Linguístico Asa Norte',
        cidade: 'Brasília',
        bairro: 'Asa Norte',
        estado: 'DF',
        rua: 'SGAN 610, Módulo D',
        numero: 'S/N',
        descricao: 'Instituto de ensino de idiomas em Brasília'
      }
    })
  ]);

  // 3. CRIAR DIRETORES (um para cada escola)
  console.log('👔 Criando diretores...');
  const diretores = [];
  
  for (let i = 0; i < escolas.length; i++) {
    const escola = escolas[i];
    const diretor = await prisma.user.create({
      data: {
        nome: `Diretor ${escola.nome.split(' ')[2] || 'Principal'} ${i + 1}`,
        email: `diretor${i + 1}@${escola.nome.toLowerCase().replace(/\s+/g, '')}.com`,
        login: `diretor${i + 1}`,
        password: await bcrypt.hash('diretor123', 10),
        tipoUser: 2, // Diretor
        cpf: `2345678901${i}`,
        dataNascimento: `197${5 + i}-0${(i % 9) + 1}-15`,
        profissao: 'Diretor Escolar',
        estadoCivil: i % 2 === 0 ? 'Casado' : 'Solteiro',
        endCidadeEstado: `${escola.cidade} - ${escola.estado}`,
        endRua: `Rua da Direção ${escola.bairro}, ${200 + (i * 100)}`,
        endNum: `${200 + (i * 100)}`,
        endCep: `${20 + i}${123 + i}-456`,
        whatsapp: `${21 + i}888888888`,
        telefone: `${21 + i}${22222222 + i}`,
        escolaId: escola.id,
        descricao: `Diretor da ${escola.nome}`
      }
    });
    diretores.push(diretor);
    
    // Atualizar escola com responsável
    await prisma.escola.update({
      where: { id: escola.id },
      data: { responsavelId: diretor.id }
    });
  }

  // 4. CRIAR SECRETÁRIAS (uma para cada escola)
  console.log('👩‍💼 Criando secretárias...');
  const secretarias = [];
  
  for (let i = 0; i < escolas.length; i++) {
    const escola = escolas[i];
    const secretaria = await prisma.user.create({
      data: {
        nome: `Secretária ${escola.bairro} ${i + 1}`,
        email: `secretaria${i + 1}@${escola.nome.toLowerCase().replace(/\s+/g, '')}.com`,
        login: `secretaria${i + 1}`,
        password: await bcrypt.hash('secretaria123', 10),
        tipoUser: 3, // Secretária
        cpf: `3456789012${i}`,
        dataNascimento: `198${i}-0${((i * 2) % 9) + 1}-10`,
        profissao: 'Secretária Escolar',
        estadoCivil: i % 3 === 0 ? 'Divorciada' : 'Casada',
        endCidadeEstado: `${escola.cidade} - ${escola.estado}`,
        endRua: `Rua da Secretaria ${escola.bairro}, ${300 + (i * 50)}`,
        endNum: `${300 + (i * 50)}`,
        endCep: `${30 + i}${123 + i}-456`,
        whatsapp: `${31 + i}777777777`,
        telefone: `${31 + i}${11111111 + i}`,
        escolaId: escola.id,
        descricao: `Secretária da ${escola.nome}`
      }
    });
    secretarias.push(secretaria);
  }

  // 5. CRIAR PROFESSORES (2-3 professores por escola)
  console.log('👨‍🏫 Criando professores...');
  const professores = [];
  const idiomas = ['Inglês', 'Espanhol', 'Francês', 'Alemão', 'Italiano'];
  
  for (let i = 0; i < escolas.length; i++) {
    const escola = escolas[i];
    const numProfessores = 2 + (i % 2); // 2 ou 3 professores por escola
    
    for (let j = 0; j < numProfessores; j++) {
      const idioma = idiomas[j % idiomas.length];
      const professor = await prisma.user.create({
        data: {
          nome: `Professor ${idioma} ${escola.bairro} ${j + 1}`,
          email: `professor${idioma.toLowerCase()}${i + 1}${j + 1}@${escola.nome.toLowerCase().replace(/\s+/g, '')}.com`,
          login: `prof${idioma.toLowerCase()}${i + 1}${j + 1}`,
          password: await bcrypt.hash('professor123', 10),
          tipoUser: 4, // Professor
          cpf: `456789012${i}${j}`,
          dataNascimento: `198${2 + j}-${String((i * 2 + j + 1) % 12 + 1).padStart(2, '0')}-25`,
          profissao: `Professor de ${idioma}`,
          estadoCivil: (i + j) % 3 === 0 ? 'Solteiro' : 'Casado',
          endCidadeEstado: `${escola.cidade} - ${escola.estado}`,
          endRua: `Rua dos Professores ${escola.bairro}, ${400 + (i * 100) + (j * 10)}`,
          endNum: `${400 + (i * 100) + (j * 10)}`,
          endCep: `${40 + i}${567 + j}-890`,
          whatsapp: `${41 + i}${666666666 + j}`,
          telefone: `${41 + i}${44444444 + j}`,
          escolaId: escola.id,
          descricao: `Professor especialista em ${idioma} na ${escola.nome}`
        }
      });
      professores.push({ ...professor, escola: escola, idioma: idioma });
    }
  }

  // 6. CRIAR CURSOS (para cada professor)
  console.log('📚 Criando cursos...');
  const cursos = [];
  const niveis = ['Básico', 'Intermediário', 'Avançado'];
  
  for (let i = 0; i < professores.length; i++) {
    const professor = professores[i];
    const numCursos = 1 + (i % 2); // 1 ou 2 cursos por professor
    
    for (let j = 0; j < numCursos; j++) {
      const nivel = niveis[j % niveis.length];
      const curso = await prisma.curso.create({
        data: {
          titulo: `${professor.idioma} ${nivel} - ${professor.escola.bairro}`,
          descricao: `Curso de ${professor.idioma} nível ${nivel.toLowerCase()} na ${professor.escola.nome}`,
          instrutorId: professor.id,
          categoria: 'Idiomas',
          nivel: nivel,
          duracao: `${60 + (j * 20)} horas`,
          preco: 150.00 + (j * 50),
          status: 'ativo',
          tags: `${professor.idioma.toLowerCase()}, ${nivel.toLowerCase()}, conversação`
        }
      });
      cursos.push({ ...curso, professor: professor, escola: professor.escola });
    }
  }

  // 7. CRIAR ALUNOS (3-5 alunos por escola)
  console.log('👨‍🎓 Criando alunos...');
  const alunos = [];
  const nomes = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Felipe', 'Gabriela', 'Hugo', 'Isabela', 'João'];
  const sobrenomes = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Lima', 'Ferreira', 'Costa', 'Rodrigues', 'Almeida'];
  
  for (let i = 0; i < escolas.length; i++) {
    const escola = escolas[i];
    const numAlunos = 4 + (i % 2); // 4 ou 5 alunos por escola
    
    for (let j = 0; j < numAlunos; j++) {
      const nome = nomes[j % nomes.length];
      const sobrenome = sobrenomes[(i * 2 + j) % sobrenomes.length];
      const aluno = await prisma.user.create({
        data: {
          nome: `${nome} ${sobrenome}`,
          email: `${nome.toLowerCase()}.${sobrenome.toLowerCase()}${i + 1}${j + 1}@email.com`,
          login: `aluno${nome.toLowerCase()}${i + 1}${j + 1}`,
          password: await bcrypt.hash('aluno123', 10),
          tipoUser: 5, // Aluno
          cpf: `567890123${i}${j}`,
          dataNascimento: `200${j % 5}-${String((i + j + 1) % 12 + 1).padStart(2, '0')}-08`,
          profissao: j % 3 === 0 ? 'Estudante' : j % 3 === 1 ? 'Estagiário' : 'Jovem Aprendiz',
          estadoCivil: 'Solteiro',
          endCidadeEstado: `${escola.cidade} - ${escola.estado}`,
          endRua: `Rua dos Estudantes ${escola.bairro}, ${500 + (i * 100) + (j * 10)}`,
          endNum: `${500 + (i * 100) + (j * 10)}`,
          endCep: `${50 + i}${678 + j}-901`,
          whatsapp: `${51 + i}${555555555 + j}`,
          telefone: `${51 + i}${55555555 + j}`,
          escolaId: escola.id,
          descricao: `Aluno da ${escola.nome}`
        }
      });
      alunos.push({ ...aluno, escola: escola });
    }
  }

  // 8. CRIAR MATRÍCULAS (para cada aluno)
  console.log('📝 Criando matrículas com dados financeiros...');
  const matriculas = [];
  const tiposCobranca = ['parcelado', 'mensalidade'];
  const statusOptions = ['ativo', 'ativo', 'ativo', 'trancado']; // Mais ativos que trancados
  
  for (let i = 0; i < alunos.length; i++) {
    const aluno = alunos[i];
    const cursosEscola = cursos.filter(c => c.escola.id === aluno.escola.id);
    
    if (cursosEscola.length > 0) {
      const curso = cursosEscola[i % cursosEscola.length];
      const tipoCobranca = tiposCobranca[i % tiposCobranca.length];
      const status = statusOptions[i % statusOptions.length];
      
      let valorCurso, numeroParcelas, valorParcela, valorMensalidade;
      
      if (tipoCobranca === 'parcelado') {
        valorCurso = curso.preco;
        numeroParcelas = 3 + (i % 4); // 3 a 6 parcelas
        valorParcela = valorCurso / numeroParcelas;
        valorMensalidade = null;
      } else {
        valorCurso = curso.preco;
        valorMensalidade = valorCurso / 4; // Dividido em 4 meses
        numeroParcelas = null;
        valorParcela = null;
      }
      
      const matricula = await prisma.matricula.create({
        data: {
          usuarioId: aluno.id,
          escolaId: aluno.escola.id,
          valorCurso: valorCurso,
          numeroParcelas: numeroParcelas,
          valorParcela: valorParcela,
          valorMensalidade: valorMensalidade,
          tipoCobranca: tipoCobranca,
          primeiraDataPagamento: new Date(`2024-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, '0')}`),
          status: status,
          nivelIdioma: curso.nivel,
          horarioInicio: `${8 + (i % 6)}:00`, // Horários de 8h às 13h
          horarioFim: `${12 + (i % 6)}:00`, // Horários de 12h às 17h
          escolaridade: i % 3 === 0 ? 'Ensino Médio' : i % 3 === 1 ? 'Ensino Superior' : 'Ensino Fundamental',
          localNascimento: `${aluno.escola.cidade} - ${aluno.escola.estado}`,
          redeSocial: `@${aluno.nome.toLowerCase().replace(' ', '_')}`,
          nomePai: `Pai de ${aluno.nome.split(' ')[0]}`,
          contatoPai: `${51 + i}987654321`,
          nomeMae: `Mãe de ${aluno.nome.split(' ')[0]}`,
          contatoMae: `${51 + i}987654322`
        }
      });
      matriculas.push(matricula);
    }
  }

  console.log('\n🎉 Seeding completo concluído com sucesso!');
  console.log('\n📊 Resumo dos dados criados:');
  console.log(`👤 1 Gestor: login "ivan", senha "gestor"`);
  console.log(`👔 ${diretores.length} Diretores: login "diretor1-${diretores.length}", senha "diretor123"`);
  console.log(`👩‍💼 ${secretarias.length} Secretárias: login "secretaria1-${secretarias.length}", senha "secretaria123"`);
  console.log(`🏫 ${escolas.length} Escolas criadas`);
  console.log(`👨‍🏫 ${professores.length} Professores: login "prof[idioma][escola][num]", senha "professor123"`);
  console.log(`📚 ${cursos.length} Cursos criados`);
  console.log(`👨‍🎓 ${alunos.length} Alunos: login "aluno[nome][escola][num]", senha "aluno123"`);
  console.log(`📝 ${matriculas.length} Matrículas com dados financeiros completos`);

  console.log('\n💡 Tipos de usuário:');
  console.log('1 = Gestor | 2 = Diretor | 3 = Secretária | 4 = Professor | 5 = Aluno');

  console.log('\n🏫 Escolas e suas equipes:');
  for (let i = 0; i < escolas.length; i++) {
    const escola = escolas[i];
    const professoresTotais = professores.filter(p => p.escola.id === escola.id).length;
    const alunosTotais = alunos.filter(a => a.escola.id === escola.id).length;
    console.log(`- ${escola.nome}: ${professoresTotais} professores, ${alunosTotais} alunos`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
