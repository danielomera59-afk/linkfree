import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import linksRoutes from './links.routes';
import { prisma } from '../prisma';

jest.mock('../prisma', () => ({
  prisma: {
    link: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    creador: {
      findUnique: jest.fn(),
    },
  },
}));

const app = express();
app.use(express.json());
app.use('/links', linksRoutes);

// Generamos un token válido de verdad, firmado con la misma clave
// que usa la app (definida en jest.setup.js), para simular un usuario logueado
const tokenValido = jwt.sign(
  { id: 'creador-1', usuario: 'test', rol: 'USUARIO' },
  process.env.JWT_SECRET as string
);

describe('POST /links', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rechaza con 401 si no se manda token', async () => {
    const respuesta = await request(app)
      .post('/links')
      .send({ titulo: 'Mi Instagram', url: 'https://instagram.com/test' });

    expect(respuesta.status).toBe(401);
  });

  it('rechaza con 400 si faltan campos', async () => {
    const respuesta = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${tokenValido}`)
      .send({ titulo: 'Sin URL' });

    expect(respuesta.status).toBe(400);
  });

  it('crea el link asociado al creador del token', async () => {
    (prisma.link.create as jest.Mock).mockResolvedValue({
      id: 'link-1',
      titulo: 'Mi Instagram',
      url: 'https://instagram.com/test',
      creadorId: 'creador-1',
    });

    const respuesta = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${tokenValido}`)
      .send({ titulo: 'Mi Instagram', url: 'https://instagram.com/test' });

    expect(respuesta.status).toBe(201);
    expect(prisma.link.create).toHaveBeenCalledWith({
      data: { titulo: 'Mi Instagram', url: 'https://instagram.com/test', creadorId: 'creador-1' },
    });
  });
});

describe('GET /links/mios', () => {
  it('devuelve los links del creador logueado', async () => {
    (prisma.link.findMany as jest.Mock).mockResolvedValue([
      { id: 'link-1', titulo: 'Mi Instagram' },
    ]);

    const respuesta = await request(app)
      .get('/links/mios')
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(1);
  });
});

describe('DELETE /links/:id', () => {
  it('rechaza con 404 si el link no le pertenece al creador', async () => {
    (prisma.link.findUnique as jest.Mock).mockResolvedValue({
      id: 'link-1',
      creadorId: 'otro-creador',
    });

    const respuesta = await request(app)
      .delete('/links/link-1')
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(respuesta.status).toBe(404);
  });

  it('borra el link si sí le pertenece al creador', async () => {
    (prisma.link.findUnique as jest.Mock).mockResolvedValue({
      id: 'link-1',
      creadorId: 'creador-1',
    });
    (prisma.link.delete as jest.Mock).mockResolvedValue({});

    const respuesta = await request(app)
      .delete('/links/link-1')
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(respuesta.status).toBe(200);
  });
});

describe('GET /links/publico/:usuario', () => {
  it('devuelve 404 si el creador no existe', async () => {
    (prisma.creador.findUnique as jest.Mock).mockResolvedValue(null);

    const respuesta = await request(app).get('/links/publico/noexiste');

    expect(respuesta.status).toBe(404);
  });

  it('devuelve los datos públicos si el creador existe', async () => {
    (prisma.creador.findUnique as jest.Mock).mockResolvedValue({
      nombre: 'Test',
      usuario: 'test',
      bio: null,
      links: [],
      encuestas: [],
      sorteos: [],
      ruletas: [],
      referidos: [],
    });

    const respuesta = await request(app).get('/links/publico/test');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.usuario).toBe('test');
  });
});