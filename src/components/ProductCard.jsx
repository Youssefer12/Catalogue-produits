import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatMAD } from '../services/api';

export default function ProductCard({ product }) {
  const { addToCart, cart } = useCart();
  const inCartQty = cart.find((item) => item.id === product.id)?.quantity || 0;
  const stock = Number(product.stock) || 0;
  const isOutOfStock = stock <= 0;
  const reachedStockLimit = inCartQty >= stock;

  return (
    <div className="card">
      <div>
        {(product.thumbnail || product.image) && (
          <img
            src={product.thumbnail || product.image}
            alt={product.title}
          />
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span className="badge badge-info">{product.categoryLabel || product.category}</span>
          <span
            className={`badge ${
              isOutOfStock ? 'badge-danger' : stock <= 5 ? 'badge-warning' : 'badge-success'
            }`}
          >
            {isOutOfStock ? 'Rupture' : `Stock: ${stock}`}
          </span>
        </div>
        <h3 style={{ margin: '8px 0 4px' }}>{product.title}</h3>
        <p style={{ color: '#007bff', fontWeight: 'bold', margin: '4px 0' }}>
          {formatMAD(product.price)}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <Link
          to={`/produits/${product.id}`}
          className="btn text-center"
          style={{ flex: 1 }}
        >
          Détails
        </Link>
        <button
          onClick={() => addToCart(product)}
          disabled={isOutOfStock || reachedStockLimit}
          className="btn btn-orange"
          style={{
            flex: 1,
            opacity: isOutOfStock || reachedStockLimit ? 0.55 : 1,
            cursor: isOutOfStock || reachedStockLimit ? 'not-allowed' : 'pointer',
          }}
        >
          {isOutOfStock ? 'Épuisé' : reachedStockLimit ? 'Max atteint' : '+ Panier'}
        </button>
      </div>
    </div>
  );
}
