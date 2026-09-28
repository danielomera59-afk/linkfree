import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  obtenerMisLinks,
  crearLink,
  borrarLink,
} from '../services/links';
import type { LinkItem } from '../services/links';

import {
  obtenerMisEncuestas,
  crearEncuesta,
  borrarEncuesta,
} from '../services/encuestas';
import type { Encuesta } from '../services/encuestas';

import {
  obtenerMisSorteos,
  crearSorteo,
  borrarSorteo,
} from '../services/sorteos';
import type { Sorteo } from '../services/sorteos';

import {
  obtenerMisRuletas,
  crearRuleta,
  borrarRuleta,
} from '../services/ruletas';
import type { Ruleta } from '../services/ruletas';

import {
  obtenerMisReferidos,
  destacarReferido,
  borrarReferido,
} from '../services/referidos';
import type { Referido } from '../services/referidos';

function Panel() {
  const navigate = useNavigate();

  // Links
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [titulo, setTitulo] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  // Encuestas
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [pregunta, setPregunta] = useState('');
  const [opcionesTexto, setOpcionesTexto] = useState('');

  // Sorteos
  const [sorteos, setSorteos] = useState<Sorteo[]>([]);
  const [tituloSorteo, setTituloSorteo] = useState('');
  const [premio, setPremio] = useState('');
  const [limiteGanadores, setLimiteGanadores] = useState(10);

  // Ruletas
  const [ruletas, setRuletas] = useState<Ruleta[]>([]);
  const [tituloRuleta, setTituloRuleta] = useState('');
  const [segmentosTexto, setSegmentosTexto] = useState('');

  // Referidos
  const [referidos, setReferidos] = useState<Referido[]>([]);

  // Otros
  const [copiado, setCopiado] = useState(false);
  const [cargando, setCargando] = useState(true);

  const usuario = localStorage.getItem('usuario');

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const dataLinks = await obtenerMisLinks();
      setLinks(dataLinks);

      const dataEncuestas = await obtenerMisEncuestas();
      setEncuestas(dataEncuestas);

      const dataSorteos = await obtenerMisSorteos();
      setSorteos(dataSorteos);

      const dataRuletas = await obtenerMisRuletas();
      setRuletas(dataRuletas);

      const dataReferidos = await obtenerMisReferidos();
      setReferidos(dataReferidos);
    } catch (err) {
      console.error('Error cargando datos:', err);
      navigate('/login');
    } finally {
      setCargando(false);
    }
  }

  // =========================
  // LINKS
  // =========================

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      const nuevo = await crearLink(titulo, url);

      setLinks((prev) => [...prev, nuevo]);
      setTitulo('');
      setUrl('');
    } catch (err) {
      console.error('Error creando link:', err);
      setError('No se pudo crear el link. Revisa la URL.');
    }
  }

  async function handleBorrar(id: string) {
    try {
      await borrarLink(id);

      setLinks((prev) =>
        prev.filter((link) => link.id !== id)
      );
    } catch (err) {
      console.error('Error borrando link:', err);
    }
  }

  // =========================
  // ENCUESTAS
  // =========================

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

    try {
      const nueva = await crearEncuesta(
        pregunta,
        opciones
      );

      setEncuestas((prev) => [nueva, ...prev]);
      setPregunta('');
      setOpcionesTexto('');
    } catch (err) {
      console.error('Error creando encuesta:', err);
      alert('No se pudo crear la encuesta.');
    }
  }

  async function handleBorrarEncuesta(id: string) {
    try {
      await borrarEncuesta(id);

      setEncuestas((prev) =>
        prev.filter((e) => e.id !== id)
      );
    } catch (err) {
      console.error('Error borrando encuesta:', err);
    }
  }

  // =========================
  // SORTEOS
  // =========================

  async function handleCrearSorteo(e: React.FormEvent) {
    e.preventDefault();

    try {
      const nuevo = await crearSorteo(
        tituloSorteo,
        premio,
        limiteGanadores
      );

      setSorteos((prev) => [nuevo, ...prev]);
      setTituloSorteo('');
      setPremio('');
      setLimiteGanadores(10);
    } catch (err) {
      console.error('Error creando sorteo:', err);
      alert('No se pudo crear el sorteo.');
    }
  }

  async function handleBorrarSorteo(id: string) {
    try {
      await borrarSorteo(id);

      setSorteos((prev) =>
        prev.filter((s) => s.id !== id)
      );
    } catch (err) {
      console.error('Error borrando sorteo:', err);
    }
  }

  // =========================
  // LOGOUT
  // =========================

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    navigate('/login');
  }

  // =========================
  // RULETAS
  // =========================

  async function handleCrearRuleta(e: React.FormEvent) {
    e.preventDefault();

    const segmentos = segmentosTexto
      .split(',')
      .map((parte) => {
        const [texto, pesoTexto] = parte
          .split(':')
          .map((p) => p.trim());

        return {
          texto: texto || '',
          peso: Number(pesoTexto) || 1,
        };
      })
      .filter((s) => s.texto.length > 0);

    if (segmentos.length < 2) {
      alert(
        'Escribe al menos 2 segmentos, formato: Texto:peso, Texto:peso'
      );
      return;
    }

    try {
      const nueva = await crearRuleta(
        tituloRuleta,
        segmentos
      );

      setRuletas((prev) => [nueva, ...prev]);
      setTituloRuleta('');
      setSegmentosTexto('');
    } catch (err) {
      console.error('Error creando ruleta:', err);
      alert('No se pudo crear la ruleta.');
    }
  }

  async function handleBorrarRuleta(id: string) {
    try {
      await borrarRuleta(id);

      setRuletas((prev) =>
        prev.filter((r) => r.id !== id)
      );
    } catch (err) {
      console.error('Error borrando ruleta:', err);
    }
  }

  // =========================
  // REFERIDOS
  // =========================

  async function handleDestacar(id: string) {
    try {
      const actualizado = await destacarReferido(id);

      setReferidos((prev) =>
        prev.map((r) =>
          r.id === id ? actualizado : r
        )
      );
    } catch (err) {
      console.error('Error destacando referido:', err);
    }
  }

  async function handleBorrarReferido(id: string) {
    try {
      await borrarReferido(id);

      setReferidos((prev) =>
        prev.filter((r) => r.id !== id)
      );
    } catch (err) {
      console.error('Error borrando referido:', err);
    }
  }

  // =========================
  // COPIAR LINK
  // =========================

  async function handleCopiarLink() {
    if (!usuario) return;

    const urlPerfil =
      `${window.location.origin}/${usuario}`;

    try {
      await navigator.clipboard.writeText(urlPerfil);

      setCopiado(true);

      setTimeout(() => {
        setCopiado(false);
      }, 2000);
    } catch (err) {
      console.error('Error copiando link:', err);
    }
  }

  // =========================
  // CARGANDO
  // =========================

  if (cargando) {
    return (
      <p style={{ padding: '2rem' }}>
        Cargando...
      </p>
    );
  }

  // =========================
  // RENDER
  // =========================

  return (
    <div style={{ paddingBottom: '3rem' }}>

      {/* ENCABEZADO */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ marginBottom: '0.6rem' }}>
            Mi Panel
          </h1>

          {usuario && (
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
                style={{
                  color: 'var(--color-primary)',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                {window.location.host}/{usuario}
              </a>

              <button
                onClick={handleCopiarLink}
                style={{
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.85rem',
                }}
              >
                {copiado
                  ? '¡Copiado!'
                  : 'Copiar link'}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            color: 'var(--color-ink)',
            border: '1.5px solid var(--color-border)',
          }}
        >
          Cerrar sesión
        </button>
      </div>

      {/* =========================
          LINKS
      ========================= */}

      <Seccion titulo="Links">

        <form
          onSubmit={handleCrear}
          style={{
            display: 'flex',
            gap: '0.6rem',
            flexWrap: 'wrap',
          }}
        >
          <input
            placeholder="Título (ej. Mi Instagram)"
            value={titulo}
            onChange={(e) =>
              setTitulo(e.target.value)
            }
            required
            style={{
              flex: '1 1 160px',
            }}
          />

          <input
            placeholder="URL"
            value={url}
            onChange={(e) =>
              setUrl(e.target.value)
            }
            required
            style={{
              flex: '1 1 160px',
            }}
          />

          <button type="submit">
            Agregar
          </button>
        </form>

        {error && (
          <p
            style={{
              color: '#DC2626',
              fontSize: '0.9rem',
            }}
          >
            {error}
          </p>
        )}

        {links.length === 0 && (
          <VacioAviso
            texto="Todavía no tienes links."
          />
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            marginTop: '1rem',
          }}
        >
          {links.map((link) => (
            <Tarjeta key={link.id}>
              <div>
                <strong>
                  {link.titulo}
                </strong>

                <p
                  style={{
                    fontSize: '0.85rem',
                    color: '#6B7280',
                  }}
                >
                  {link.url}
                </p>
              </div>

              <BotonBorrar
                onClick={() =>
                  handleBorrar(link.id)
                }
              />
            </Tarjeta>
          ))}
        </div>

      </Seccion>

      {/* =========================
          ENCUESTAS
      ========================= */}

      <Seccion titulo="Encuestas">

        <form
          onSubmit={handleCrearEncuesta}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
          }}
        >
          <input
            placeholder="Pregunta"
            value={pregunta}
            onChange={(e) =>
              setPregunta(e.target.value)
            }
            required
          />

          <input
            placeholder="Opciones separadas por coma"
            value={opcionesTexto}
            onChange={(e) =>
              setOpcionesTexto(e.target.value)
            }
            required
          />

          <button
            type="submit"
            style={{
              alignSelf: 'flex-start',
            }}
          >
            Crear encuesta
          </button>
        </form>

        {encuestas.length === 0 && (
          <VacioAviso
            texto="Todavía no tienes encuestas."
          />
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            marginTop: '1rem',
          }}
        >
          {encuestas.map((encuesta) => (
            <Tarjeta
              key={encuesta.id}
              columna
            >
              <strong>
                {encuesta.pregunta}
              </strong>

              {encuesta.opciones.map((opcion) => (
                <p
                  key={opcion.id}
                  style={{
                    fontSize: '0.85rem',
                    color: '#6B7280',
                    margin: '0.2rem 0',
                  }}
                >
                  {opcion.texto} — {opcion.votos} votos
                </p>
              ))}

              <BotonBorrar
                onClick={() =>
                  handleBorrarEncuesta(
                    encuesta.id
                  )
                }
                texto="Borrar encuesta"
              />
            </Tarjeta>
          ))}
        </div>

      </Seccion>

      {/* =========================
          SORTEOS
      ========================= */}

      <Seccion titulo="Sorteos">

        <form
          onSubmit={handleCrearSorteo}
          style={{
            display: 'flex',
            gap: '0.6rem',
            flexWrap: 'wrap',
          }}
        >
          <input
            placeholder="Título"
            value={tituloSorteo}
            onChange={(e) =>
              setTituloSorteo(e.target.value)
            }
            required
            style={{
              flex: '1 1 140px',
            }}
          />

          <input
            placeholder="Premio"
            value={premio}
            onChange={(e) =>
              setPremio(e.target.value)
            }
            required
            style={{
              flex: '1 1 140px',
            }}
          />

          <input
            type="number"
            min="1"
            placeholder="Límite"
            value={limiteGanadores}
            onChange={(e) =>
              setLimiteGanadores(
                Number(e.target.value)
              )
            }
            required
            style={{
              flex: '0 1 100px',
            }}
          />

          <button type="submit">
            Crear sorteo
          </button>
        </form>

        {sorteos.length === 0 && (
          <VacioAviso
            texto="Todavía no tienes sorteos."
          />
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            marginTop: '1rem',
          }}
        >
          {sorteos.map((sorteo) => (
            <Tarjeta
              key={sorteo.id}
              columna
            >
              <strong>
                {sorteo.titulo}
              </strong>

              <p
                style={{
                  fontSize: '0.85rem',
                  color: '#6B7280',
                }}
              >
                {sorteo.premio}
              </p>

              <BarraProgreso
                actual={sorteo.contador}
                total={sorteo.limiteGanadores}
              />

              <BotonBorrar
                onClick={() =>
                  handleBorrarSorteo(
                    sorteo.id
                  )
                }
                texto="Borrar sorteo"
              />
            </Tarjeta>
          ))}
        </div>

      </Seccion>

      {/* =========================
          RULETAS
      ========================= */}

      <Seccion titulo="Ruletas">

        <form
          onSubmit={handleCrearRuleta}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
          }}
        >
          <input
            placeholder="Título"
            value={tituloRuleta}
            onChange={(e) =>
              setTituloRuleta(e.target.value)
            }
            required
          />

          <input
            placeholder="Segmentos: Texto:peso, Texto:peso"
            value={segmentosTexto}
            onChange={(e) =>
              setSegmentosTexto(e.target.value)
            }
            required
          />

          <button
            type="submit"
            style={{
              alignSelf: 'flex-start',
            }}
          >
            Crear ruleta
          </button>
        </form>

        {ruletas.length === 0 && (
          <VacioAviso
            texto="Todavía no tienes ruletas."
          />
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            marginTop: '1rem',
          }}
        >
          {ruletas.map((ruleta) => (
            <Tarjeta
              key={ruleta.id}
              columna
            >
              <strong>
                {ruleta.titulo}
              </strong>

              <p
                style={{
                  fontSize: '0.85rem',
                  color: '#6B7280',
                }}
              >
                {ruleta.segmentos
                  .map(
                    (s) =>
                      `${s.texto} (${s.peso})`
                  )
                  .join(' · ')}
              </p>

              <BotonBorrar
                onClick={() =>
                  handleBorrarRuleta(
                    ruleta.id
                  )
                }
                texto="Borrar ruleta"
              />
            </Tarjeta>
          ))}
        </div>

      </Seccion>

      {/* =========================
          REFERIDOS
      ========================= */}

      <Seccion titulo="Referidos">

        {referidos.length === 0 && (
          <VacioAviso
            texto="Todavía no has recibido perfiles."
          />
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
          }}
        >
          {referidos.map((referido) => (
            <Tarjeta
              key={referido.id}
              columna
            >
              <strong>
                {referido.nombre}
              </strong>

              <p
                style={{
                  fontSize: '0.85rem',
                  color: '#6B7280',
                }}
              >
                {referido.enlace}
              </p>

              {referido.mensaje && (
                <p
                  style={{
                    fontSize: '0.85rem',
                    fontStyle: 'italic',
                  }}
                >
                  "{referido.mensaje}"
                </p>
              )}

              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '0.3rem',
                }}
              >
                <button
                  onClick={() =>
                    handleDestacar(
                      referido.id
                    )
                  }
                  style={
                    referido.destacado
                      ? {
                          background:
                            'var(--color-accent)',
                          color:
                            'var(--color-ink)',
                        }
                      : undefined
                  }
                >
                  {referido.destacado
                    ? 'Destacado ✅'
                    : 'Destacar'}
                </button>

                <BotonBorrar
                  onClick={() =>
                    handleBorrarReferido(
                      referido.id
                    )
                  }
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

// =========================
// COMPONENTE SECCION
// =========================

function Seccion({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        marginTop: '2.5rem',
      }}
    >
      <h2>{titulo}</h2>

      {children}
    </div>
  );
}

