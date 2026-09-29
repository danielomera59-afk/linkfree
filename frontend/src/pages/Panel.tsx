import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerMisLinks, crearLink, borrarLink } from '../services/links';
import type { LinkItem } from '../services/links';
import { obtenerMisEncuestas, crearEncuesta, borrarEncuesta } from '../services/encuestas';
import type { Encuesta } from '../services/encuestas';
import { obtenerMisSorteos, crearSorteo, borrarSorteo } from '../services/sorteos';
import type { Sorteo } from '../services/sorteos';
import { obtenerMisRuletas, crearRuleta, borrarRuleta } from '../services/ruletas';
import type { Ruleta } from '../services/ruletas';
import { obtenerMisReferidos, destacarReferido, borrarReferido } from '../services/referidos';
import type { Referido } from '../services/referidos';

function Panel() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [titulo, setTitulo] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [pregunta, setPregunta] = useState('');
  const [opcionesTexto, setOpcionesTexto] = useState('');
  const [sorteos, setSorteos] = useState<Sorteo[]>([]);
  const [tituloSorteo, setTituloSorteo] = useState('');
  const [premio, setPremio] = useState('');
  const [limiteGanadores, setLimiteGanadores] = useState(10);
  const usuario = localStorage.getItem('usuario');
  const [ruletas, setRuletas] = useState<Ruleta[]>([]);
  const [tituloRuleta, setTituloRuleta] = useState('');
  const [segmentosTexto, setSegmentosTexto] = useState('');
  const [referidos, setReferidos] = useState<Referido[]>([]);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    void cargarLinks();
  }, []);

  async function cargarLinks() {
    try {
      const data = await obtenerMisLinks();
      setLinks(data);
      const dataEncuestas = await obtenerMisEncuestas();
      setEncuestas(dataEncuestas);
      const dataSorteos = await obtenerMisSorteos();
      setSorteos(dataSorteos);
      const dataRuletas = await obtenerMisRuletas();
      setRuletas(dataRuletas);
      const dataReferidos = await obtenerMisReferidos();
      setReferidos(dataReferidos);
    } catch (err) {
      navigate('/login');
    } finally {
      setCargando(false);
    }
  }

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      const nuevo = await crearLink(titulo, url);
      setLinks([...links, nuevo]);
      setTitulo('');
      setUrl('');
    } catch (err) {
      setError('No se pudo crear el link. Revisa la URL.');
    }
  }

  async function handleBorrar(id: string) {
    await borrarLink(id);
    setLinks(links.filter((link) => link.id !== id));
  }

  async function handleCrearEncuesta(e: React.FormEvent) {
    e.preventDefault();

    const opciones = opcionesTexto
      .split(',')
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    if (opciones.length < 2) {
      alert('Escribe al menos 2 opciones separadas por coma');
      return;
    }

    const nueva = await crearEncuesta(pregunta, opciones);
    setEncuestas([nueva, ...encuestas]);
    setPregunta('');
    setOpcionesTexto('');
  }

  async function handleBorrarEncuesta(id: string) {
    await borrarEncuesta(id);
    setEncuestas(encuestas.filter((e) => e.id !== id));
  }

  async function handleCrearSorteo(e: React.FormEvent) {
    e.preventDefault();

    const nuevo = await crearSorteo(tituloSorteo, premio, limiteGanadores);
    setSorteos([nuevo, ...sorteos]);
    setTituloSorteo('');
    setPremio('');
    setLimiteGanadores(10);
  }

  async function handleBorrarSorteo(id: string) {
    await borrarSorteo(id);
    setSorteos(sorteos.filter((s) => s.id !== id));
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  }

  async function handleCrearRuleta(e: React.FormEvent) {
    e.preventDefault();

    const segmentos = segmentosTexto
      .split(',')
      .map((parte) => {
        const [texto, pesoTexto] = parte.split(':').map((p) => p.trim());
        return { texto: texto || '', peso: Number(pesoTexto) || 1 };
      })
      .filter((s) => s.texto.length > 0);

    if (segmentos.length < 2) {
      alert('Escribe al menos 2 segmentos, formato: Texto:peso, Texto:peso');
      return;
    }

    const nueva = await crearRuleta(tituloRuleta, segmentos);
    setRuletas([nueva, ...ruletas]);
    setTituloRuleta('');
    setSegmentosTexto('');
  }

  async function handleBorrarRuleta(id: string) {
    await borrarRuleta(id);
    setRuletas(ruletas.filter((r) => r.id !== id));
  }

  async function handleDestacar(id: string) {
    const actualizado = await destacarReferido(id);
    setReferidos(referidos.map((r) => (r.id === id ? actualizado : r)));
  }

  async function handleBorrarReferido(id: string) {
    await borrarReferido(id);
    setReferidos(referidos.filter((r) => r.id !== id));
  }

  function handleCopiarLink() {
    const url = `${window.location.origin}/${usuario}`;
    void navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (cargando) return <p>Cargando...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ marginBottom: '0.6rem' }}>Mi Panel</h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'var(--color-surface)',
              border: '1.5px solid var(--color-border)',
              borderRadius: '999px',
              padding: '0.5rem 0.5rem 0.5rem 1rem',
              width: 'fit-content',
            }}
          >
            <a
              href={`${window.location.origin}/${usuario}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'none' }}
            >
              {window.location.host}/{usuario}
            </a>

            <button onClick={handleCopiarLink} style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}>
              {copiado ? '¡Copiado!' : 'Copiar link'}
            </button>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{ background: 'transparent', color: 'var(--color-ink)', border: '1.5px solid var(--color-border)' }}
        >
          Cerrar sesión
        </button>
      </div>

      <Seccion titulo="Links">
        <form onSubmit={handleCrear} style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <input
            placeholder="Título (ej. Mi Instagram)"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            style={{ flex: '1 1 160px' }}
          />

          <input
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            style={{ flex: '1 1 160px' }}
          />

          <button type="submit">Agregar</button>
        </form>

        {error && <p style={{ color: '#DC2626', fontSize: '0.9rem' }}>{error}</p>}

        {links.length === 0 && <VacioAviso texto="Todavía no tienes links." />}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
          {links.map((link) => (
            <Tarjeta key={link.id}>
              <div>
                <strong>{link.titulo}</strong>
                <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>{link.url}</p>
              </div>

              <BotonBorrar onClick={() => handleBorrar(link.id)} />
            </Tarjeta>
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Encuestas">
        <form onSubmit={handleCrearEncuesta} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <input
            placeholder="Pregunta"
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            required
          />

          <input
            placeholder="Opciones separadas por coma"
            value={opcionesTexto}
            onChange={(e) => setOpcionesTexto(e.target.value)}
            required
          />

          <button type="submit" style={{ alignSelf: 'flex-start' }}>
            Crear encuesta
          </button>
        </form>

        {encuestas.length === 0 && <VacioAviso texto="Todavía no tienes encuestas." />}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
          {encuestas.map((encuesta) => (
            <Tarjeta key={encuesta.id} columna>
              <strong>{encuesta.pregunta}</strong>

              {encuesta.opciones.map((opcion) => (
                <p key={opcion.id} style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                  {opcion.texto} — {opcion.votos} votos
                </p>
              ))}

              <BotonBorrar
                onClick={() => handleBorrarEncuesta(encuesta.id)}
                texto="Borrar encuesta"
              />
            </Tarjeta>
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Sorteos">
        <form onSubmit={handleCrearSorteo} style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <input
            placeholder="Título"
            value={tituloSorteo}
            onChange={(e) => setTituloSorteo(e.target.value)}
            required
            style={{ flex: '1 1 140px' }}
          />

          <input
            placeholder="Premio"
            value={premio}
            onChange={(e) => setPremio(e.target.value)}
            required
            style={{ flex: '1 1 140px' }}
          />

          <input
            type="number"
            min="1"
            placeholder="Límite"
            value={limiteGanadores}
            onChange={(e) => setLimiteGanadores(Number(e.target.value))}
            required
            style={{ flex: '0 1 100px' }}
          />

          <button type="submit">Crear sorteo</button>
        </form>

        {sorteos.length === 0 && <VacioAviso texto="Todavía no tienes sorteos." />}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
          {sorteos.map((sorteo) => (
            <Tarjeta key={sorteo.id} columna>
              <strong>{sorteo.titulo}</strong>

              <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                {sorteo.premio}
              </p>

              <BarraProgreso
                actual={sorteo.contador}
                total={sorteo.limiteGanadores}
              />

              <BotonBorrar
                onClick={() => handleBorrarSorteo(sorteo.id)}
                texto="Borrar sorteo"
              />
            </Tarjeta>
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Ruletas">
        <form onSubmit={handleCrearRuleta} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <input
            placeholder="Título"
            value={tituloRuleta}
            onChange={(e) => setTituloRuleta(e.target.value)}
            required
          />

          <input
            placeholder="Segmentos: Texto:peso, Texto:peso"
            value={segmentosTexto}
            onChange={(e) => setSegmentosTexto(e.target.value)}
            required
          />

          <button type="submit" style={{ alignSelf: 'flex-start' }}>
            Crear ruleta
          </button>
        </form>

        {ruletas.length === 0 && <VacioAviso texto="Todavía no tienes ruletas." />}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
          {ruletas.map((ruleta) => (
            <Tarjeta key={ruleta.id} columna>
              <strong>{ruleta.titulo}</strong>

              <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                {ruleta.segmentos.map((s) => `${s.texto} (${s.peso})`).join(' · ')}
              </p>

              <BotonBorrar
                onClick={() => handleBorrarRuleta(ruleta.id)}
                texto="Borrar ruleta"
              />
            </Tarjeta>
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Referidos">
        {referidos.length === 0 && <VacioAviso texto="Todavía no has recibido perfiles." />}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {referidos.map((referido) => (
            <Tarjeta key={referido.id} columna>
              <strong>{referido.nombre}</strong>

              <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                {referido.enlace}
              </p>

              {referido.mensaje && (
                <p style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
                  "{referido.mensaje}"
                </p>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                <button
                  onClick={() => handleDestacar(referido.id)}
                  style={
                    referido.destacado
                      ? { background: 'var(--color-accent)', color: 'var(--color-ink)' }
                      : undefined
                  }
                >
                  {referido.destacado ? 'Destacado ✅' : 'Destacar'}
                </button>

                <BotonBorrar
                  onClick={() => handleBorrarReferido(referido.id)}
                />
              </div>
            </Tarjeta>
          ))}
        </div>
      </Seccion>
    </div>
  );
}

export default Panel;

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: '2.5rem' }}>
      <h2>{titulo}</h2>
      {children}
    </div>
  );
}

function Tarjeta({ children, columna }: { children: React.ReactNode; columna?: boolean }) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1.5px solid var(--color-border)',
        borderRadius: '12px',
        padding: '1rem 1.2rem',
        display: 'flex',
        flexDirection: columna ? 'column' : 'row',
        justifyContent: columna ? 'flex-start' : 'space-between',
        alignItems: columna ? 'flex-start' : 'center',
        gap: '0.3rem',
      }}
    >
      {children}
    </div>
  );
}

function BotonBorrar({ onClick, texto = 'Borrar' }: { onClick: () => void; texto?: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        color: '#DC2626',
        border: '1.5px solid #FCA5A5',
        padding: '0.4rem 0.8rem',
        fontSize: '0.85rem',
      }}
    >
      {texto}
    </button>
  );
}

function VacioAviso({ texto }: { texto: string }) {
  return (
    <p style={{ color: '#9CA3AF', fontStyle: 'italic' }}>
      {texto}
    </p>
  );
}

function BarraProgreso({ actual, total }: { actual: number; total: number }) {
  const porcentaje = Math.min(100, Math.round((actual / total) * 100));

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          background: 'var(--color-border)',
          borderRadius: '8px',
          height: '8px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${porcentaje}%`,
            background: 'var(--color-accent)',
            height: '100%',
          }}
        />
      </div>

      <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '0.2rem 0 0 0' }}>
        {actual} / {total}
      </p>
    </div>
  );
}