import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrar } from '../services/auth';

function Registro() {
  const [nombre, setNombre] = useState('');
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      await registrar({ nombre, usuario, email, password });
      navigate('/login');
    } catch (err) {
      setError('No se pudo registrar. Revisa que el usuario o email no estén ya en uso.');
    }
  }

  return (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}
  >
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1.5px solid var(--color-border)',
        borderRadius: '16px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '380px',
      }}
    >
      <h1>Crear cuenta</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginTop: '1.5rem' }}>
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          placeholder="Usuario (para tu URL pública)"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: '#DC2626', fontSize: '0.9rem' }}>{error}</p>}
        <button type="submit">Registrarme</button>
      </form>
      <p style={{ marginTop: '1.25rem', fontSize: '0.9rem' }}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  </div>
);
}

export default Registro;