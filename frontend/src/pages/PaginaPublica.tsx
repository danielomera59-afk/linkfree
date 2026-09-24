import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { obtenerPaginaPublica } from '../services/links';
import type { PaginaPublica as PaginaPublicaType } from '../services/links';

function PaginaPublica() {
  const { usuario } = useParams();
  const [pagina, setPagina] = useState<PaginaPublicaType | null>(null);
  const [noEncontrado, setNoEncontrado] = useState(false);

  useEffect(() => {
    if (!usuario) return;

    obtenerPaginaPublica(usuario)
      .then(setPagina)
      .catch(() => setNoEncontrado(true));
  }, [usuario]);

  if (noEncontrado) return <p>No encontramos a este creador.</p>;
  if (!pagina) return <p>Cargando...</p>;

  return (
    <div>
      <h1>{pagina.nombre}</h1>
      <p>@{pagina.usuario}</p>
      {pagina.bio && <p>{pagina.bio}</p>}

      <div>
        {pagina.links.map((link) => (
          // Los atributos deben ir aquí dentro, junto a la etiqueta <a>
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
    </div>
  );
}

export default PaginaPublica;