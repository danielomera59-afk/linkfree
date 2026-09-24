import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerMisLinks, crearLink, borrarLink } from '../services/links';
import type { LinkItem } from '../services/links';

function Panel() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [titulo, setTitulo] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  const usuario = localStorage.getItem('usuario');

  useEffect(() => {
    cargarLinks();
  }, []);

  async function cargarLinks() {
    try {
      const data = await obtenerMisLinks();
      setLinks(data);
    } catch (err) {
      // Si el token es inválido o expiró, mandamos al login
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
    </div>
  );
}

export default Panel;