import { Router } from 'express';
import { prisma } from '../prisma';
import { verificarToken, verificarAdmin } from '../middleware/auth.middleware';

const router = Router();

// Listar TODOS los creadores de la plataforma (solo admins)
router.get('/creadores', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const creadores = await prisma.creador.findMany({
      select: {
        id: true,
        nombre: true,
        usuario: true,
        email: true,
        rol: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(creadores);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los creadores' });
  }
});

// Borrar cualquier creador de la plataforma (solo admins)
router.delete('/creadores/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const id = req.params.id as string;

    await prisma.creador.delete({ where: { id } });
    res.json({ mensaje: 'Creador eliminado por administrador' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el creador' });
  }
});

export default router;