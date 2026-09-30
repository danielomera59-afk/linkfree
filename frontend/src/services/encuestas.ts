import api from './api';
import { validarId } from './validar';
export interface OpcionEncuesta {
  id: string;
  texto: string;
  votos: number;
}

export interface Encuesta {
  id: string;
  pregunta: string;
  activa: boolean;
  opciones: OpcionEncuesta[];
}

export async function obtenerMisEncuestas(): Promise<Encuesta[]> {
  const respuesta = await api.get('/encuestas/mias');
  return respuesta.data;
}

export async function crearEncuesta(pregunta: string, opciones: string[]): Promise<Encuesta> {
  const respuesta = await api.post('/encuestas', { pregunta, opciones });
  return respuesta.data;
}

export async function borrarEncuesta(id: string): Promise<void> {
  await api.delete(`/encuestas/${validarId(id)}`);
}

export async function votar(encuestaId: string, opcionId: string): Promise<OpcionEncuesta> {
  const respuesta = await api.post(`/encuestas/${validarId(encuestaId)}/votar`, { opcionId });
  return respuesta.data;
}