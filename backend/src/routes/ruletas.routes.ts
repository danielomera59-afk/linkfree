import { Router } from 'express';
import { prisma } from '../prisma';
import { verificarToken, AuthRequest } from '../middleware/auth.middleware';
import { elegirSegmentoPonderado } from '../utils/ruleta';
const router = Router();

// Crear una ruleta con sus segmentos (requiere estar logueado)
router.post('/', verificarToken, async (req: AuthRequest, res) => {
  try {
    const { titulo, segmentos } = req.body;

    if (!titulo || !Array.isArray(segmentos) || segmentos.length < 2) {
      return res.status(400).json({ error: 'Se necesita un título y al menos 2 segmentos' });
    }

    const nuevaRuleta = await prisma.ruleta.create({
      data: {
        titulo,
        creadorId: req.creadorId!,
        segmentos: {
          create: segmentos.map((s: { texto: string; peso?: number }) => ({
            texto: s.texto,
            peso: s.peso && s.peso > 0 ? s.peso : 1,
          })),
        },
      },
      include: { segmentos: true },
    });

    res.status(201).json(nuevaRuleta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la ruleta' });
  }
});

// Listar mis ruletas (requiere estar logueado)
router.get('/mias', verificarToken, async (req: AuthRequest, res) => {
  try {
    const ruletas = await prisma.ruleta.findMany({
      where: { creadorId: req.creadorId! },
      include: { segmentos: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(ruletas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las ruletas' });
  }
});

// Girar la ruleta (PÚBLICO, sin login)
router.post('/:id/girar', async (req, res) => {
  try {
    const id = req.params.id as string;

    const ruleta = await prisma.ruleta.findUnique({
      where: { id },
      include: { segmentos: true },
    });

    if (!ruleta || !ruleta.activa || ruleta.segmentos.length === 0) {
      return res.status(404).json({ error: 'Ruleta no encontrada o sin segmentos' });
    }

    const ganador = elegirSegmentoPonderado(ruleta.segmentos);
    res.json({ resultado: ganador.texto, segmentoId: ganador.id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al girar la ruleta' });
  }
});

// Borrar una ruleta (requiere estar logueado y ser el dueño)
router.delete('/:id', verificarToken, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;

    const ruleta = await prisma.ruleta.findUnique({ where: { id } });

    if (!ruleta || ruleta.creadorId !== req.creadorId) {
      return res.status(404).json({ error: 'Ruleta no encontrada' });
    }

    await prisma.segmento.deleteMany({ where: { ruletaId: id } });
    await prisma.ruleta.delete({ where: { id } });

    res.json({ mensaje: 'Ruleta eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la ruleta' });
  }
});

export default router;