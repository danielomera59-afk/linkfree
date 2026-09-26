import { Router } from 'express';
import { prisma } from '../prisma';
import { verificarToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Enviar un perfil como referido (PÚBLICO, sin login)
router.post('/:usuario', async (req, res) => {
  try {
    const { usuario } = req.params;
    const { nombre, enlace, mensaje } = req.body;

    if (!nombre || !enlace) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const creador = await prisma.creador.findUnique({ where: { usuario } });

    if (!creador) {
      return res.status(404).json({ error: 'Creador no encontrado' });
    }

    const nuevoReferido = await prisma.referido.create({
      data: { nombre, enlace, mensaje, creadorId: creador.id },
    });

    res.status(201).json(nuevoReferido);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al enviar el perfil' });
  }
});

// Listar TODOS mis referidos, aprobados y pendientes (requiere estar logueado)
router.get('/mios', verificarToken, async (req: AuthRequest, res) => {
  try {
    const referidos = await prisma.referido.findMany({
      where: { creadorId: req.creadorId! },
      orderBy: { createdAt: 'desc' },
    });
    res.json(referidos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los referidos' });
  }
});

// Aprobar (destacar) un referido (requiere estar logueado y ser el dueño)
router.patch('/:id/destacar', verificarToken, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;

    const referido = await prisma.referido.findUnique({ where: { id } });

    if (!referido || referido.creadorId !== req.creadorId) {
      return res.status(404).json({ error: 'Referido no encontrado' });
    }

    const actualizado = await prisma.referido.update({
      where: { id },
      data: { destacado: !referido.destacado },
    });

    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el referido' });
  }
});

// Borrar un referido (requiere estar logueado y ser el dueño)
router.delete('/:id', verificarToken, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;

    const referido = await prisma.referido.findUnique({ where: { id } });

    if (!referido || referido.creadorId !== req.creadorId) {
      return res.status(404).json({ error: 'Referido no encontrado' });
    }

    await prisma.referido.delete({ where: { id } });
    res.json({ mensaje: 'Referido eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el referido' });
  }
});

export default router;
