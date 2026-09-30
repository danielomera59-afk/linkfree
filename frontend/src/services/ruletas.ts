import api from './api';
import { validarId } from './validar';

export interface Segmento {
  id: string;
  texto: string;
  peso: number;
}

export interface Ruleta {
  id: string;
  titulo: string;
  activa: boolean;
  segmentos: Segmento[];
}

export interface ResultadoGiro {
  resultado: string;
  segmentoId: string;
}

export async function obtenerMisRuletas(): Promise<Ruleta[]> {
  const respuesta = await api.get('/ruletas/mias');
  return respuesta.data;
}

export async function crearRuleta(
  titulo: string,
  segmentos: { texto: string; peso: number }[]
): Promise<Ruleta> {
  const respuesta = await api.post('/ruletas', { titulo, segmentos });
  return respuesta.data;
}

export async function borrarRuleta(id: string): Promise<void> {
  await api.delete(`/ruletas/${validarId(id)}`);
}

export async function girarRuleta(id: string): Promise<ResultadoGiro> {
  const respuesta = await api.post(`/ruletas/${validarId(id)}/girar`);
  return respuesta.data;
}