
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

// Rota para dados do dashboard
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    // Buscar contadores principais
    const [
      totalUsuarios,
      totalEscolas,
      totalMatriculas,
      totalCursos,
      totalTurmas,
      totalAudios,
      matriculasAtivas,
      matriculasInativas
    ] = await Promise.all([
      prisma.user.count(),
      prisma.escola.count(),
      prisma.matricula.count(),
      prisma.curso.count(),
      prisma.turma.count(),
      prisma.audio.count(),
      prisma.matricula.count({ where: { status: 'ativo' } }),
      prisma.matricula.count({ where: { status: { not: 'ativo' } } })
    ]);

    // Buscar dados recentes
    const [
      usuariosRecentes,
      matriculasRecentes,
      cursosRecentes
    ] = await Promise.all([
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nome: true,
          email: true,
          createdAt: true
        }
      }),
      prisma.matricula.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
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
        }
      }),
      prisma.curso.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          titulo: true,
          categoria: true,
          preco: true,
          createdAt: true
        }
      })
    ]);

    res.json({
      contadores: {
        totalUsuarios,
        totalEscolas,
        totalMatriculas,
        totalCursos,
        totalTurmas,
        totalAudios,
        matriculasAtivas,
        matriculasInativas
      },
      recentes: {
        usuarios: usuariosRecentes,
        matriculas: matriculasRecentes,
        cursos: cursosRecentes
      }
    });
  } catch (error) {
    logError('GET /dashboard', error, req);
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
