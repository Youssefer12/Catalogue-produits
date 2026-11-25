import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username.trim().toLowerCase() === 'admin') {
      login(username);
      navigate('/admin');
    } else {
      setError('Accès refusé ! Cette page est réservée uniquement à l’administrateur.');
    }
  };

  return (
    <div className="form-box">
      <h2>Connexion Admin</h2>

      {error && (
        <p style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{error}</p>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nom d'utilisateur "
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="form-control"
        />
        <button type="submit" className="btn" style={{ width: '100%' }}>
          Se connecter
        </button>
      </form>
    </div>
  );
}
