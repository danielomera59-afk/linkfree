import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerMisLinks, crearLink, borrarLink } from '../services/links';
import type { LinkItem } from '../services/links';
import { obtenerMisEncuestas, crearEncuesta, borrarEncuesta } from '../services/encuestas';
import type { Encuesta } from '../services/encuestas';
import { obtenerMisSorteos, crearSorteo, borrarSorteo } from '../services/sorteos';
import type { Sorteo } from '../services/sorteos';

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

  useEffect(() => {
    cargarLinks();
  }, []);

  async function cargarLinks() {
    try {
      const data = await obtenerMisLinks();
      setLinks(data);
      const dataEncuestas = await obtenerMisEncuestas();
      setEncuestas(dataEncuestas);
      const dataSorteos = await obtenerMisSorteos();
      setSorteos(dataSorteos);
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

  if (cargando) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Mi Panel</h1>
      <p>
        Tu página pública: <strong>/{usuario}</strong>
      </p>
      <button onClick={handleLogout}>Cerrar sesión</button>

      <h2>Agregar link</h2>
      <form onSubmit={handleCrear}>
        <input
          placeholder="Título (ej. Mi Instagram)"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />
        <input
          placeholder="URL (ej. https://instagram.com/tu-usuario)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Agregar</button>
      </form>

      <h2>Mis links</h2>
      {links.length === 0 && <p>Todavía no tienes links.</p>}
      <ul>
        {links.map((link) => (
          <li key={link.id}>
            {link.titulo} — {link.url}{' '}
            <button onClick={() => handleBorrar(link.id)}>Borrar</button>
          </li>
        ))}
      </ul>
      <h2>Encuestas</h2>
<form onSubmit={handleCrearEncuesta}>
  <input
    placeholder="Pregunta (ej. ¿Qué video subo primero?)"
    value={pregunta}
    onChange={(e) => setPregunta(e.target.value)}
    required
  />
  <input
    placeholder="Opciones separadas por coma (ej. Tutorial, Vlog, Q&A)"
    value={opcionesTexto}
    onChange={(e) => setOpcionesTexto(e.target.value)}
    required
  />
  <button type="submit">Crear encuesta</button>
</form>

{encuestas.length === 0 && <p>Todavía no tienes encuestas.</p>}
<ul>
  {encuestas.map((encuesta) => (
    <li key={encuesta.id}>
      <strong>{encuesta.pregunta}</strong>
      <ul>
        {encuesta.opciones.map((opcion) => (
          <li key={opcion.id}>
            {opcion.texto} — {opcion.votos} votos
          </li>
        ))}
      </ul>
      <button onClick={() => handleBorrarEncuesta(encuesta.id)}>Borrar encuesta</button>
    </li>
  ))}
</ul>
<h2>Sorteos</h2>
<form onSubmit={handleCrearSorteo}>
  <input
    placeholder="Título (ej. Sorteo de lanzamiento)"
    value={tituloSorteo}
    onChange={(e) => setTituloSorteo(e.target.value)}
    required
  />
  <input
    placeholder="Premio (ej. Código de 10% de descuento)"
    value={premio}
    onChange={(e) => setPremio(e.target.value)}
    required
  />
  <input
    type="number"
    min="1"
    placeholder="Límite de ganadores"
    value={limiteGanadores}
    onChange={(e) => setLimiteGanadores(Number(e.target.value))}
    required
  />
  <button type="submit">Crear sorteo</button>
</form>

{sorteos.length === 0 && <p>Todavía no tienes sorteos.</p>}
<ul>
  {sorteos.map((sorteo) => (
    <li key={sorteo.id}>
      <strong>{sorteo.titulo}</strong> — {sorteo.premio}
      <br />
      {sorteo.contador} / {sorteo.limiteGanadores} ganadores
      <br />
      <button onClick={() => handleBorrarSorteo(sorteo.id)}>Borrar sorteo</button>
    </li>
  ))}
</ul>
    </div>
  );
}

export default Panel;