// =========================
// COMPONENTE TARJETA
// =========================

function Tarjeta({
  children,
  columna,
}: {
  children: React.ReactNode;
  columna?: boolean;
}) {
  return (
    <div
      style={{
        background:
          'var(--color-surface)',
        border:
          '1.5px solid var(--color-border)',
        borderRadius: '12px',
        padding: '1rem 1.2rem',
        display: 'flex',
        flexDirection:
          columna ? 'column' : 'row',
        justifyContent:
          columna
            ? 'flex-start'
            : 'space-between',
        alignItems:
          columna
            ? 'flex-start'
            : 'center',
        gap: '0.3rem',
      }}
    >
      {children}
    </div>
  );
}

// =========================
// BOTON BORRAR
// =========================

function BotonBorrar({
  onClick,
  texto = 'Borrar',
}: {
  onClick: () => void;
  texto?: string;
}) {
  return (
    <button
      type="button"
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

// =========================
// AVISO VACÍO
// =========================

function VacioAviso({
  texto,
}: {
  texto: string;
}) {
  return (
    <p
      style={{
        color: '#9CA3AF',
        fontStyle: 'italic',
      }}
    >
      {texto}
    </p>
  );
}

// =========================
// BARRA DE PROGRESO
// =========================

function BarraProgreso({
  actual,
  total,
}: {
  actual: number;
  total: number;
}) {
  const porcentaje =
    total > 0
      ? Math.min(
          100,
          Math.round((actual / total) * 100)
        )
      : 0;

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          background:
            'var(--color-border)',
          borderRadius: '8px',
          height: '8px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${porcentaje}%`,
            background:
              'var(--color-accent)',
            height: '100%',
          }}
        />
      </div>

      <p
        style={{
          fontSize: '0.8rem',
          color: '#6B7280',
          margin: '0.2rem 0 0 0',
        }}
      >
        {actual} / {total}
      </p>
    </div>
  );
}