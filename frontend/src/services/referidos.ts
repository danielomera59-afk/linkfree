import api from './api';
import { validarId, validarUsuario } from './validar';
export interface Referido {
  id: string;
  nombre: string;
  enlace: string;
  mensaje: string | null;
  destacado: boolean;
}

export async function obtenerMisReferidos(): Promise<Referido[]> {
  const respuesta = await api.get('/referidos/mios');
  return respuesta.data;
}

export async function destacarReferido(id: string): Promise<Referido> {
  const respuesta = await api.patch(`/referidos/${validarId(id)}/destacar`);
  return respuesta.data;
}

export async function borrarReferido(id: string): Promise<void> {
  await api.delete(`/referidos/${validarId(id)}`);
}

export async function enviarReferido(
  usuario: string,
  nombre: string,
  enlace: string,
  mensaje: string
): Promise<Referido> {
  const respuesta = await api.post(`/referidos/${validarUsuario(usuario)}`, { nombre, enlace, mensaje });
  return respuesta.data;
}