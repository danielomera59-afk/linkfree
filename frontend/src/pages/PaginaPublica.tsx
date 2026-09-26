import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { obtenerPaginaPublica } from '../services/links';
import type { PaginaPublica as PaginaPublicaType } from '../services/links';
import { votar } from '../services/encuestas';
import { participarEnSorteo } from '../services/sorteos';
import { girarRuleta } from '../services/ruletas';
import { enviarReferido } from '../services/referidos';

function PaginaPublica() {
  const { usuario } = useParams();
  const [pagina, setPagina] = useState<PaginaPublicaType | null>(null);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [yaVoto, setYaVoto] = useState<string[]>([]);
  const [participado, setParticipado] = useState<Record<string, string>>({});
  const [girando, setGirando] = useState<Record<string, boolean>>({});
  const [resultadoRuleta, setResultadoRuleta] = useState<Record<string, string>>({});
  const [nombreReferido, setNombreReferido] = useState('');
  const [enlaceReferido, setEnlaceReferido] = useState('');
  const [mensajeReferido, setMensajeReferido] = useState('');
  const [referidoEnviado, setReferidoEnviado] = useState(false);
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
async function handleGirar(ruletaId: string) {
  if (girando[ruletaId]) return;

  setGirando((prev) => ({ ...prev, [ruletaId]: true }));
  setResultadoRuleta((prev) => ({ ...prev, [ruletaId]: '' }));

  const resultado = await girarRuleta(ruletaId);

  // Simulamos el giro con un pequeño retraso, para que se sienta
  // como que la ruleta "gira" antes de mostrar el resultado
  setTimeout(() => {
    setGirando((prev) => ({ ...prev, [ruletaId]: false }));
    setResultadoRuleta((prev) => ({ ...prev, [ruletaId]: resultado.resultado }));
  }, 1500);
}
async function handleEnviarReferido(e: React.FormEvent) {
  e.preventDefault();
  if (!usuario) return;

  await enviarReferido(usuario, nombreReferido, enlaceReferido, mensajeReferido);
  setReferidoEnviado(true);
  setNombreReferido('');
  setEnlaceReferido('');
  setMensajeReferido('');
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
<h2>Ruletas</h2>
{pagina.ruletas.map((ruleta) => (
  <div key={ruleta.id} style={{ margin: '15px 0' }}>
    <p>
      <strong>{ruleta.titulo}</strong>
    </p>
    <div
      style={{
        border: '2px solid black',
        borderRadius: '50%',
        width: '120px',
        height: '120px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '10px 0',
        transition: 'transform 1.5s ease-out',
        transform: girando[ruleta.id] ? 'rotate(1440deg)' : 'rotate(0deg)',
      }}
    >
      🎡
    </div>
    <button onClick={() => handleGirar(ruleta.id)} disabled={girando[ruleta.id]}>
      {girando[ruleta.id] ? 'Girando...' : 'Girar'}
    </button>
    {resultadoRuleta[ruleta.id] && (
      <p>
        <strong>Resultado: {resultadoRuleta[ruleta.id]}</strong>
      </p>
    )}
  </div>
))}
<h2>Comunidad</h2>
{pagina.referidos.map((referido) => (
  <div key={referido.id} style={{ margin: '10px 0' }}>
    <a href={referido.enlace} target="_blank" rel="noopener noreferrer">
      {referido.nombre}
    </a>
    {referido.mensaje && <p>"{referido.mensaje}"</p>}
  </div>
))}

<h3>¿Quieres aparecer aquí?</h3>
{referidoEnviado ? (
  <p>¡Gracias! Tu perfil fue enviado y está esperando aprobación.</p>
) : (
  <form onSubmit={handleEnviarReferido}>
    <input
      placeholder="Tu nombre"
      value={nombreReferido}
      onChange={(e) => setNombreReferido(e.target.value)}
      required
    />
    <input
      placeholder="Tu link (ej. https://instagram.com/tu-usuario)"
      value={enlaceReferido}
      onChange={(e) => setEnlaceReferido(e.target.value)}
      required
    />
    <input
      placeholder="Mensaje (opcional)"
      value={mensajeReferido}
      onChange={(e) => setMensajeReferido(e.target.value)}
    />
    <button type="submit">Enviar mi perfil</button>
  </form>
)}
    </div>
  );
}

export default PaginaPublica;