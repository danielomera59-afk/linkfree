import api from './api';

interface DatosRegistro {
  nombre: string;
  usuario: string;
  email: string;
  password: string;
}

interface DatosLogin {
  email: string;
  password: string;
}

export async function registrar(datos: DatosRegistro) {
  const respuesta = await api.post('/auth/registro', datos);
  return respuesta.data;
}

export async function login(datos: DatosLogin) {
  const respuesta = await api.post('/auth/login', datos);
  return respuesta.data;
}