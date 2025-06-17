
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
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

// Rotas para Escolas
router.get('/escolas', async (req: Request, res: Response) => {
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
    logError('GET /escolas', error, req);
    console.error('Erro ao buscar escolas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/escolas', async (req: Request, res: Response) => {
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
    logError('POST /escolas', error, req);
    console.error('Erro ao criar escola:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/escolas/:id', async (req: Request, res: Response) => {
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
    logError(`PUT /escolas/${req.params.id}`, error, req);
    console.error('Erro ao atualizar escola:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/escolas/:id', async (req: Request, res: Response) => {
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
    logError(`GET /escolas/${req.params.id}`, error, req);
    console.error('Erro ao buscar escola:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/escolas/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.escola.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Escola excluída com sucesso' });
  } catch (error) {
    logError(`DELETE /escolas/${req.params.id}`, error, req);
    console.error('Erro ao excluir escola:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
