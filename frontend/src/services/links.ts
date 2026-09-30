import api from './api';
import { validarId, validarUsuario } from './validar';
export interface LinkItem {
  id: string;
  titulo: string;
  url: string;
  orden: number;
  activo: boolean;
}

export async function obtenerMisLinks(): Promise<LinkItem[]> {
  const respuesta = await api.get('/links/mios');
  return respuesta.data;
}

export async function crearLink(titulo: string, url: string): Promise<LinkItem> {
  const respuesta = await api.post('/links', { titulo, url });
  return respuesta.data;
}

export async function borrarLink(id: string): Promise<void> {
  await api.delete(`/links/${validarId(id)}`);
}


export interface PaginaPublica {
  nombre: string;
  usuario: string;
  bio: string | null;
  links: LinkItem[];
  encuestas: {
    id: string;
    pregunta: string;
    opciones: {
      id: string;
      texto: string;
      votos: number;
    }[];
  }[];
  sorteos: {
    id: string;
    titulo: string;
    premio: string;
    limiteGanadores: number;
    contador: number;
  }[];
  ruletas: {
    id: string;
    titulo: string;
    segmentos: {
      id: string;
      texto: string;
      peso: number;
    }[];
  }[];
  referidos: {
    id: string;
    nombre: string;
    enlace: string;
    mensaje: string | null;
  }[];
}

export async function obtenerPaginaPublica(usuario: string): Promise<PaginaPublica> {
  const respuesta = await api.get(`/links/publico/${validarUsuario(usuario)}`);
  return respuesta.data;
}