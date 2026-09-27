import { generarCodigo } from './codigo';

describe('generarCodigo', () => {
  it('genera un código de 8 caracteres', () => {
    const codigo = generarCodigo();
    expect(codigo.length).toBe(8);
  });

  it('genera el código en mayúsculas', () => {
    const codigo = generarCodigo();
    expect(codigo).toBe(codigo.toUpperCase());
  });

  it('genera códigos distintos en llamadas distintas', () => {
    const codigo1 = generarCodigo();
    const codigo2 = generarCodigo();
    // Hay una probabilidad matemática mínima de que coincidan por azar,
    // pero es tan baja que si falla, algo real está mal
    expect(codigo1).not.toBe(codigo2);
  });
});