import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import authRoutes from './auth.routes';
import { prisma } from '../prisma';

// Reemplazamos el módulo real de prisma por uno falso
jest.mock('../prisma', () => ({
  prisma: {
    creador: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('POST /auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rechaza con 401 si el email no existe', async () => {
    (prisma.creador.findUnique as jest.Mock).mockResolvedValue(null);

    const respuesta = await request(app)
      .post('/auth/login')
      .send({ email: 'noexiste@correo.com', password: '123456' });

    expect(respuesta.status).toBe(401);
    expect(respuesta.body.error).toBe('Credenciales inválidas');
  });

  it('rechaza con 401 si la contraseña es incorrecta', async () => {
    const passwordHash = await bcrypt.hash('correcta123', 10);
    (prisma.creador.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'test@correo.com',
      passwordHash,
      usuario: 'test',
      rol: 'USUARIO',
    });

    const respuesta = await request(app)
      .post('/auth/login')
      .send({ email: 'test@correo.com', password: 'incorrecta' });

    expect(respuesta.status).toBe(401);
  });

  it('devuelve 200 y un token si las credenciales son correctas', async () => {
    const passwordHash = await bcrypt.hash('correcta123', 10);
    (prisma.creador.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'test@correo.com',
      passwordHash,
      usuario: 'test',
      nombre: 'Test',
      rol: 'USUARIO',
    });

    const respuesta = await request(app)
      .post('/auth/login')
      .send({ email: 'test@correo.com', password: 'correcta123' });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.token).toBeDefined();
    expect(respuesta.body.creador.usuario).toBe('test');
  });
});