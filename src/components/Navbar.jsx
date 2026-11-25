import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="logo" style={{ fontWeight: 'bold', fontSize: '18px', textDecoration: 'none', color: '#007bff' }}>
        MyStore
      </Link>

      <div className="nav-links">
        <Link to="/">Accueil</Link>
        <Link to="/produits">Produits</Link>
        <Link to="/panier">Panier ({totalItems})</Link>
        <Link to="/admin">Administration</Link>
      </div>

      <div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>
              Salut, <strong>{user.username}</strong>
            </span>
            <button onClick={logout} className="btn btn-red" style={{ padding: '5px 10px' }}>
              Déconnexion
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn">
            Connexion
          </Link>
        )}
      </div>
    </nav>
  );
}
