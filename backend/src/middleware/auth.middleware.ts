import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  creadorId?: string;
  rol?: string;
}

export interface CustomJwtPayload extends JwtPayload {
  id: string;
  rol: string;
}

export function verificarToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as unknown as CustomJwtPayload;
    req.creadorId = payload.id;
    req.rol = payload.rol;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

export function verificarAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.rol !== 'ADMIN') {
    return res.status(403).json({ error: 'No tienes permisos de administrador' });
  }
  next();
}