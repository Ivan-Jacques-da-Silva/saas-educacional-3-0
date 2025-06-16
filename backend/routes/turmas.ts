
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

// Rotas para Turmas
router.get('/turmas', async (req: Request, res: Response) => {
  try {
    const turmas = await prisma.turma.findMany({
      include: {
        professor: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        escola: {
          select: {
            id: true,
            nome: true
          }
        }
      },
      orderBy: { nome: 'asc' }
    });
    res.json(turmas);
  } catch (error) {
    logError('GET /turmas', error, req);
    console.error('Erro ao buscar turmas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/turmas', async (req: Request, res: Response) => {
  try {
    const {
      nome,
      descricao,
      professorId,
      escolaId,
      horarioInicio,
      horarioFim,
      diasSemana,
      status,
      maxAlunos
    } = req.body;

    const newTurma = await prisma.turma.create({
      data: {
        nome,
        descricao,
        professorId: professorId ? parseInt(professorId) : null,
        escolaId: escolaId ? parseInt(escolaId) : null,
        horarioInicio,
        horarioFim,
        diasSemana,
        status: status || 'ativo',
        maxAlunos: maxAlunos ? parseInt(maxAlunos) : null
      },
      include: {
        professor: {
          select: {
            id: true,
            nome: true,
            email: true
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

    res.status(201).json({ message: 'Turma cadastrada com sucesso', turma: newTurma });
  } catch (error) {
    logError('POST /turmas', error, req);
    console.error('Erro ao criar turma:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/turmas/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      nome,
      descricao,
      professorId,
      escolaId,
      horarioInicio,
      horarioFim,
      diasSemana,
      status,
      maxAlunos
    } = req.body;

    const updatedTurma = await prisma.turma.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        descricao,
        professorId: professorId ? parseInt(professorId) : null,
        escolaId: escolaId ? parseInt(escolaId) : null,
        horarioInicio,
        horarioFim,
        diasSemana,
        status: status || 'ativo',
        maxAlunos: maxAlunos ? parseInt(maxAlunos) : null
      },
      include: {
        professor: {
          select: {
            id: true,
            nome: true,
            email: true
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

    res.json({ message: 'Turma atualizada com sucesso', turma: updatedTurma });
  } catch (error) {
    logError(`PUT /turmas/${req.params.id}`, error, req);
    console.error('Erro ao atualizar turma:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/turmas/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.turma.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Turma excluída com sucesso' });
  } catch (error) {
    logError(`DELETE /turmas/${req.params.id}`, error, req);
    console.error('Erro ao excluir turma:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
