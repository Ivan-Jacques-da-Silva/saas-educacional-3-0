
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

// Rotas para Cursos
router.get('/cursos', async (req: Request, res: Response) => {
  try {
    const cursos = await prisma.curso.findMany({
      include: {
        instrutor: {
          select: {
            id: true,
            nome: true,
            email: true
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
            nome: true,
            email: true
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
      dataPublicacao,
      tags
    } = req.body;

    // Verificar se curso já existe
    const existingCurso = await prisma.curso.findFirst({
      where: { titulo: titulo }
    });

    if (existingCurso) {
      return res.json({ exists: true, message: 'Curso já cadastrado' });
    }

    // Criar curso
    const newCurso = await prisma.curso.create({
      data: {
        titulo,
        descricao,
        instrutorId: instrutorId ? parseInt(instrutorId) : null,
        categoria,
        nivel,
        duracao,
        preco: preco ? parseFloat(preco) : null,
        status: status || 'ativo',
        dataPublicacao: dataPublicacao ? new Date(dataPublicacao) : new Date(),
        tags,
        arquivo: req.file ? req.file.filename : null
      },
      include: {
        instrutor: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({ exists: false, curso: newCurso });
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
      dataPublicacao,
      tags
    } = req.body;

    // Verificar se curso existe
    const existingCurso = await prisma.curso.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCurso) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }

    const updateData: any = {
      titulo,
      descricao,
      instrutorId: instrutorId ? parseInt(instrutorId) : null,
      categoria,
      nivel,
      duracao,
      preco: preco ? parseFloat(preco) : null,
      status: status || 'ativo',
      dataPublicacao: dataPublicacao ? new Date(dataPublicacao) : existingCurso.dataPublicacao,
      tags
    };

    if (req.file) {
      updateData.arquivo = req.file.filename;
    }

    const updatedCurso = await prisma.curso.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        instrutor: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    });

    res.json(updatedCurso);
  } catch (error) {
    logError(`PUT /cursos/${req.params.id}`, error, req);
    console.error('Erro ao atualizar curso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/cursos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

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
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
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
      where: { id: parseInt(id) }
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

router.post('/cursos', upload.fields([
  { name: 'pdf1', maxCount: 1 },
  { name: 'pdf2', maxCount: 1 },
  { name: 'pdf3', maxCount: 1 }
]), async (req: Request, res: Response) => {
  try {
    const { titulo, youtubeLink } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Verificar se curso já existe
    const existingCurso = await prisma.curso.findFirst({
      where: { titulo: titulo }
    });

    if (existingCurso) {
      return res.json({ exists: true, message: 'Curso já cadastrado' });
    }

    // Criar curso
    const newCurso = await prisma.curso.create({
      data: {
        titulo,
        youtubeLink: youtubeLink || null,
        pdf1: files?.pdf1?.[0]?.filename || null,
        pdf2: files?.pdf2?.[0]?.filename || null,
        pdf3: files?.pdf3?.[0]?.filename || null,
        status: 'ativo'
      }
    });

    res.status(201).json({ exists: false, id: newCurso.id, curso: newCurso });
  } catch (error) {
    logError('POST /cursos', error, req);
    console.error('Erro ao criar curso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/cursos/:id', upload.fields([
  { name: 'pdf1', maxCount: 1 },
  { name: 'pdf2', maxCount: 1 },
  { name: 'pdf3', maxCount: 1 }
]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { titulo, youtubeLink } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Verificar se curso existe
    const existingCurso = await prisma.curso.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCurso) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }

    const updateData: any = {
      titulo,
      youtubeLink: youtubeLink || null
    };

    if (files?.pdf1) updateData.pdf1 = files.pdf1[0].filename;
    if (files?.pdf2) updateData.pdf2 = files.pdf2[0].filename;
    if (files?.pdf3) updateData.pdf3 = files.pdf3[0].filename;

    const updatedCurso = await prisma.curso.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(updatedCurso);
  } catch (error) {
    logError(`PUT /cursos/${req.params.id}`, error, req);
    console.error('Erro ao atualizar curso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/cursos/:id/audios', upload.array('audios'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo de áudio enviado' });
    }

    // Criar registros de áudio para cada arquivo
    const audios = await Promise.all(
      files.map(file => 
        prisma.audio.create({
          data: {
            titulo: file.originalname,
            arquivo: file.filename,
            cursoId: parseInt(id),
            status: 'ativo'
          }
        })
      )
    );

    res.json({ message: 'Áudios adicionados com sucesso', audios });
  } catch (error) {
    logError(`POST /cursos/${req.params.id}/audios`, error, req);
    console.error('Erro ao adicionar áudios:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/cursos/:id/audios', upload.array('audios'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.json({ message: 'Nenhum novo áudio para adicionar' });
    }

    // Criar registros de áudio para cada arquivo
    const audios = await Promise.all(
      files.map(file => 
        prisma.audio.create({
          data: {
            titulo: file.originalname,
            arquivo: file.filename,
            cursoId: parseInt(id),
            status: 'ativo'
          }
        })
      )
    );

    res.json({ message: 'Áudios atualizados com sucesso', audios });
  } catch (error) {
    logError(`PUT /cursos/${req.params.id}/audios`, error, req);
    console.error('Erro ao atualizar áudios:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/audios-curso/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const audios = await prisma.audio.findMany({
      where: { cursoId: parseInt(id) },
      orderBy: { titulo: 'asc' }
    });
    res.json(audios);
  } catch (error) {
    logError(`GET /audios-curso/${req.params.id}`, error, req);
    console.error('Erro ao buscar áudios do curso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/cursos/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

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
