import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import encuestasRoutes from './encuestas.routes';
import { prisma } from '../prisma';

jest.mock('../prisma', () => ({
  prisma: {
    encuesta: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    opcionEncuesta: {
      findUnique: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

const app = express();
app.use(express.json());
app.use('/encuestas', encuestasRoutes);

const tokenValido = jwt.sign(
  { id: 'creador-1', usuario: 'test', rol: 'USUARIO' },
  process.env.JWT_SECRET as string
);

describe('POST /encuestas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rechaza con 400 si hay menos de 2 opciones', async () => {
    const respuesta = await request(app)
      .post('/encuestas')
      .set('Authorization', `Bearer ${tokenValido}`)
      .send({ pregunta: '¿Sí o no?', opciones: ['Solo una'] });

    expect(respuesta.status).toBe(400);
  });

  it('crea la encuesta con sus opciones', async () => {
    (prisma.encuesta.create as jest.Mock).mockResolvedValue({
      id: 'encuesta-1',
      pregunta: '¿Sí o no?',
      opciones: [{ id: 'op-1', texto: 'Sí' }, { id: 'op-2', texto: 'No' }],
    });

    const respuesta = await request(app)
      .post('/encuestas')
      .set('Authorization', `Bearer ${tokenValido}`)
      .send({ pregunta: '¿Sí o no?', opciones: ['Sí', 'No'] });

    expect(respuesta.status).toBe(201);
  });
});

describe('GET /encuestas/mias', () => {
  it('devuelve las encuestas del creador logueado', async () => {
    (prisma.encuesta.findMany as jest.Mock).mockResolvedValue([{ id: 'encuesta-1' }]);

    const respuesta = await request(app)
      .get('/encuestas/mias')
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(1);
  });
});

describe('POST /encuestas/:id/votar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rechaza con 400 si falta opcionId', async () => {
    const respuesta = await request(app).post('/encuestas/encuesta-1/votar').send({});

    expect(respuesta.status).toBe(400);
  });

  it('rechaza con 404 si la opción no pertenece a esa encuesta', async () => {
    (prisma.opcionEncuesta.findUnique as jest.Mock).mockResolvedValue({
      id: 'op-1',
      encuestaId: 'otra-encuesta',
    });

    const respuesta = await request(app)
      .post('/encuestas/encuesta-1/votar')
      .send({ opcionId: 'op-1' });

    expect(respuesta.status).toBe(404);
  });

  it('suma un voto si la opción es válida', async () => {
    (prisma.opcionEncuesta.findUnique as jest.Mock).mockResolvedValue({
      id: 'op-1',
      encuestaId: 'encuesta-1',
      votos: 0,
    });
    (prisma.opcionEncuesta.update as jest.Mock).mockResolvedValue({
      id: 'op-1',
      votos: 1,
    });

    const respuesta = await request(app)
      .post('/encuestas/encuesta-1/votar')
      .send({ opcionId: 'op-1' });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.votos).toBe(1);
  });
});

describe('DELETE /encuestas/:id', () => {
  it('rechaza con 404 si no le pertenece al creador', async () => {
    (prisma.encuesta.findUnique as jest.Mock).mockResolvedValue({
      id: 'encuesta-1',
      creadorId: 'otro-creador',
    });

    const respuesta = await request(app)
      .delete('/encuestas/encuesta-1')
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(respuesta.status).toBe(404);
  });
});