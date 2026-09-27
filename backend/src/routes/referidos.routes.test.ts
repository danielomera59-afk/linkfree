import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import referidosRoutes from './referidos.routes';
import { prisma } from '../prisma';

jest.mock('../prisma', () => ({
  prisma: {
    referido: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    creador: {
      findUnique: jest.fn(),
    },
  },
}));

const app = express();
app.use(express.json());
app.use('/referidos', referidosRoutes);

const tokenValido = jwt.sign(
  { id: 'creador-1', usuario: 'test', rol: 'USUARIO' },
  process.env.JWT_SECRET as string
);

describe('POST /referidos/:usuario', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devuelve 404 si el creador de destino no existe', async () => {
    (prisma.creador.findUnique as jest.Mock).mockResolvedValue(null);

    const respuesta = await request(app)
      .post('/referidos/noexiste')
      .send({ nombre: 'Pedro', enlace: 'https://x.com/pedro' });

    expect(respuesta.status).toBe(404);
  });

  it('crea el referido como no destacado', async () => {
    (prisma.creador.findUnique as jest.Mock).mockResolvedValue({ id: 'creador-1' });
    (prisma.referido.create as jest.Mock).mockResolvedValue({
      id: 'ref-1',
      destacado: false,
    });

    const respuesta = await request(app)
      .post('/referidos/test')
      .send({ nombre: 'Pedro', enlace: 'https://x.com/pedro' });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.destacado).toBe(false);
  });
});

describe('PATCH /referidos/:id/destacar', () => {
  it('invierte el estado destacado', async () => {
    (prisma.referido.findUnique as jest.Mock).mockResolvedValue({
      id: 'ref-1',
      creadorId: 'creador-1',
      destacado: false,
    });
    (prisma.referido.update as jest.Mock).mockResolvedValue({
      id: 'ref-1',
      destacado: true,
    });

    const respuesta = await request(app)
      .patch('/referidos/ref-1/destacar')
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.destacado).toBe(true);
  });

  it('rechaza con 404 si no le pertenece al creador', async () => {
    (prisma.referido.findUnique as jest.Mock).mockResolvedValue({
      id: 'ref-1',
      creadorId: 'otro-creador',
    });

    const respuesta = await request(app)
      .patch('/referidos/ref-1/destacar')
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(respuesta.status).toBe(404);
  });
});
describe('GET /referidos/mios', () => {
  it('devuelve los referidos del creador logueado', async () => {
    (prisma.referido.findMany as jest.Mock).mockResolvedValue([{ id: 'ref-1' }]);

    const respuesta = await request(app)
      .get('/referidos/mios')
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(1);
  });
});

describe('DELETE /referidos/:id', () => {
  it('borra el referido si le pertenece al creador', async () => {
    (prisma.referido.findUnique as jest.Mock).mockResolvedValue({
      id: 'ref-1',
      creadorId: 'creador-1',
    });
    (prisma.referido.delete as jest.Mock).mockResolvedValue({});

    const respuesta = await request(app)
      .delete('/referidos/ref-1')
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(respuesta.status).toBe(200);
  });
});
