import { elegirSegmentoPonderado } from './ruleta';

describe('elegirSegmentoPonderado', () => {
  it('lanza un error si no hay segmentos', () => {
    expect(() => elegirSegmentoPonderado([])).toThrow('No hay segmentos para elegir');
  });

  it('devuelve el único segmento si solo hay uno', () => {
    const segmentos = [{ id: '1', texto: 'Único', peso: 5 }];
    const resultado = elegirSegmentoPonderado(segmentos);
    expect(resultado.texto).toBe('Único');
  });

  it('siempre elige el segmento con peso 1 si es el único con peso mayor a 0', () => {
    const segmentos = [
      { id: '1', texto: 'Nunca', peso: 0 },
      { id: '2', texto: 'Siempre', peso: 1 },
    ];
    const resultado = elegirSegmentoPonderado(segmentos);
    expect(resultado.texto).toBe('Siempre');
  });

  it('con 1000 giros, el segmento de mayor peso sale notablemente más seguido', () => {
    const segmentos = [
      { id: '1', texto: 'Raro', peso: 1 },
      { id: '2', texto: 'Común', peso: 9 },
    ];

    let vecesComun = 0;
    for (let i = 0; i < 1000; i++) {
      if (elegirSegmentoPonderado(segmentos).texto === 'Común') vecesComun++;
    }

    // Esperamos ~90%, damos margen amplio (70%-100%) para evitar pruebas inestables
    expect(vecesComun).toBeGreaterThan(700);
  });
});