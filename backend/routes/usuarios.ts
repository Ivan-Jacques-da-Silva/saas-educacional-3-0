
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const prisma = new PrismaClient();

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
  const logDir = path.join(__dirname, '..', 'logs');
  const logFile = path.join(logDir, `error-${new Date().toISOString().split('T')[0]}.log`);

  // Log detalhado em JSON
  const detailedLogFile = path.join(logDir, `detailed-error-${new Date().toISOString().split('T')[0]}.json`);

  try {
    const fs = require('fs');
    // Log simples
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
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

// Rotas para Usuários
router.get('/users', async (req: Request, res: Response) => {
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
    logError('GET /users', error, req);
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/users/:id', async (req: Request, res: Response) => {
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

    // Remove a senha do retorno
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    logError(`GET /users/${req.params.id}`, error, req);
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/users', upload.single('cp_foto_perfil'), async (req: Request, res: Response) => {
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
    logError('POST /users', error, req);
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/users/:id', async (req: Request, res: Response) => {
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
    logError(`PUT /users/${req.params.id}`, error, req);
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    logError(`DELETE /users/${req.params.id}`, error, req);
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para alterar senha
router.put('/change-password/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    // Buscar usuário atual
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Senha atual incorreta' });
    }

    // Criptografar nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para editar usuário
router.put('/edit-user/:id', upload.single('cp_foto_perfil'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const userData = req.body;

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Preparar dados para atualização
    const updateData: any = {
      nome: userData.cp_nome,
      email: userData.cp_email,
      login: userData.cp_login,
      rg: userData.cp_rg || null,
      cpf: userData.cp_cpf,
      dataNascimento: userData.cp_datanascimento,
      estadoCivil: userData.cp_estadocivil || null,
      cnpj: userData.cp_cnpj || null,
      ie: userData.cp_ie || null,
      whatsapp: userData.cp_whatsapp || null,
      telefone: userData.cp_telefone || null,
      empresaAtuacao: userData.cp_empresaatuacao || null,
      profissao: userData.cp_profissao || null,
      endCidadeEstado: userData.cp_end_cidade_estado || null,
      endRua: userData.cp_end_rua || null,
      endNum: userData.cp_end_num || null,
      endCep: userData.cp_end_cep || null,
      descricao: userData.cp_descricao || null,
      escolaId: userData.cp_escola_id ? parseInt(userData.cp_escola_id) : null,
    };

    // Se uma nova foto foi enviada, adicione ao updateData
    if (req.file) {
      updateData.fotoPerfil = req.file.filename;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    // Remover senha do retorno
    const { password, ...userWithoutPassword } = updatedUser;

    res.json({ message: 'Usuário atualizado com sucesso', user: userWithoutPassword });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de registro
router.post('/register', upload.single('cp_foto_perfil'), async (req: Request, res: Response) => {
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
    logError('POST /register', error, req);
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar usuários para matrícula
router.get('/usuarios-matricula', async (req: Request, res: Response) => {
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
    logError('GET /usuarios-matricula', error, req);
    console.error('Erro ao buscar usuários para matrícula:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
