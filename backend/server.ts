import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'https://testes.cursoviolaocristao.com.br'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuração do Multer para upload de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Criar diretório de uploads se não existir
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Criar diretório de logs se não existir
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Função para logging de erros
const logError = (route: string, error: any, req: Request | null = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    route,
    error: error.message || error,
    stack: error.stack || null,
    method: req?.method || 'UNKNOWN',
    ip: req?.ip || 'UNKNOWN',
    userAgent: req?.get('User-Agent') || 'UNKNOWN'
  };

  const logString = `${timestamp} - ${route} - ${error.message || error}\n`;
  const logDir = path.join(__dirname, 'logs');
  const logFile = path.join(logDir, `error-${new Date().toISOString().split('T')[0]}.log`);

  // Log detalhado em JSON
  const detailedLogFile = path.join(logDir, `detailed-error-${new Date().toISOString().split('T')[0]}.json`);

  try {
    // Log simples
    fs.appendFileSync(logFile, logString);

    // Log detalhado
    let existingLogs: any[] = [];
    if (fs.existsSync(detailedLogFile)) {
      const fileContent = fs.readFileSync(detailedLogFile, 'utf8');
      if (fileContent.trim()) {
        existingLogs = JSON.parse(fileContent);
      }
    }
    existingLogs.push(logEntry);
    fs.writeFileSync(detailedLogFile, JSON.stringify(existingLogs, null, 2));
  } catch (logErr) {
    console.error('Erro ao escrever log:', logErr);
  }
};

