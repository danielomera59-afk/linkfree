import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { obtenerPaginaPublica } from '../services/links';
import type { PaginaPublica as PaginaPublicaType } from '../services/links';
import { votar } from '../services/encuestas';
import { participarEnSorteo } from '../services/sorteos';

function PaginaPublica() {
  const { usuario } = useParams();
  const [pagina, setPagina] = useState<PaginaPublicaType | null>(null);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [yaVoto, setYaVoto] = useState<string[]>([]);
  const [participado, setParticipado] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!usuario) return;

    obtenerPaginaPublica(usuario)
      .then(setPagina)
      .catch(() => setNoEncontrado(true));
  }, [usuario]);

  async function handleVotar(encuestaId: string, opcionId: string) {
    if (yaVoto.includes(encuestaId)) return;

    const opcionActualizada = await votar(encuestaId, opcionId);

    setPagina((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        encuestas: prev.encuestas.map((encuesta) =>
          encuesta.id === encuestaId
            ? {
                ...encuesta,
                opciones: encuesta.opciones.map((opcion) =>
                  opcion.id === opcionId ? opcionActualizada : opcion
                ),
              }
            : encuesta
        ),
      };
    });

    setYaVoto([...yaVoto, encuestaId]);
  }
  async function handleParticipar(sorteoId: string) {
  const resultado = await participarEnSorteo(sorteoId);

  const mensaje = resultado.gano
    ? `¡Ganaste! Tu código: ${resultado.codigo}`
    : 'El sorteo ya se agotó. ¡Suerte la próxima!';

  setParticipado((prev) => ({ ...prev, [sorteoId]: mensaje }));

  // Actualiza el contador visualmente
  setPagina((prev) => {
    if (!prev) return prev;
    return {
      ...prev,
      sorteos: prev.sorteos.map((s) =>
        s.id === sorteoId ? { ...s, contador: s.contador + (resultado.gano ? 1 : s.contador) } : s
      ),
    };
  });
}

  if (noEncontrado) return <p>No encontramos a este creador.</p>;
  if (!pagina) return <p>Cargando...</p>;

  return (
    <div>
      <h1>{pagina.nombre}</h1>
      <p>@{pagina.usuario}</p>
      {pagina.bio && <p>{pagina.bio}</p>}

      <div>
        {pagina.links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', margin: '10px 0' }}
          >
            {link.titulo}
          </a>
        ))}
      </div>

      <h2>Encuestas</h2>
      {pagina.encuestas.map((encuesta) => {
        const totalVotos = encuesta.opciones.reduce((suma, o) => suma + o.votos, 0);
        const votado = yaVoto.includes(encuesta.id);

        return (
          <div key={encuesta.id} style={{ margin: '15px 0' }}>
            <p>
              <strong>{encuesta.pregunta}</strong>
            </p>
            {encuesta.opciones.map((opcion) => {
              const porcentaje =
                totalVotos > 0 ? Math.round((opcion.votos / totalVotos) * 100) : 0;

              return (
                <div key={opcion.id} style={{ marginBottom: '6px' }}>
                  {votado ? (
                    <p>
                      {opcion.texto} — {opcion.votos} votos ({porcentaje}%)
                    </p>
                  ) : (
                    <button onClick={() => handleVotar(encuesta.id, opcion.id)}>
                      {opcion.texto}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
      <h2>Sorteos</h2>
{pagina.sorteos.map((sorteo) => (
  <div key={sorteo.id} style={{ margin: '15px 0' }}>
    <p>
      <strong>{sorteo.titulo}</strong> — {sorteo.premio}
    </p>
    <p>
      {sorteo.contador} / {sorteo.limiteGanadores} lugares ocupados
    </p>
    {participado[sorteo.id] ? (
      <p>{participado[sorteo.id]}</p>
    ) : (
      <button onClick={() => handleParticipar(sorteo.id)}>Participar</button>
    )}
  </div>
))}
    </div>
  );
}

export default PaginaPublica;