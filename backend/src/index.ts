import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './prisma';
import authRoutes from './routes/auth.routes';
import linksRoutes from './routes/links.routes';
import encuestasRoutes from './routes/encuestas.routes';
import sorteosRoutes from './routes/sorteos.routes';
import ruletasRoutes from './routes/ruletas.routes';
import referidosRoutes from './routes/referidos.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();
console.log('DATABASE_URL cargada:', process.env.DATABASE_URL ? 'SÍ' : 'NO');
const app = express();
const PORT = process.env.PORT || 3000;

const origenesPermitidos = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  'https://linkfree-qz34ws4n5-danielomera59-2201s-projects.vercel.app',
].filter((origin): origin is string => Boolean(origin));

app.use(cors({ origin: origenesPermitidos }));
app.use(express.json());

// Endpoint de Healthcheck optimizado para despertar/mantener activa la base de datos en Neon
app.get('/health', async (req, res) => {
  try {
    // Consulta SQL directa a la base de datos
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', message: 'Backend y base de datos Neon activos' });
  } catch (error) {
    console.error('Error al hacer ping a la base de datos:', error);
    res.status(500).json({ status: 'error', message: 'Fallo al conectar con la base de datos' });
  }
});

app.use('/auth', authRoutes);
app.use('/links', linksRoutes);
app.use('/encuestas', encuestasRoutes);
app.use('/sorteos', sorteosRoutes);
app.use('/ruletas', ruletasRoutes);
app.use('/referidos', referidosRoutes); 
app.use('/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});