
const { execSync } = require('child_process');

console.log('Instalando dependências...');
execSync('npm install', { stdio: 'inherit' });

console.log('Gerando cliente Prisma...');
execSync('npx prisma generate', { stdio: 'inherit' });

console.log('Aplicando migrações...');
execSync('npx prisma db push', { stdio: 'inherit' });

console.log('Inserindo dados iniciais...');
execSync('node prisma/seed.js', { stdio: 'inherit' });

console.log('Backend inicializado com sucesso!');
