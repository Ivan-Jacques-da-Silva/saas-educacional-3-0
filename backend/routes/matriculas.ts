
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

// Rotas para Matrículas
router.get('/matriculas', async (req: Request, res: Response) => {
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
    logError('GET /matriculas', error, req);
    console.error('Erro ao buscar matrículas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/matriculas/:id', async (req: Request, res: Response) => {
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
    logError(`GET /matriculas/${req.params.id}`, error, req);
    console.error('Erro ao buscar matrícula:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/matriculas', async (req: Request, res: Response) => {
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
    logError('POST /matriculas', error, req);
    console.error('Erro ao criar matrícula:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/matriculas/:id', async (req: Request, res: Response) => {
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
    logError(`PUT /matriculas/${req.params.id}`, error, req);
    console.error('Erro ao atualizar matrícula:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/matriculas/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.matricula.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Matrícula excluída com sucesso' });
  } catch (error) {
    logError(`DELETE /matriculas/${req.params.id}`, error, req);
    console.error('Erro ao excluir matrícula:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
