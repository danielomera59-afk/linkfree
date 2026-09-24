import { Router } from 'express';
import { prisma } from '../prisma';
import { verificarToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Crear una encuesta con sus opciones (requiere estar logueado)
router.post('/', verificarToken, async (req: AuthRequest, res) => {
  try {
    const { pregunta, opciones } = req.body;

    if (!pregunta || !Array.isArray(opciones) || opciones.length < 2) {
      return res.status(400).json({ error: 'Se necesita una pregunta y al menos 2 opciones' });
    }

    const nuevaEncuesta = await prisma.encuesta.create({
      data: {
        pregunta,
        creadorId: req.creadorId!,
        opciones: {
          create: opciones.map((texto: string) => ({ texto })),
        },
      },
      include: { opciones: true },
    });

    res.status(201).json(nuevaEncuesta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la encuesta' });
  }
});

// Listar mis encuestas (requiere estar logueado)
router.get('/mias', verificarToken, async (req: AuthRequest, res) => {
  try {
    const encuestas = await prisma.encuesta.findMany({
      where: { creadorId: req.creadorId! },
      include: { opciones: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(encuestas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las encuestas' });
  }
});

// Votar por una opción (PÚBLICO, sin login)
router.post('/:id/votar', async (req, res) => {
  try {
    const encuestaId = req.params.id as string;
    const { opcionId } = req.body;

    if (!opcionId) {
      return res.status(400).json({ error: 'Falta el id de la opción' });
    }

    const opcion = await prisma.opcionEncuesta.findUnique({ where: { id: opcionId } });

    if (!opcion || opcion.encuestaId !== encuestaId) {
      return res.status(404).json({ error: 'Opción no encontrada' });
    }

    const actualizada = await prisma.opcionEncuesta.update({
      where: { id: opcionId },
      data: { votos: { increment: 1 } },
    });

    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ error: 'Error al votar' });
  }
});

// Borrar una encuesta (requiere estar logueado y ser el dueño)
router.delete('/:id', verificarToken, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;

    const encuesta = await prisma.encuesta.findUnique({ where: { id } });

    if (!encuesta || encuesta.creadorId !== req.creadorId) {
      return res.status(404).json({ error: 'Encuesta no encontrada' });
    }

    await prisma.opcionEncuesta.deleteMany({ where: { encuestaId: id } });
    await prisma.encuesta.delete({ where: { id } });

    res.json({ mensaje: 'Encuesta eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la encuesta' });
  }
});

export default router;