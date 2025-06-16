import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

// Importar as rotas modularizadas
import usuariosRoutes from './routes/usuarios';
import escolasRoutes from './routes/escolas';
import matriculasRoutes from './routes/matriculas';
import cursosRoutes from './routes/cursos';
import turmasRoutes from './routes/turmas';
import audiosRoutes from './routes/audios';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'https://testes.cursoviolaocristao.com.br'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Criar diretório de uploads se não existir
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Criar diretório de logs se não existir
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Usar as rotas modularizadas (sem /api)
app.use('/', usuariosRoutes);
app.use('/', escolasRoutes);
app.use('/', matriculasRoutes);
app.use('/', cursosRoutes);
app.use('/', turmasRoutes);
app.use('/', audiosRoutes);

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static('uploads'));

// Rota específica para imagens de perfil
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads', filename);

  // Verificar se o arquivo existe
  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    // Enviar imagem padrão se não encontrar
    res.status(404).json({ error: 'Imagem não encontrada' });
  }
});

// Inicializar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Tratamento de encerramento gracioso
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});