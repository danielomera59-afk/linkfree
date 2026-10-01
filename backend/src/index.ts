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
import helmet from 'helmet';

dotenv.config();
console.log('DATABASE_URL cargada:', process.env.DATABASE_URL ? 'SÍ' : 'NO');

const app = express();
const PORT = process.env.PORT || 3000;
app.disable('x-powered-by');
app.use(helmet());

// Limpiar la URL del frontend para evitar fallos si incluye '/' al final
const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null;

const origenesPermitidos = [
  'http://localhost:5173',
  ...(process.env.FRONTEND_URL?.split(',').map((url) => url.trim()) ?? []),
].filter(Boolean);

// Configuración completa de CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origen (como Postman o scripts servidor a servidor)
      if (!origin) return callback(null, true);
      
      if (origenesPermitidos.indexOf(origin) !== -1 || origenesPermitidos.includes('*')) {
        callback(null, true);
      } else {
        // En lugar de bloquear bruscamente si despliegas vistas de preview en Vercel con subdominios dinámicos,
        // puedes permitir el origen o registrar el fallo:
        console.warn(`Origen no permitido por CORS: ${origin}`);
        callback(new Error('CORS no permitido'));// O cambia a: callback(new Error('CORS no permitido')) si quieres bloqueo estricto
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

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
// Evita que las respuestas de la API se guarden en caché
app.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  next();
});

app.use('/auth', authRoutes);
app.use('/links', linksRoutes);
app.use('/encuestas', encuestasRoutes);
app.use('/sorteos', sorteosRoutes);
app.use('/ruletas', ruletasRoutes);
app.use('/referidos', referidosRoutes); 
app.use('/admin', adminRoutes);
app.get('/', (_req, res) => res.json({ name: 'LinkFree API' }));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});