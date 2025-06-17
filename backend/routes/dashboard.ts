
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
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(logFile, logString);

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

// Rota para buscar estatísticas do dashboard
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [
      totalUsuarios,
      totalEscolas,
      totalMatriculas,
      totalCursos,
      totalTurmas,
      totalAudios
    ] = await Promise.all([
      prisma.user.count(),
      prisma.escola.count(),
      prisma.matricula.count(),
      prisma.curso.count(),
      prisma.turma.count(),
      prisma.audio.count()
    ]);

    // Buscar estatísticas por tipo de usuário
    const usuariosPorTipo = await prisma.user.groupBy({
      by: ['tipoUser'],
      _count: {
        tipoUser: true
      }
    });

    // Buscar matrículas recentes
    const matriculasRecentes = await prisma.matricula.findMany({
      take: 5,
      include: {
        usuario: {
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
      orderBy: { createdAt: 'desc' }
    });

    // Buscar escolas com mais alunos
    const escolasComMaisAlunos = await prisma.escola.findMany({
      include: {
        _count: {
          select: {
            users: true,
            matriculas: true,
            turmas: true
          }
        }
      },
      orderBy: {
        users: {
          _count: 'desc'
        }
      },
      take: 5
    });

    res.json({
      stats: {
        totalUsuarios,
        totalEscolas,
        totalMatriculas,
        totalCursos,
        totalTurmas,
        totalAudios
      },
      usuariosPorTipo,
      matriculasRecentes,
      escolasComMaisAlunos
    });
  } catch (error) {
    logError('GET /stats', error, req);
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar dados específicos por escola
router.get('/escola/:escolaId/stats', async (req: Request, res: Response) => {
  try {
    const { escolaId } = req.params;

    const [
      totalUsuarios,
      totalMatriculas,
      totalTurmas
    ] = await Promise.all([
      prisma.user.count({
        where: { escolaId: parseInt(escolaId) }
      }),
      prisma.matricula.count({
        where: { escolaId: parseInt(escolaId) }
      }),
      prisma.turma.count({
        where: { escolaId: parseInt(escolaId) }
      })
    ]);

    // Buscar matrículas da escola
    const matriculasEscola = await prisma.matricula.findMany({
      where: { escolaId: parseInt(escolaId) },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      escolaId: parseInt(escolaId),
      stats: {
        totalUsuarios,
        totalMatriculas,
        totalTurmas
      },
      matriculasEscola
    });
  } catch (error) {
    logError(`GET /escola/${req.params.escolaId}/stats`, error, req);
    console.error('Erro ao buscar estatísticas da escola:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
