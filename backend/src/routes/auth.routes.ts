import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

const router = Router();

// Registro de un nuevo creador
router.post('/registro', async (req, res) => {
  try {
    const { nombre, usuario, email, password } = req.body;

    if (!nombre || !usuario || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const yaExiste = await prisma.creador.findFirst({
      where: { OR: [{ email }, { usuario }] },
    });

    if (yaExiste) {
      return res.status(409).json({ error: 'Ese usuario o email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const nuevoCreador = await prisma.creador.create({
      data: { nombre, usuario, email, passwordHash },
    });

    res.status(201).json({
      id: nuevoCreador.id,
      nombre: nuevoCreador.nombre,
      usuario: nuevoCreador.usuario,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el creador' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const creador = await prisma.creador.findUnique({ where: { email } });

    if (!creador) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordCorrecta = await bcrypt.compare(password, creador.passwordHash);

    if (!passwordCorrecta) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: creador.id, usuario: creador.usuario },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      creador: { id: creador.id, nombre: creador.nombre, usuario: creador.usuario },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

export default router;