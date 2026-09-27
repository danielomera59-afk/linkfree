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
describe('POST /auth/registro', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rechaza con 400 si faltan campos', async () => {
    const respuesta = await request(app)
      .post('/auth/registro')
      .send({ nombre: 'Pedro' });

    expect(respuesta.status).toBe(400);
  });

  it('rechaza con 409 si el usuario o email ya existen', async () => {
    (prisma.creador.findFirst as jest.Mock).mockResolvedValue({ id: 'existente' });

    const respuesta = await request(app).post('/auth/registro').send({
      nombre: 'Pedro',
      usuario: 'pedro',
      email: 'pedro@correo.com',
      password: '123456',
    });

    expect(respuesta.status).toBe(409);
  });

  it('crea el creador si los datos son válidos', async () => {
    (prisma.creador.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.creador.create as jest.Mock).mockResolvedValue({
      id: 'nuevo-1',
      nombre: 'Pedro',
      usuario: 'pedro',
    });

    const respuesta = await request(app).post('/auth/registro').send({
      nombre: 'Pedro',
      usuario: 'pedro',
      email: 'pedro@correo.com',
      password: '123456',
    });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.usuario).toBe('pedro');
  });
});