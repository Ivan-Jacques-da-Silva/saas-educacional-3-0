
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();

// Configuração do Multer para upload de arquivos
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

// Rotas para Áudios
router.get('/audios', async (req: Request, res: Response) => {
  try {
    const audios = await prisma.audio.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      },
      orderBy: { titulo: 'asc' }
    });
    res.json(audios);
  } catch (error) {
    logError('GET /audios', error, req);
    console.error('Erro ao buscar áudios:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/audios', upload.single('arquivo'), async (req: Request, res: Response) => {
  try {
    const {
      titulo,
      descricao,
      usuarioId,
      categoria,
      duracao,
      status
    } = req.body;

    const newAudio = await prisma.audio.create({
      data: {
        titulo,
        descricao,
        usuarioId: usuarioId ? parseInt(usuarioId) : null,
        categoria,
        duracao,
        status: status || 'ativo',
        arquivo: req.file ? req.file.filename : null
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({ message: 'Áudio cadastrado com sucesso', audio: newAudio });
  } catch (error) {
    logError('POST /audios', error, req);
    console.error('Erro ao criar áudio:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/audios/:id', upload.single('arquivo'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      descricao,
      usuarioId,
      categoria,
      duracao,
      status
    } = req.body;

    const updateData: any = {
      titulo,
      descricao,
      usuarioId: usuarioId ? parseInt(usuarioId) : null,
      categoria,
      duracao,
      status: status || 'ativo'
    };

    if (req.file) {
      updateData.arquivo = req.file.filename;
    }

    const updatedAudio = await prisma.audio.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });

    res.json({ message: 'Áudio atualizado com sucesso', audio: updatedAudio });
  } catch (error) {
    logError(`PUT /audios/${req.params.id}`, error, req);
    console.error('Erro ao atualizar áudio:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/audios/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.audio.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Áudio excluído com sucesso' });
  } catch (error) {
    logError(`DELETE /audios/${req.params.id}`, error, req);
    console.error('Erro ao excluir áudio:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
