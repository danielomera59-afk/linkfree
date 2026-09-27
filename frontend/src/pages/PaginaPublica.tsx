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
  if (noEncontrado) return <p style={{ padding: '2rem', textAlign: 'center' }}>No encontramos a este creador.</p>;
if (!pagina) return <p style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</p>;

return (
  <div style={{ maxWidth: '480px', margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center' }}>
    <div
      style={{
        width: '84px',
        height: '84px',
        borderRadius: '50%',
        background: 'var(--color-primary)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1rem auto',
        fontFamily: 'var(--font-display)',
        fontSize: '2rem',
      }}
    >
      {pagina.nombre.charAt(0).toUpperCase()}
    </div>
    <h1 style={{ marginBottom: '0.1rem' }}>{pagina.nombre}</h1>
    <p style={{ color: 'var(--color-primary)', fontWeight: 500 }}>@{pagina.usuario}</p>
    {pagina.bio && <p style={{ color: '#6B7280' }}>{pagina.bio}</p>}

    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginTop: '2rem' }}>
      {pagina.links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            borderRadius: '999px',
            padding: '0.8rem 1.2rem',
            fontWeight: 500,
            textDecoration: 'none',
            color: 'var(--color-ink)',
          }}
        >
          {link.titulo}
        </a>
      ))}
    </div>

    {pagina.encuestas.length > 0 && (
      <section style={{ marginTop: '2.5rem', textAlign: 'left' }}>
        <h2>Encuestas</h2>
        {pagina.encuestas.map((encuesta) => {
          const totalVotos = encuesta.opciones.reduce((suma, o) => suma + o.votos, 0);
          const votado = yaVoto.includes(encuesta.id);

          return (
            <div
              key={encuesta.id}
              style={{
                background: 'var(--color-surface)',
                border: '1.5px solid var(--color-border)',
                borderRadius: '12px',
                padding: '1rem 1.2rem',
                margin: '0.7rem 0',
              }}
            >
              <p style={{ fontWeight: 600 }}>{encuesta.pregunta}</p>
              {encuesta.opciones.map((opcion) => {
                const porcentaje = totalVotos > 0 ? Math.round((opcion.votos / totalVotos) * 100) : 0;
                return (
                  <div key={opcion.id} style={{ margin: '0.4rem 0' }}>
                    {votado ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span>{opcion.texto}</span>
                          <span>{porcentaje}%</span>
                        </div>
                        <div style={{ background: 'var(--color-border)', borderRadius: '8px', height: '6px', overflow: 'hidden' }}>
                          <div style={{ width: `${porcentaje}%`, background: 'var(--color-primary)', height: '100%' }} />
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleVotar(encuesta.id, opcion.id)}
                        style={{ width: '100%', background: 'transparent', color: 'var(--color-ink)', border: '1.5px solid var(--color-border)', textAlign: 'left' }}
                      >
                        {opcion.texto}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </section>
    )}

    {pagina.sorteos.length > 0 && (
      <section style={{ marginTop: '2.5rem', textAlign: 'left' }}>
        <h2>Sorteos</h2>
        {pagina.sorteos.map((sorteo) => (
          <div
            key={sorteo.id}
            style={{
              background: 'var(--color-surface)',
              border: '1.5px solid var(--color-border)',
              borderRadius: '12px',
              padding: '1rem 1.2rem',
              margin: '0.7rem 0',
            }}
          >
            <p style={{ fontWeight: 600 }}>{sorteo.titulo}</p>
            <p style={{ fontSize: '0.9rem', color: '#6B7280' }}>{sorteo.premio}</p>
            <p style={{ fontSize: '0.8rem', color: '#9CA3AF', margin: '0.3rem 0 0.6rem 0' }}>
              {sorteo.contador} / {sorteo.limiteGanadores} lugares ocupados
            </p>
            {participado[sorteo.id] ? (
              <p style={{ fontWeight: 500 }}>{participado[sorteo.id]}</p>
            ) : (
              <button style={{ background: 'var(--color-accent)', color: 'var(--color-ink)' }} onClick={() => handleParticipar(sorteo.id)}>
                Participar
              </button>
            )}
          </div>
        ))}
      </section>
    )}

    {pagina.ruletas.length > 0 && (
      <section style={{ marginTop: '2.5rem', textAlign: 'left' }}>
        <h2>Ruletas</h2>
        {pagina.ruletas.map((ruleta) => (
          <div
            key={ruleta.id}
            style={{
              background: 'var(--color-surface)',
              border: '1.5px solid var(--color-border)',
              borderRadius: '12px',
              padding: '1rem 1.2rem',
              margin: '0.7rem 0',
              textAlign: 'center',
            }}
          >
            <p style={{ fontWeight: 600 }}>{ruleta.titulo}</p>
            <div
              style={{
                border: `4px solid var(--color-primary)`,
                borderRadius: '50%',
                width: '90px',
                height: '90px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0.8rem auto',
                fontSize: '2rem',
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
              <p style={{ fontWeight: 600, marginTop: '0.6rem' }}>{resultadoRuleta[ruleta.id]}</p>
            )}
          </div>
        ))}
      </section>
    )}

    <section style={{ marginTop: '2.5rem', textAlign: 'left' }}>
      <h2>Comunidad</h2>
      {pagina.referidos.map((referido) => (
        <div
          key={referido.id}
          style={{
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            borderRadius: '12px',
            padding: '0.9rem 1.2rem',
            margin: '0.6rem 0',
          }}
        >
          <a href={referido.enlace} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600 }}>
            {referido.nombre}
          </a>
          {referido.mensaje && <p style={{ fontSize: '0.9rem', color: '#6B7280' }}>"{referido.mensaje}"</p>}
        </div>
      ))}

      <div
        style={{
          border: '1.5px dashed var(--color-border)',
          borderRadius: '12px',
          padding: '1rem 1.2rem',
          marginTop: '1rem',
        }}
      >
        <p style={{ fontWeight: 500, marginBottom: '0.6rem' }}>¿Quieres aparecer aquí?</p>
        {referidoEnviado ? (
          <p style={{ color: '#6B7280' }}>¡Gracias! Tu perfil fue enviado y está esperando aprobación.</p>
        ) : (
          <form onSubmit={handleEnviarReferido} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <input
              placeholder="Tu nombre"
              value={nombreReferido}
              onChange={(e) => setNombreReferido(e.target.value)}
              required
            />
            <input
              placeholder="Tu link"
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
    </section>
  </div>
);
}

export default PaginaPublica;