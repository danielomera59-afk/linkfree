import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
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
import './Panel.css';

function Panel() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [titulo, setTitulo] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [pregunta, setPregunta] = useState('');
  const [opcionesTexto, setOpcionesTexto] = useState('');
  const [sorteos, setSorteos] = useState<Sorteo[]>([]);
  const [tituloSorteo, setTituloSorteo] = useState('');
  const [premio, setPremio] = useState('');
  const [limiteGanadores, setLimiteGanadores] = useState(10);
  const [ruletas, setRuletas] = useState<Ruleta[]>([]);
  const [tituloRuleta, setTituloRuleta] = useState('');
  const [segmentosTexto, setSegmentosTexto] = useState('');
  const [referidos, setReferidos] = useState<Referido[]>([]);
  const [copiado, setCopiado] = useState(false);
  const [aviso, setAviso] = useState('');
  const navigate = useNavigate();
  const usuario = localStorage.getItem('usuario');

  useEffect(() => {
    void cargarLinks();
  }, []);

  async function cargarLinks() {
    try {
      const data = await obtenerMisLinks();
      setLinks(data);
      setEncuestas(await obtenerMisEncuestas());
      setSorteos(await obtenerMisSorteos());
      setRuletas(await obtenerMisRuletas());
      setReferidos(await obtenerMisReferidos());
    } catch {
      navigate('/login');
    } finally {
      setCargando(false);
    }
  }

  async function handleCrear(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    try {
      const nuevo = await crearLink(titulo.trim(), url.trim());
      setLinks((actuales) => [...actuales, nuevo]);
      setTitulo('');
      setUrl('');
      setAviso('Enlace agregado correctamente.');
    } catch {
      setError('No se pudo crear el enlace. Revisa la URL e inténtalo de nuevo.');
    }
  }

  async function handleBorrar(id: string) {
    try {
      await borrarLink(id);
      setLinks((actuales) => actuales.filter((link) => link.id !== id));
      setAviso('Enlace eliminado.');
    } catch {
      setAviso('No se pudo eliminar el enlace. Inténtalo de nuevo.');
    }
  }

  async function handleCrearEncuesta(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const opciones = opcionesTexto.split(',').map((o) => o.trim()).filter(Boolean);
    if (opciones.length < 2) {
      setAviso('Escribe al menos dos opciones separadas por comas.');
      return;
    }
    try {
      const nueva = await crearEncuesta(pregunta.trim(), opciones);
      setEncuestas((actuales) => [nueva, ...actuales]);
      setPregunta('');
      setOpcionesTexto('');
      setAviso('Encuesta creada correctamente.');
    } catch {
      setAviso('No se pudo crear la encuesta. Inténtalo de nuevo.');
    }
  }

  async function handleBorrarEncuesta(id: string) {
    try {
      await borrarEncuesta(id);
      setEncuestas((actuales) => actuales.filter((encuesta) => encuesta.id !== id));
      setAviso('Encuesta eliminada.');
    } catch {
      setAviso('No se pudo eliminar la encuesta.');
    }
  }

  async function handleCrearSorteo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const nuevo = await crearSorteo(tituloSorteo.trim(), premio.trim(), limiteGanadores);
      setSorteos((actuales) => [nuevo, ...actuales]);
      setTituloSorteo('');
      setPremio('');
      setLimiteGanadores(10);
      setAviso('Sorteo creado correctamente.');
    } catch {
      setAviso('No se pudo crear el sorteo. Inténtalo de nuevo.');
    }
  }

  async function handleBorrarSorteo(id: string) {
    try {
      await borrarSorteo(id);
      setSorteos((actuales) => actuales.filter((sorteo) => sorteo.id !== id));
      setAviso('Sorteo eliminado.');
    } catch {
      setAviso('No se pudo eliminar el sorteo.');
    }
  }

  async function handleCrearRuleta(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const segmentos = segmentosTexto
      .split(',')
      .map((parte) => {
        const [texto, pesoTexto] = parte.split(':').map((p) => p.trim());
        return { texto: texto || '', peso: Number(pesoTexto) || 1 };
      })
      .filter((segmento) => segmento.texto.length > 0);

    if (segmentos.length < 2) {
      setAviso('Escribe al menos dos segmentos. Ejemplo: Premio:1, Otra opción:2');
      return;
    }

    try {
      const nueva = await crearRuleta(tituloRuleta.trim(), segmentos);
      setRuletas((actuales) => [nueva, ...actuales]);
      setTituloRuleta('');
      setSegmentosTexto('');
      setAviso('Ruleta creada correctamente.');
    } catch {
      setAviso('No se pudo crear la ruleta. Inténtalo de nuevo.');
    }
  }

  async function handleBorrarRuleta(id: string) {
    try {
      await borrarRuleta(id);
      setRuletas((actuales) => actuales.filter((ruleta) => ruleta.id !== id));
      setAviso('Ruleta eliminada.');
    } catch {
      setAviso('No se pudo eliminar la ruleta.');
    }
  }

  async function handleDestacar(id: string) {
    try {
      const actualizado = await destacarReferido(id);
      setReferidos((actuales) => actuales.map((referido) => referido.id === id ? actualizado : referido));
      setAviso('Estado del referido actualizado.');
    } catch {
      setAviso('No se pudo actualizar el referido.');
    }
  }

  async function handleBorrarReferido(id: string) {
    try {
      await borrarReferido(id);
      setReferidos((actuales) => actuales.filter((referido) => referido.id !== id));
      setAviso('Referido eliminado.');
    } catch {
      setAviso('No se pudo eliminar el referido.');
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  }

  async function handleCopiarLink() {
    const enlacePublico = `${window.location.origin}/${usuario}`;
    try {
      await navigator.clipboard.writeText(enlacePublico);
      setCopiado(true);
      setAviso('Tu enlace público se copió al portapapeles.');
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      setAviso(`Copia este enlace: ${enlacePublico}`);
    }
  }

  if (cargando) {
    return (
      <main className="panel-loading">
        <div className="panel-spinner" />
        <p>Cargando tu espacio...</p>
      </main>
    );
  }

  const totalElementos = links.length + encuestas.length + sorteos.length + ruletas.length;

  return (
    <div className="panel-layout">
      <aside className="panel-sidebar">
        <a className="panel-brand" href="/panel" aria-label="LinkFree inicio">
          <span className="panel-brand-mark">L</span>
          <span>Link<span className="panel-brand-accent">Free</span></span>
        </a>

        <div className="panel-sidebar-label">ESPACIO DE TRABAJO</div>
        <nav className="panel-nav" aria-label="Navegación del panel">
          <a className="panel-nav-link active" href="#inicio"><span>⌂</span> Resumen</a>
          <a className="panel-nav-link" href="#links"><span>↗</span> Mis enlaces <b>{links.length}</b></a>
          <a className="panel-nav-link" href="#encuestas"><span>▤</span> Encuestas <b>{encuestas.length}</b></a>
          <a className="panel-nav-link" href="#sorteos"><span>✳</span> Sorteos <b>{sorteos.length}</b></a>
          <a className="panel-nav-link" href="#ruletas"><span>◉</span> Ruletas <b>{ruletas.length}</b></a>
          <a className="panel-nav-link" href="#referidos"><span>♧</span> Referidos <b>{referidos.length}</b></a>
        </nav>

        <div className="panel-sidebar-bottom">
          <div className="panel-user-mini">
            <div className="panel-avatar">{(usuario || 'U').charAt(0).toUpperCase()}</div>
            <div className="panel-user-info">
              <strong>{usuario || 'Mi cuenta'}</strong>
              <span>Espacio personal</span>
            </div>
          </div>
          <button className="panel-logout" onClick={handleLogout}>↪ Cerrar sesión</button>
        </div>
      </aside>

      <main className="panel-main" id="inicio">
        <header className="panel-topbar">
          <div>
            <p className="panel-eyebrow">TU ESPACIO DIGITAL</p>
            <h1>Mi panel <span className="panel-title-dot">.</span></h1>
            <p className="panel-subtitle">Administra tu contenido y comparte todo desde un solo lugar.</p>
          </div>
          <a className="panel-button panel-button-secondary" href={`/${usuario}`} target="_blank" rel="noopener noreferrer">
            ↗ Ver perfil público
          </a>
        </header>

        {aviso && (
          <div className="panel-notice" role="status">
            <span>{aviso}</span>
            <button type="button" aria-label="Cerrar aviso" onClick={() => setAviso('')}>×</button>
          </div>
        )}

        <section className="panel-share-card">
          <div className="panel-share-icon">↗</div>
          <div className="panel-share-copy">
            <span className="panel-card-kicker">TU PERFIL PÚBLICO</span>
            <h2>Todo lo tuyo, en un solo enlace.</h2>
            <p>Comparte tu perfil para que otros encuentren tus enlaces y contenido.</p>
            <a className="panel-public-url" href={`/${usuario}`} target="_blank" rel="noopener noreferrer">
              {window.location.host}/{usuario}
            </a>
          </div>
          <button className="panel-button panel-button-primary" onClick={() => void handleCopiarLink()}>
            {copiado ? '✓ Copiado' : 'Copiar enlace'}
          </button>
          <div className="panel-share-glow" aria-hidden="true" />
        </section>

        <section className="panel-stats" aria-label="Resumen del contenido">
          <StatCard label="Enlaces" value={links.length} icon="↗" />
          <StatCard label="Encuestas" value={encuestas.length} icon="▤" />
          <StatCard label="Sorteos" value={sorteos.length} icon="✳" />
          <StatCard label="Contenido creado" value={totalElementos} icon="✦" />
        </section>

        <Section id="links" number="01" title="Mis enlaces" description="Organiza tus redes, proyectos y páginas favoritas.">
          <form className="panel-form panel-form-inline" onSubmit={handleCrear}>
            <label className="panel-field">
              <span>Nombre del enlace</span>
              <input placeholder="Ej. Mi Instagram" value={titulo} onChange={(e) => setTitulo(e.target.value)} required maxLength={80} />
            </label>
            <label className="panel-field panel-field-grow">
              <span>Dirección URL</span>
              <input type="url" placeholder="https://tusitio.com" value={url} onChange={(e) => setUrl(e.target.value)} required />
            </label>
            <button className="panel-button panel-button-primary" type="submit">＋ Agregar enlace</button>
          </form>
          {error && <p className="panel-error" role="alert">{error}</p>}
          {links.length === 0 ? <EmptyState title="Aún no tienes enlaces" text="Agrega tu primer enlace usando el formulario de arriba." /> : (
            <div className="panel-item-list">
              {links.map((link) => (
                <article className="panel-item" key={link.id}>
                  <div className="panel-item-icon">↗</div>
                  <div className="panel-item-content">
                    <strong>{link.titulo}</strong>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a>
                  </div>
                  <span className="panel-status"><i /> Activo</span>
                  <DeleteButton onClick={() => void handleBorrar(link.id)} />
                </article>
              ))}
            </div>
          )}
        </Section>

        <Section id="encuestas" number="02" title="Encuestas" description="Conoce la opinión de tu comunidad.">
          <form className="panel-form" onSubmit={(e) => void handleCrearEncuesta(e)}>
            <label className="panel-field">
              <span>Pregunta</span>
              <input placeholder="¿Qué te gustaría ver próximamente?" value={pregunta} onChange={(e) => setPregunta(e.target.value)} required maxLength={200} />
            </label>
            <label className="panel-field">
              <span>Opciones de respuesta</span>
              <input placeholder="Opción A, Opción B, Opción C" value={opcionesTexto} onChange={(e) => setOpcionesTexto(e.target.value)} required />
              <small>Separa cada opción con una coma. Necesitas al menos dos.</small>
            </label>
            <button className="panel-button panel-button-primary" type="submit">＋ Crear encuesta</button>
          </form>
          {encuestas.length === 0 ? <EmptyState title="Todavía no hay encuestas" text="Crea una encuesta para empezar a recibir opiniones." /> : (
            <div className="panel-grid">
              {encuestas.map((encuesta) => (
                <article className="panel-content-card" key={encuesta.id}>
                  <div className="panel-content-card-top"><span className="panel-card-icon">▤</span><span className="panel-tag">Encuesta</span></div>
                  <h3>{encuesta.pregunta}</h3>
                  <div className="panel-options">
                    {encuesta.opciones.map((opcion) => (
                      <div className="panel-option" key={opcion.id}><span>{opcion.texto}</span><strong>{opcion.votos} votos</strong></div>
                    ))}
                  </div>
                  <DeleteButton onClick={() => void handleBorrarEncuesta(encuesta.id)} text="Eliminar encuesta" />
                </article>
              ))}
            </div>
          )}
        </Section>

        <Section id="sorteos" number="03" title="Sorteos" description="Crea sorteos y mantén visible el avance de los ganadores.">
          <form className="panel-form panel-form-inline" onSubmit={(e) => void handleCrearSorteo(e)}>
            <label className="panel-field"><span>Nombre del sorteo</span><input placeholder="Ej. Sorteo de bienvenida" value={tituloSorteo} onChange={(e) => setTituloSorteo(e.target.value)} required maxLength={100} /></label>
            <label className="panel-field"><span>Premio</span><input placeholder="Ej. Una tarjeta de regalo" value={premio} onChange={(e) => setPremio(e.target.value)} required maxLength={150} /></label>
            <label className="panel-field panel-number-field"><span>Ganadores</span><input type="number" min="1" value={limiteGanadores} onChange={(e) => setLimiteGanadores(Number(e.target.value))} required /></label>
            <button className="panel-button panel-button-primary" type="submit">＋ Crear sorteo</button>
          </form>
          {sorteos.length === 0 ? <EmptyState title="No tienes sorteos activos" text="Crea tu primer sorteo desde el formulario." /> : (
            <div className="panel-grid">
              {sorteos.map((sorteo) => (
                <article className="panel-content-card" key={sorteo.id}>
                  <div className="panel-content-card-top"><span className="panel-card-icon">✳</span><span className="panel-tag">Sorteo</span></div>
                  <h3>{sorteo.titulo}</h3>
                  <p className="panel-muted">Premio: {sorteo.premio}</p>
                  <ProgressBar actual={sorteo.contador} total={sorteo.limiteGanadores} />
                  <DeleteButton onClick={() => void handleBorrarSorteo(sorteo.id)} text="Eliminar sorteo" />
                </article>
              ))}
            </div>
          )}
        </Section>

        <Section id="ruletas" number="04" title="Ruletas" description="Configura opciones con pesos para tus dinámicas.">
          <form className="panel-form" onSubmit={(e) => void handleCrearRuleta(e)}>
            <label className="panel-field"><span>Nombre de la ruleta</span><input placeholder="Ej. Ruleta de premios" value={tituloRuleta} onChange={(e) => setTituloRuleta(e.target.value)} required maxLength={100} /></label>
            <label className="panel-field"><span>Segmentos y pesos</span><input placeholder="Premio:1, Otra opción:2" value={segmentosTexto} onChange={(e) => setSegmentosTexto(e.target.value)} required /></label>
            <small className="panel-help">Formato: texto:peso, texto:peso. Si omites el peso, se usará 1.</small>
            <button className="panel-button panel-button-primary" type="submit">＋ Crear ruleta</button>
          </form>
          {ruletas.length === 0 ? <EmptyState title="Tu primera ruleta empieza aquí" text="Agrega al menos dos segmentos para crear una ruleta." /> : (
            <div className="panel-grid">
              {ruletas.map((ruleta) => (
                <article className="panel-content-card" key={ruleta.id}>
                  <div className="panel-content-card-top"><span className="panel-card-icon">◉</span><span className="panel-tag">Ruleta</span></div>
                  <h3>{ruleta.titulo}</h3>
                  <div className="panel-chip-list">{ruleta.segmentos.map((segmento, index) => <span className="panel-chip" key={`${segmento.texto}-${index}`}>{segmento.texto} <b>×{segmento.peso}</b></span>)}</div>
                  <DeleteButton onClick={() => void handleBorrarRuleta(ruleta.id)} text="Eliminar ruleta" />
                </article>
              ))}
            </div>
          )}
        </Section>

        <Section id="referidos" number="05" title="Referidos" description="Revisa los perfiles que te han recomendado.">
          {referidos.length === 0 ? <EmptyState title="Aún no tienes referidos" text="Cuando recibas recomendaciones, aparecerán aquí." /> : (
            <div className="panel-grid">
              {referidos.map((referido) => (
                <article className="panel-content-card" key={referido.id}>
                  <div className="panel-content-card-top"><span className="panel-card-icon">♧</span><span className={referido.destacado ? 'panel-tag panel-tag-featured' : 'panel-tag'}>{referido.destacado ? 'Destacado' : 'Referido'}</span></div>
                  <h3>{referido.nombre}</h3>
                  <a className="panel-referred-link" href={referido.enlace} target="_blank" rel="noopener noreferrer">{referido.enlace}</a>
                  {referido.mensaje && <blockquote className="panel-quote">“{referido.mensaje}”</blockquote>}
                  <div className="panel-card-actions">
                    <button className={referido.destacado ? 'panel-button panel-button-featured' : 'panel-button panel-button-secondary'} onClick={() => void handleDestacar(referido.id)}>
                      {referido.destacado ? '★ Destacado' : '☆ Destacar'}
                    </button>
                    <DeleteButton onClick={() => void handleBorrarReferido(referido.id)} text="Eliminar" />
                  </div>
                </article>
              ))}
            </div>
          )}
        </Section>

        <footer className="panel-footer">
          <span><span className="panel-footer-dot" /> LinkFree está listo para compartir</span>
          <a href="#inicio">Volver arriba ↑</a>
        </footer>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <article className="panel-stat-card">
      <div className="panel-stat-icon">{icon}</div>
      <div><span>{label}</span><strong>{value}</strong></div>
    </article>
  );
}

function Section({ id, number, title, description, children }: { id: string; number: string; title: string; description: string; children: ReactNode }) {
  return (
    <section className="panel-section" id={id}>
      <div className="panel-section-heading">
        <span className="panel-section-number">{number}</span>
        <div><h2>{title}</h2><p>{description}</p></div>
      </div>
      <div className="panel-section-body">{children}</div>
    </section>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="panel-empty"><div className="panel-empty-icon">✦</div><strong>{title}</strong><p>{text}</p></div>;
}

function DeleteButton({ onClick, text = 'Eliminar' }: { onClick: () => void; text?: string }) {
  return <button className="panel-button panel-button-danger" type="button" onClick={onClick}>⌫ {text}</button>;
}

function ProgressBar({ actual, total }: { actual: number; total: number }) {
  const porcentaje = total > 0 ? Math.min(100, Math.max(0, Math.round((actual / total) * 100))) : 0;
  return (
    <div className="panel-progress">
      <div className="panel-progress-label"><span>Progreso</span><strong>{actual} / {total}</strong></div>
      <div className="panel-progress-track"><div className="panel-progress-fill" style={{ width: `${porcentaje}%` }} /></div>
    </div>
  );
}

export default Panel;
