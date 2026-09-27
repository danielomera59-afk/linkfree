import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import sorteosRoutes from './sorteos.routes';
import { prisma } from '../prisma';

jest.mock('../prisma', () => ({
  prisma: {
    sorteo: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    sorteoGanador: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use('/sorteos', sorteosRoutes);

const tokenValido = jwt.sign(
  { id: 'creador-1', usuario: 'test', rol: 'USUARIO' },
  process.env.JWT_SECRET as string
);

describe('POST /sorteos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rechaza con 400 si el límite es menor a 1', async () => {
    const respuesta = await request(app)
      .post('/sorteos')
      .set('Authorization', `Bearer ${tokenValido}`)
      .send({ titulo: 'Sorteo', premio: 'Premio', limiteGanadores: 0 });

    expect(respuesta.status).toBe(400);
  });

  it('crea el sorteo con datos válidos', async () => {
    (prisma.sorteo.create as jest.Mock).mockResolvedValue({ id: 'sorteo-1' });

    const respuesta = await request(app)
      .post('/sorteos')
      .set('Authorization', `Bearer ${tokenValido}`)
      .send({ titulo: 'Sorteo', premio: 'Premio', limiteGanadores: 5 });

    expect(respuesta.status).toBe(201);
  });
});

describe('POST /sorteos/:id/participar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devuelve gano:true si aún hay lugares disponibles', async () => {
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      const tx = {
        sorteo: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'sorteo-1',
            activo: true,
            contador: 2,
            limiteGanadores: 5,
          }),
          update: jest.fn().mockResolvedValue({ contador: 3 }),
        },
        sorteoGanador: {
          create: jest.fn().mockResolvedValue({}),
        },
      };
      return callback(tx);
    });

    const respuesta = await request(app).post('/sorteos/sorteo-1/participar');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.gano).toBe(true);
    expect(respuesta.body.codigo).toBeDefined();
  });

  it('devuelve agotado:true si ya no hay lugares', async () => {
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      const tx = {
        sorteo: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'sorteo-1',
            activo: true,
            contador: 5,
            limiteGanadores: 5,
          }),
          update: jest.fn(),
        },
        sorteoGanador: { create: jest.fn() },
      };
      return callback(tx);
    });

    const respuesta = await request(app).post('/sorteos/sorteo-1/participar');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.agotado).toBe(true);
  });
});

describe('DELETE /sorteos/:id', () => {
  it('rechaza con 404 si no le pertenece al creador', async () => {
    (prisma.sorteo.findUnique as jest.Mock).mockResolvedValue({
      id: 'sorteo-1',
      creadorId: 'otro-creador',
    });

    const respuesta = await request(app)
      .delete('/sorteos/sorteo-1')
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(respuesta.status).toBe(404);
  });
});
describe('GET /sorteos/mios', () => {
  it('devuelve los sorteos del creador logueado', async () => {
    (prisma.sorteo.findMany as jest.Mock).mockResolvedValue([{ id: 'sorteo-1' }]);

    const respuesta = await request(app)
      .get('/sorteos/mios')
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(respuesta.status).toBe(200);
  });
});