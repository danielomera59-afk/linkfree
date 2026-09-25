import { Router } from 'express';
import { prisma } from '../prisma';
import { verificarToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

function generarCodigo(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Crear un sorteo (requiere estar logueado)
router.post('/', verificarToken, async (req: AuthRequest, res) => {
  try {
    const { titulo, premio, limiteGanadores } = req.body;

    if (!titulo || !premio || !limiteGanadores || limiteGanadores < 1) {
      return res.status(400).json({ error: 'Faltan campos o el límite debe ser mayor a 0' });
    }

    const nuevoSorteo = await prisma.sorteo.create({
      data: { titulo, premio, limiteGanadores, creadorId: req.creadorId! },
    });

    res.status(201).json(nuevoSorteo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el sorteo' });
  }
});

// Listar mis sorteos (requiere estar logueado)
router.get('/mios', verificarToken, async (req: AuthRequest, res) => {
  try {
    const sorteos = await prisma.sorteo.findMany({
      where: { creadorId: req.creadorId! },
      include: { ganadores: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(sorteos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los sorteos' });
  }
});

// Participar (PÚBLICO, sin login) — la parte más importante
router.post('/:id/participar', async (req, res) => {
  try {
    const id = req.params.id as string;

    // Usamos una transacción para que, aunque dos personas participen
    // al mismo tiempo, el contador nunca se incremente mal ni se
    // repartan más premios de los que hay.
    const resultado = await prisma.$transaction(async (tx) => {
      const sorteo = await tx.sorteo.findUnique({ where: { id } });

      if (!sorteo || !sorteo.activo) {
        return { error: 'Sorteo no encontrado o ya cerrado' };
      }

      if (sorteo.contador >= sorteo.limiteGanadores) {
        return { gano: false, agotado: true };
      }

      const actualizado = await tx.sorteo.update({
        where: { id },
        data: { contador: { increment: 1 } },
      });

      // Si justo esta participación fue la que llegó al límite o antes, gana
      if (actualizado.contador <= sorteo.limiteGanadores) {
        const codigo = generarCodigo();
        await tx.sorteoGanador.create({ data: { sorteoId: id, codigo } });
        return { gano: true, codigo };
      }

      return { gano: false, agotado: true };
    });

    if ('error' in resultado) {
      return res.status(404).json(resultado);
    }

    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al participar en el sorteo' });
  }
});

// Borrar un sorteo (requiere estar logueado y ser el dueño)
router.delete('/:id', verificarToken, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;

    const sorteo = await prisma.sorteo.findUnique({ where: { id } });

    if (!sorteo || sorteo.creadorId !== req.creadorId) {
      return res.status(404).json({ error: 'Sorteo no encontrado' });
    }

    await prisma.sorteoGanador.deleteMany({ where: { sorteoId: id } });
    await prisma.sorteo.delete({ where: { id } });

    res.json({ mensaje: 'Sorteo eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el sorteo' });
  }
});

export default router;