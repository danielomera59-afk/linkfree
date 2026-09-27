export interface SegmentoConPeso {
  id: string;
  texto: string;
  peso: number;
}

export function elegirSegmentoPonderado(segmentos: SegmentoConPeso[]): SegmentoConPeso {
  if (segmentos.length === 0) {
    throw new Error('No hay segmentos para elegir');
  }

  const pesoTotal = segmentos.reduce((suma, s) => suma + s.peso, 0);
  let numeroAleatorio = Math.random() * pesoTotal;

  for (const segmento of segmentos) {
    if (numeroAleatorio < segmento.peso) {
      return segmento;
    }
    numeroAleatorio -= segmento.peso;
  }

  return segmentos[segmentos.length - 1]!;
}