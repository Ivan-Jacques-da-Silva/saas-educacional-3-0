
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();

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

// Rota de login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: 'Login e senha são obrigatórios' });
    }

    // Buscar usuário por login ou email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { login: login },
          { email: login }
        ]
      },
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
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token JWT (opcional)
    const token = jwt.sign(
      { userId: user.id, login: user.login },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '24h' }
    );

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    logError('POST /login', error, req);
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de logout
router.post('/logout', async (req: Request, res: Response) => {
  try {
    res.json({ success: true, message: 'Logout realizado com sucesso' });
  } catch (error) {
    logError('POST /logout', error, req);
    console.error('Erro no logout:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para verificar se usuário está autenticado
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key') as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    logError('GET /me', error, req);
    console.error('Erro ao verificar usuário:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
});

export default router;
