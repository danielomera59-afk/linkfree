import { Router } from 'express';
import { prisma } from '../prisma';
import { verificarToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Crear un link (requiere estar logueado)
router.post('/', verificarToken, async (req: AuthRequest, res) => {
  try {
    const { titulo, url } = req.body;

    if (!titulo || !url) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const nuevoLink = await prisma.link.create({
      data: { titulo, url, creadorId: req.creadorId! },
    });

    res.status(201).json(nuevoLink);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el link' });
  }
});

// Listar mis propios links (requiere estar logueado)
router.get('/mios', verificarToken, async (req: AuthRequest, res) => {
  try {
    const links = await prisma.link.findMany({
      where: { creadorId: req.creadorId! },
      orderBy: { orden: 'asc' },
    });
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los links' });
  }
});

// Borrar un link (requiere estar logueado y ser el dueño)
router.delete('/:id', verificarToken, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;

    if (!id) {
      return res.status(400).json({ error: 'Falta el id del link' });
    }

    const link = await prisma.link.findUnique({ where: { id } });

    if (!link || link.creadorId !== req.creadorId) {
      return res.status(404).json({ error: 'Link no encontrado' });
    }

    await prisma.link.delete({ where: { id } });
    res.json({ mensaje: 'Link eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el link' });
  }
});
// Ruta PÚBLICA: ver la página de un creador por su @usuario (sin login)
router.get('/publico/:usuario', async (req, res) => {
  try {
    const creador = await prisma.creador.findUnique({
      where: { usuario: req.params.usuario },
      include: { links: { where: { activo: true }, orderBy: { orden: 'asc' } } },
    });

    if (!creador) {
      return res.status(404).json({ error: 'Creador no encontrado' });
    }

    res.json({
      nombre: creador.nombre,
      usuario: creador.usuario,
      bio: creador.bio,
      links: creador.links,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la página' });
  }
});

export default router;