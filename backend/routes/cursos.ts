import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir;
    
    // Verificar se é áudio (.mp3) ou PDF
    if (file.mimetype === 'audio/mpeg' || file.originalname.toLowerCase().endsWith('.mp3')) {
      uploadDir = path.join(__dirname, '..', 'uploads', 'audios');
    } else if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      uploadDir = path.join(__dirname, '..', 'uploads', 'pdfs');
    } else {
      uploadDir = path.join(__dirname, '..', 'uploads', 'outros');
    }
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Filtro para aceitar apenas .mp3 e .pdf
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = ['audio/mpeg', 'application/pdf'];
  const allowedExtensions = ['.mp3', '.pdf'];
  
  const isValidMime = allowedMimes.includes(file.mimetype);
  const isValidExtension = allowedExtensions.some(ext => 
    file.originalname.toLowerCase().endsWith(ext)
  );
  
  if (isValidMime || isValidExtension) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos .mp3 e .pdf são permitidos'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter
});

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

  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(logFile, logString);
  } catch (logErr) {
    console.error('Erro ao escrever log:', logErr);
  }
};

// Rotas para Cursos
router.get('/cursos', async (req: Request, res: Response) => {
  try {
    const cursos = await prisma.curso.findMany({
      include: {
        instrutor: {
          select: {
            id: true,
            nome: true
          }
        }
      },
      orderBy: { titulo: 'asc' }
    });
    res.json(cursos);
  } catch (error) {
    logError('GET /cursos', error, req);
    console.error('Erro ao buscar cursos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/cursos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const curso = await prisma.curso.findUnique({
      where: { id: parseInt(id) },
      include: {
        instrutor: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    if (!curso) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }

    res.json(curso);
  } catch (error) {
    logError(`GET /cursos/${req.params.id}`, error, req);
    console.error('Erro ao buscar curso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/cursos', upload.single('arquivo'), async (req: Request, res: Response) => {
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
      tags
    } = req.body;

    const cursoData: any = {
      titulo,
      descricao,
      categoria,
      nivel,
      duracao,
      preco: preco ? parseFloat(preco) : null,
      status: status || 'ativo',
      tags
    };

    if (instrutorId) {
      cursoData.instrutorId = parseInt(instrutorId);
    }

    if (req.file) {
      cursoData.arquivo = req.file.filename;
    }

    const curso = await prisma.curso.create({
      data: cursoData,
      include: {
        instrutor: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    res.status(201).json(curso);
  } catch (error) {
    logError('POST /cursos', error, req);
    console.error('Erro ao criar curso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/cursos/:id', upload.single('arquivo'), async (req: Request, res: Response) => {
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
      tags
    } = req.body;

    const cursoExistente = await prisma.curso.findUnique({
      where: { id: parseInt(id) }
    });

    if (!cursoExistente) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }

    const cursoData: any = {
      titulo,
      descricao,
      categoria,
      nivel,
      duracao,
      preco: preco ? parseFloat(preco) : null,
      status: status || 'ativo',
      tags
    };

    if (instrutorId) {
      cursoData.instrutorId = parseInt(instrutorId);
    }

    if (req.file) {
      cursoData.arquivo = req.file.filename;

      // Remover arquivo antigo se existir
      if (cursoExistente.arquivo) {
        // Tentar encontrar o arquivo nas diferentes pastas
        const possiblePaths = [
          path.join(__dirname, '..', 'uploads', 'audios', cursoExistente.arquivo),
          path.join(__dirname, '..', 'uploads', 'pdfs', cursoExistente.arquivo),
          path.join(__dirname, '..', 'uploads', 'outros', cursoExistente.arquivo),
          path.join(__dirname, '..', 'uploads', cursoExistente.arquivo) // pasta antiga
        ];
        
        for (const filePath of possiblePaths) {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            break;
          }
        }
      }
    }

    const curso = await prisma.curso.update({
      where: { id: parseInt(id) },
      data: cursoData,
      include: {
        instrutor: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    res.json(curso);
  } catch (error) {
    logError(`PUT /cursos/${req.params.id}`, error, req);
    console.error('Erro ao atualizar curso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/cursos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const curso = await prisma.curso.findUnique({
      where: { id: parseInt(id) }
    });

    if (!curso) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }

    // Remover arquivo se existir
    if (curso.arquivo) {
      // Tentar encontrar o arquivo nas diferentes pastas
      const possiblePaths = [
        path.join(__dirname, '..', 'uploads', 'audios', curso.arquivo),
        path.join(__dirname, '..', 'uploads', 'pdfs', curso.arquivo),
        path.join(__dirname, '..', 'uploads', 'outros', curso.arquivo),
        path.join(__dirname, '..', 'uploads', curso.arquivo) // pasta antiga
      ];
      
      for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          break;
        }
      }
    }

    await prisma.curso.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Curso excluído com sucesso' });
  } catch (error) {
    logError(`DELETE /cursos/${req.params.id}`, error, req);
    console.error('Erro ao excluir curso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;