// Rotas para Escolas
app.get('/api/escolas', async (req: Request, res: Response) => {
  try {
    const escolas = await prisma.escola.findMany({
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      },
      orderBy: { nome: 'asc' }
    });
    res.json(escolas);
  } catch (error) {
    logError('GET /api/escolas', error, req);
    console.error('Erro ao buscar escolas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/escolas', async (req: Request, res: Response) => {
  try {
    const { 
      nome, 
      dataCadastro, 
      responsavelId, 
      cidade, 
      bairro, 
      estado, 
      rua, 
      numero, 
      descricao 
    } = req.body;

    // Verificar se escola já existe
    const existingEscola = await prisma.escola.findFirst({
      where: { nome: nome }
    });

    if (existingEscola) {
      return res.json({ exists: true, message: 'Escola já cadastrada' });
    }

    // Criar escola
    const newEscola = await prisma.escola.create({
      data: {
        nome,
        dataCadastro: dataCadastro ? new Date(dataCadastro) : new Date(),
        responsavelId: responsavelId ? parseInt(responsavelId) : null,
        cidade,
        bairro,
        estado,
        rua,
        numero,
        descricao
      },
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({ exists: false, escola: newEscola });
  } catch (error) {
    logError('POST /api/escolas', error, req);
    console.error('Erro ao criar escola:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/escolas/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      nome, 
      dataCadastro, 
      responsavelId, 
      cidade, 
      bairro, 
      estado, 
      rua, 
      numero, 
      descricao 
    } = req.body;

    // Verificar se escola existe
    const existingEscola = await prisma.escola.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingEscola) {
      return res.status(404).json({ error: 'Escola não encontrada' });
    }

    const updatedEscola = await prisma.escola.update({
      where: { id: parseInt(id) },
      data: { 
        nome,
        dataCadastro: dataCadastro ? new Date(dataCadastro) : existingEscola.dataCadastro,
        responsavelId: responsavelId ? parseInt(responsavelId) : null,
        cidade,
        bairro,
        estado,
        rua,
        numero,
        descricao
      },
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });

    res.json(updatedEscola);
  } catch (error) {
    logError(`PUT /api/escolas/${req.params.id}`, error, req);
    console.error('Erro ao atualizar escola:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/escolas/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const escola = await prisma.escola.findUnique({
      where: { id: parseInt(id) },
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });

    if (!escola) {
      return res.status(404).json({ error: 'Escola não encontrada' });
    }

    res.json(escola);
  } catch (error) {
    logError(`GET /api/escolas/${req.params.id}`, error, req);
    console.error('Erro ao buscar escola:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/escolas/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.escola.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Escola excluída com sucesso' });
  } catch (error) {
    logError(`DELETE /api/escolas/${req.params.id}`, error, req);
    console.error('Erro ao excluir escola:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas para Usuários
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        escola: {
          select: {
            id: true,
            nome: true
          }
        }
      },
      orderBy: { nome: 'asc' }
    });
    res.json(users);
  } catch (error) {
    logError('GET /api/users', error, req);
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        escola: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    logError(`GET /api/users/${req.params.id}`, error, req);
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/users', upload.single('cp_foto_perfil'), async (req: Request, res: Response) => {
  try {
    const {
      cp_nome,
      cp_email,
      cp_login,
      cp_password,
      cp_tipo_user,
      cp_rg,
      cp_cpf,
      cp_datanascimento,
      cp_estadocivil,
      cp_cnpj,
      cp_ie,
      cp_whatsapp,
      cp_telefone,
      cp_empresaatuacao,
      cp_profissao,
      cp_end_cidade_estado,
      cp_end_rua,
      cp_end_num,
      cp_end_cep,
      cp_descricao,
      cp_escola_id
    } = req.body;

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cp_email },
          { login: cp_login }
        ]
      }
    });

    if (existingUser) {
      return res.json({ exists: true });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(cp_password, 10);

    // Criar usuário
    const newUser = await prisma.user.create({
      data: {
        nome: cp_nome,
        email: cp_email,
        login: cp_login,
        password: hashedPassword,
        tipoUser: parseInt(cp_tipo_user),
        rg: cp_rg || null,
        cpf: cp_cpf,
        dataNascimento: cp_datanascimento,
        estadoCivil: cp_estadocivil || null,
        cnpj: cp_cnpj || null,
        ie: cp_ie || null,
        whatsapp: cp_whatsapp || null,
        telefone: cp_telefone || null,
        empresaAtuacao: cp_empresaatuacao || null,
        profissao: cp_profissao || null,
        endCidadeEstado: cp_end_cidade_estado || null,
        endRua: cp_end_rua || null,
        endNum: cp_end_num || null,
        endCep: cp_end_cep || null,
        descricao: cp_descricao || null,
        escolaId: cp_escola_id ? parseInt(cp_escola_id) : null,
        fotoPerfil: req.file ? req.file.filename : null
      }
    });

    res.status(201).json({ exists: false, user: newUser });
  } catch (error) {
    logError('POST /api/users', error, req);
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      cp_nome,
      cp_email,
      cp_login,
      cp_password,
      cp_tipo_user,
      cp_rg,
      cp_cpf,
      cp_datanascimento,
      cp_estadocivil,
      cp_cnpj,
      cp_ie,
      cp_whatsapp,
      cp_telefone,
      cp_empresaatuacao,
      cp_profissao,
      cp_end_cidade_estado,
      cp_end_rua,
      cp_end_num,
      cp_end_cep,
      cp_descricao,
      cp_escola_id
    } = req.body;

    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Preparar dados para atualização
    const updateData: any = {
      nome: cp_nome,
      email: cp_email,
      login: cp_login,
      tipoUser: parseInt(cp_tipo_user),
      rg: cp_rg || null,
      cpf: cp_cpf,
      dataNascimento: cp_datanascimento,
      estadoCivil: cp_estadocivil || null,
      cnpj: cp_cnpj || null,
      ie: cp_ie || null,
      whatsapp: cp_whatsapp || null,
      telefone: cp_telefone || null,
      empresaAtuacao: cp_empresaatuacao || null,
      profissao: cp_profissao || null,
      endCidadeEstado: cp_end_cidade_estado || null,
      endRua: cp_end_rua || null,
      endNum: cp_end_num || null,
      endCep: cp_end_cep || null,
      descricao: cp_descricao || null,
      escolaId: cp_escola_id ? parseInt(cp_escola_id) : null
    };

    // Se senha foi fornecida, fazer hash
    if (cp_password && cp_password.trim() !== '') {
      updateData.password = await bcrypt.hash(cp_password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(updatedUser);
  } catch (error) {
    logError(`PUT /api/users/${req.params.id}`, error, req);
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    logError(`DELETE /api/users/${req.params.id}`, error, req);
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas para Matrículas
app.get('/api/matriculas', async (req: Request, res: Response) => {
  try {
    const matriculas = await prisma.matricula.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            cpf: true
          }
        },
        escola: {
          select: {
            id: true,
            nome: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(matriculas);
  } catch (error) {
    logError('GET /api/matriculas', error, req);
    console.error('Erro ao buscar matrículas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/matriculas/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const matricula = await prisma.matricula.findUnique({
      where: { id: parseInt(id) },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            cpf: true,
            dataNascimento: true,
            profissao: true,
            estadoCivil: true,
            endCidadeEstado: true,
            endRua: true,
            endNum: true,
            whatsapp: true,
            telefone: true
          }
        },
        escola: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    if (!matricula) {
      return res.status(404).json({ error: 'Matrícula não encontrada' });
    }

    res.json(matricula);
  } catch (error) {
    logError(`GET /api/matriculas/${req.params.id}`, error, req);
    console.error('Erro ao buscar matrícula:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/matriculas', async (req: Request, res: Response) => {
  try {
    const {
      usuarioId,
      escolaId,
      valorCurso,
      numeroParcelas,
      valorParcela,
      valorMensalidade,
      tipoCobranca,
      primeiraDataPagamento,
      status,
      nivelIdioma,
      horarioInicio,
      horarioFim,
      escolaridade,
      localNascimento,
      redeSocial,
      nomePai,
      contatoPai,
      nomeMae,
      contatoMae
    } = req.body;

    // Verificar se usuário existe
    const usuario = await prisma.user.findUnique({
      where: { id: parseInt(usuarioId) }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Criar matrícula
    const newMatricula = await prisma.matricula.create({
      data: {
        usuarioId: parseInt(usuarioId),
        escolaId: escolaId ? parseInt(escolaId) : null,
        valorCurso: parseFloat(valorCurso),
        numeroParcelas: numeroParcelas ? parseInt(numeroParcelas) : null,
        valorParcela: valorParcela ? parseFloat(valorParcela) : null,
        valorMensalidade: valorMensalidade ? parseFloat(valorMensalidade) : null,
        tipoCobranca: tipoCobranca || 'parcelado',
        primeiraDataPagamento: primeiraDataPagamento ? new Date(primeiraDataPagamento) : null,
        status: status || 'ativo',
        nivelIdioma,
        horarioInicio,
        horarioFim,
        escolaridade,
        localNascimento,
        redeSocial,
        nomePai,
        contatoPai,
        nomeMae,
        contatoMae
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            cpf: true
          }
        },
        escola: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    res.status(201).json({ message: 'Matrícula cadastrada com sucesso', matricula: newMatricula });
  } catch (error) {
    logError('POST /api/matriculas', error, req);
    console.error('Erro ao criar matrícula:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/matriculas/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      usuarioId,
      escolaId,
      valorCurso,
      numeroParcelas,
      valorParcela,
      valorMensalidade,
      tipoCobranca,
      primeiraDataPagamento,
      status,
      nivelIdioma,
      horarioInicio,
      horarioFim,
      escolaridade,
      localNascimento,
      redeSocial,
      nomePai,
      contatoPai,
      nomeMae,
      contatoMae
    } = req.body;

    // Verificar se matrícula existe
    const existingMatricula = await prisma.matricula.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingMatricula) {
      return res.status(404).json({ error: 'Matrícula não encontrada' });
    }

    const updatedMatricula = await prisma.matricula.update({
      where: { id: parseInt(id) },
      data: {
        usuarioId: parseInt(usuarioId),
        escolaId: escolaId ? parseInt(escolaId) : null,
        valorCurso: parseFloat(valorCurso),
        numeroParcelas: numeroParcelas ? parseInt(numeroParcelas) : null,
        valorParcela: valorParcela ? parseFloat(valorParcela) : null,
        valorMensalidade: valorMensalidade ? parseFloat(valorMensalidade) : null,
        tipoCobranca: tipoCobranca || 'parcelado',
        primeiraDataPagamento: primeiraDataPagamento ? new Date(primeiraDataPagamento) : null,
        status: status || 'ativo',
        nivelIdioma,
        horarioInicio,
        horarioFim,
        escolaridade,
        localNascimento,
        redeSocial,
        nomePai,
        contatoPai,
        nomeMae,
        contatoMae
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            cpf: true
          }
        },
        escola: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    res.json({ message: 'Matrícula atualizada com sucesso', matricula: updatedMatricula });
  } catch (error) {
    logError(`PUT /api/matriculas/${req.params.id}`, error, req);
    console.error('Erro ao atualizar matrícula:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/matriculas/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.matricula.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Matrícula excluída com sucesso' });
  } catch (error) {
    logError(`DELETE /api/matriculas/${req.params.id}`, error, req);
    console.error('Erro ao excluir matrícula:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar usuários para matrícula
app.get('/api/usuarios-matricula', async (req: Request, res: Response) => {
  try {
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        dataNascimento: true,
        profissao: true,
        estadoCivil: true,
        endCidadeEstado: true,
        endRua: true,
        endNum: true,
        whatsapp: true,
        telefone: true,
        escolaId: true
      },
      orderBy: { nome: 'asc' }
    });
    res.json(usuarios);
  } catch (error) {
    logError('GET /api/usuarios-matricula', error, req);
    console.error('Erro ao buscar usuários para matrícula:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas para Cursos
app.get('/api/cursos', async (req: Request, res: Response) => {
  try {
    const cursos = await prisma.curso.findMany({
      include: {
        instrutor: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      },
      orderBy: { titulo: 'asc' }
    });
    res.json(cursos);
  } catch (error) {
    logError('GET /api/cursos', error, req);
    console.error('Erro ao buscar cursos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/cursos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const curso = await prisma.curso.findUnique({
      where: { id: parseInt(id) },
      include: {
        instrutor: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });

    if (!curso) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }

    res.json(curso);
  } catch (error) {
    logError(`GET /api/cursos/${req.params.id}`, error, req);
    console.error('Erro ao buscar curso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/cursos', upload.single('arquivo'), async (req: Request, res: Response) => {
  try {
    const {
      titulo,
      descricao,
      instrutorId,
      categoria,
      nivel,
      duracao,
      preco,
      status,
      dataPublicacao,
      tags
    } = req.body;

    // Verificar se curso já existe
    const existingCurso = await prisma.curso.findFirst({
      where: { titulo: titulo }
    });

    if (existingCurso) {
      return res.json({ exists: true, message: 'Curso já cadastrado' });
    }

    // Criar curso
    const newCurso = await prisma.curso.create({
      data: {
        titulo,
        descricao,
        instrutorId: instrutorId ? parseInt(instrutorId) : null,
        categoria,
        nivel,
        duracao,
        preco: preco ? parseFloat(preco) : null,
        status: status || 'ativo',
        dataPublicacao: dataPublicacao ? new Date(dataPublicacao) : new Date(),
        tags,
        arquivo: req.file ? req.file.filename : null
      },
      include: {
        instrutor: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({ exists: false, curso: newCurso });
  } catch (error) {
    logError('POST /api/cursos', error, req);
    console.error('Erro ao criar curso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/cursos/:id', upload.single('arquivo'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      descricao,
      instrutorId,
      categoria,
      nivel,
      duracao,
      preco,
      status,
      dataPublicacao,
      tags
    } = req.body;

    // Verificar se curso existe
    const existingCurso = await prisma.curso.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCurso) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }

    const updateData: any = {
      titulo,
      descricao,
      instrutorId: instrutorId ? parseInt(instrutorId) : null,
      categoria,
      nivel,
      duracao,
      preco: preco ? parseFloat(preco) : null,
      status: status || 'ativo',
      dataPublicacao: dataPublicacao ? new Date(dataPublicacao) : existingCurso.dataPublicacao,
      tags
    };

    if (req.file) {
      updateData.arquivo = req.file.filename;
    }

    const updatedCurso = await prisma.curso.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        instrutor: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });

    res.json(updatedCurso);
  } catch (error) {
    logError(`PUT /api/cursos/${req.params.id}`, error, req);
    console.error('Erro ao atualizar curso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/cursos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.curso.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Curso excluído com sucesso' });
  } catch (error) {
    logError(`DELETE /api/cursos/${req.params.id}`, error, req);
    console.error('Erro ao excluir curso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Inicializar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Tratamento de encerramento gracioso
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});