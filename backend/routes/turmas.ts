

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

// Buscar todas as turmas
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
        },
        curso: {
          select: {
            id: true,
            titulo: true
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

// Buscar turma por ID
router.get('/turmas/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const turma = await prisma.turma.findUnique({
      where: { id: parseInt(id) },
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
        },
        curso: {
          select: {
            id: true,
            titulo: true
          }
        }
      }
    });

    if (!turma) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }

    res.json(turma);
  } catch (error) {
    logError(`GET /turmas/${req.params.id}`, error, req);
    console.error('Erro ao buscar turma:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Cadastrar nova turma
router.post('/register-turma', async (req: Request, res: Response) => {
  try {
    const {
      cp_tr_nome,
      cp_tr_data,
      cp_tr_id_professor,
      cp_tr_id_escola,
      cp_tr_curso_id,
      cp_tr_alunos,
      cp_tr_dias_semana
    } = req.body;

    // Verificar se turma já existe
    const existingTurma = await prisma.turma.findFirst({
      where: {
        nome: cp_tr_nome,
        escolaId: parseInt(cp_tr_id_escola)
      }
    });

    if (existingTurma) {
      return res.json({ exists: true, message: 'Turma já cadastrada nesta escola' });
    }

    // Criar turma
    const newTurma = await prisma.turma.create({
      data: {
        nome: cp_tr_nome,
        data: new Date(cp_tr_data),
        professorId: cp_tr_id_professor ? parseInt(cp_tr_id_professor) : null,
        escolaId: cp_tr_id_escola ? parseInt(cp_tr_id_escola) : null,
        cursoId: cp_tr_curso_id ? parseInt(cp_tr_curso_id) : null,
        diasSemana: cp_tr_dias_semana ? JSON.stringify(cp_tr_dias_semana) : null,
        status: 'ativo'
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
        },
        curso: {
          select: {
            id: true,
            titulo: true
          }
        }
      }
    });

    // Atualizar os alunos selecionados para vincular à turma criada
    if (cp_tr_alunos && cp_tr_alunos.length > 0) {
      await prisma.user.updateMany({
        where: {
          id: { in: cp_tr_alunos.map((id: any) => parseInt(id)) }
        },
        data: {
          // Aqui você precisaria adicionar um campo turmaId no modelo User se quiser vincular diretamente
          // Por enquanto, vou manter sem essa vinculação direta
        }
      });
    }

    res.status(201).json({ exists: false, turma: newTurma });
  } catch (error) {
    logError('POST /register-turma', error, req);
    console.error('Erro ao criar turma:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar turma
router.put('/update-turma/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      cp_tr_nome,
      cp_tr_data,
      cp_tr_id_professor,
      cp_tr_id_escola,
      cp_tr_curso_id,
      cp_tr_alunos,
      cp_tr_dias_semana
    } = req.body;

    // Verificar se turma existe
    const existingTurma = await prisma.turma.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingTurma) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }

    const updatedTurma = await prisma.turma.update({
      where: { id: parseInt(id) },
      data: {
        nome: cp_tr_nome,
        data: new Date(cp_tr_data),
        professorId: cp_tr_id_professor ? parseInt(cp_tr_id_professor) : null,
        escolaId: cp_tr_id_escola ? parseInt(cp_tr_id_escola) : null,
        cursoId: cp_tr_curso_id ? parseInt(cp_tr_curso_id) : null,
        diasSemana: cp_tr_dias_semana ? JSON.stringify(cp_tr_dias_semana) : null
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
        },
        curso: {
          select: {
            id: true,
            titulo: true
          }
        }
      }
    });

    res.json({ message: 'Turma atualizada com sucesso', turma: updatedTurma });
  } catch (error) {
    logError(`PUT /update-turma/${req.params.id}`, error, req);
    console.error('Erro ao atualizar turma:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir turma
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

// Buscar professores (usuários tipo 3)
router.get('/users-professores', async (req: Request, res: Response) => {
  try {
    const professores = await prisma.user.findMany({
      where: {
        tipoUser: 3
      },
      select: {
        id: true,
        nome: true,
        email: true,
        escolaId: true
      },
      orderBy: { nome: 'asc' }
    });
    res.json(professores.map(prof => ({
      cp_id: prof.id,
      cp_nome: prof.nome,
      cp_email: prof.email,
      cp_escola_id: prof.escolaId
    })));
  } catch (error) {
    logError('GET /users-professores', error, req);
    console.error('Erro ao buscar professores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;

