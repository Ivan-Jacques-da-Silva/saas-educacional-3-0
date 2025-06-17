import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

// Importar rotas
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
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

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', escolasRoutes);
app.use('/api', matriculasRoutes);
app.use('/api', cursosRoutes);
app.use('/api', turmasRoutes);
app.use('/api', audiosRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando!' });
});

// Rota para listar todas as rotas disponíveis
app.get('/api/routes', (req, res) => {
  res.json({
    message: 'Rotas disponíveis',
    routes: {
      auth: [
        'POST /api/auth/login',
        'GET /api/auth/me/:id'
      ],
      dashboard: [
        'GET /api/dashboard/stats',
        'GET /api/dashboard/escola/:escolaId/stats'
      ],
      usuarios: [
        'GET /api/users',
        'GET /api/users/:id',
        'POST /api/users',
        'PUT /api/users/:id',
        'DELETE /api/users/:id',
        'POST /api/register',
        'PUT /api/change-password/:id',
        'PUT /api/edit-user/:id',
        'GET /api/usuarios-matricula'
      ],
      escolas: [
        'GET /api/escolas',
        'GET /api/escolas/:id',
        'POST /api/escolas',
        'PUT /api/escolas/:id',
        'DELETE /api/escolas/:id'
      ],
      matriculas: [
        'GET /api/matriculas',
        'GET /api/matriculas/:id',
        'POST /api/matriculas',
        'PUT /api/matriculas/:id',
        'DELETE /api/matriculas/:id'
      ],
      cursos: [
        'GET /api/cursos',
        'GET /api/cursos/:id',
        'POST /api/cursos',
        'PUT /api/cursos/:id',
        'DELETE /api/cursos/:id'
      ],
      turmas: [
        'GET /api/turmas',
        'GET /api/turmas/:id',
        'POST /api/register-turma',
        'PUT /api/update-turma/:id',
        'DELETE /api/turmas/:id',
        'GET /api/users-professores'
      ],
      audios: [
        'GET /api/audios',
        'GET /api/audios/:id',
        'POST /api/audios',
        'PUT /api/audios/:id',
        'DELETE /api/audios/:id'
      ]
    }
  });
});

// Tratamento de erros global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Inicializar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
  console.log(`Rotas disponíveis: http://localhost:${PORT}/api/routes`);
});

// Tratamento de encerramento gracioso
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});