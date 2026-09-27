import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import ruletasRoutes from './ruletas.routes';
import { prisma } from '../prisma';

jest.mock('../prisma', () => ({
  prisma: {
    ruleta: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    segmento: {
      deleteMany: jest.fn(),
    },
  },
}));

const app = express();
app.use(express.json());
app.use('/ruletas', ruletasRoutes);

const tokenValido = jwt.sign(
  { id: 'creador-1', usuario: 'test', rol: 'USUARIO' },
  process.env.JWT_SECRET as string
);

describe('POST /ruletas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rechaza con 400 si hay menos de 2 segmentos', async () => {
    const respuesta = await request(app)
      .post('/ruletas')
      .set('Authorization', `Bearer ${tokenValido}`)
      .send({ titulo: 'Ruleta', segmentos: [{ texto: 'Solo uno' }] });

    expect(respuesta.status).toBe(400);
  });

  it('crea la ruleta con sus segmentos', async () => {
    (prisma.ruleta.create as jest.Mock).mockResolvedValue({ id: 'ruleta-1' });

    const respuesta = await request(app)
      .post('/ruletas')
      .set('Authorization', `Bearer ${tokenValido}`)
      .send({
        titulo: 'Ruleta',
        segmentos: [{ texto: 'A', peso: 1 }, { texto: 'B', peso: 2 }],
      });

    expect(respuesta.status).toBe(201);
  });
});

describe('POST /ruletas/:id/girar', () => {
  it('devuelve 404 si la ruleta no existe', async () => {
    (prisma.ruleta.findUnique as jest.Mock).mockResolvedValue(null);

    const respuesta = await request(app).post('/ruletas/no-existe/girar');

    expect(respuesta.status).toBe(404);
  });

  it('devuelve un resultado si la ruleta existe con segmentos', async () => {
    (prisma.ruleta.findUnique as jest.Mock).mockResolvedValue({
      id: 'ruleta-1',
      activa: true,
      segmentos: [{ id: 'seg-1', texto: 'Ganaste', peso: 1 }],
    });

    const respuesta = await request(app).post('/ruletas/ruleta-1/girar');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.resultado).toBe('Ganaste');
  });
});

describe('DELETE /ruletas/:id', () => {
  it('rechaza con 404 si no le pertenece al creador', async () => {
    (prisma.ruleta.findUnique as jest.Mock).mockResolvedValue({
      id: 'ruleta-1',
      creadorId: 'otro-creador',
    });

    const respuesta = await request(app)
      .delete('/ruletas/ruleta-1')
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(respuesta.status).toBe(404);
  });
});
describe('GET /ruletas/mias', () => {
  it('devuelve las ruletas del creador logueado', async () => {
    (prisma.ruleta.findMany as jest.Mock).mockResolvedValue([{ id: 'ruleta-1' }]);

    const respuesta = await request(app)
      .get('/ruletas/mis')
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(respuesta.status).toBe(200);
  });
});