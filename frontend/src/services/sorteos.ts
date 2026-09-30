import api from './api';
import { validarId } from './validar';

export interface Ganador {
  id: string;
  codigo: string;
}

export interface Sorteo {
  id: string;
  titulo: string;
  premio: string;
  limiteGanadores: number;
  contador: number;
  activo: boolean;
  ganadores?: Ganador[];
}

export interface ResultadoParticipar {
  gano: boolean;
  agotado?: boolean;
  codigo?: string;
}

export async function obtenerMisSorteos(): Promise<Sorteo[]> {
  const respuesta = await api.get('/sorteos/mios');
  return respuesta.data;
}

export async function crearSorteo(
  titulo: string,
  premio: string,
  limiteGanadores: number
): Promise<Sorteo> {
  const respuesta = await api.post('/sorteos', { titulo, premio, limiteGanadores });
  return respuesta.data;
}

export async function borrarSorteo(id: string): Promise<void> {
  await api.delete(`/sorteos/${validarId(id)}`);
}
export async function participarEnSorteo(id: string): Promise<ResultadoParticipar> {
  const respuesta = await api.post(`/sorteos/${validarId(id)}/participar`);
  return respuesta.data;
}