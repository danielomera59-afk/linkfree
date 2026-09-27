import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import adminRoutes from './admin.routes';
import { prisma } from '../prisma';

jest.mock('../prisma', () => ({
  prisma: {
    creador: {
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const app = express();
app.use(express.json());
app.use('/admin', adminRoutes);

const tokenUsuario = jwt.sign(
  { id: 'creador-1', usuario: 'test', rol: 'USUARIO' },
  process.env.JWT_SECRET as string
);

const tokenAdmin = jwt.sign(
  { id: 'admin-1', usuario: 'admin', rol: 'ADMIN' },
  process.env.JWT_SECRET as string
);

describe('GET /admin/creadores', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rechaza con 403 si el usuario no es admin', async () => {
    const respuesta = await request(app)
      .get('/admin/creadores')
      .set('Authorization', `Bearer ${tokenUsuario}`);

    expect(respuesta.status).toBe(403);
  });

  it('devuelve la lista si el usuario es admin', async () => {
    (prisma.creador.findMany as jest.Mock).mockResolvedValue([{ id: '1' }, { id: '2' }]);

    const respuesta = await request(app)
      .get('/admin/creadores')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(2);
  });
});
describe('DELETE /admin/creadores/:id', () => {
  it('rechaza con 403 si el usuario no es admin', async () => {
    const respuesta = await request(app)
      .delete('/admin/creadores/creador-1')
      .set('Authorization', `Bearer ${tokenUsuario}`);

    expect(respuesta.status).toBe(403);
  });

  it('borra el creador si es admin', async () => {
    (prisma.creador.delete as jest.Mock).mockResolvedValue({});

    const respuesta = await request(app)
      .delete('/admin/creadores/creador-1')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(respuesta.status).toBe(200);
  });
});