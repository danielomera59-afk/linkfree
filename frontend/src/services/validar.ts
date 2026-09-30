const REGEX_ID = /^[a-zA-Z0-9-]+$/;
const REGEX_USUARIO = /^[a-zA-Z0-9_]+$/;

export function validarId(id: string): string {
  if (!REGEX_ID.test(id)) {
    throw new Error('Identificador con formato inválido');
  }
  return id;
}

export function validarUsuario(usuario: string): string {
  if (!REGEX_USUARIO.test(usuario)) {
    throw new Error('Usuario con formato inválido');
  }
  return usuario;
}