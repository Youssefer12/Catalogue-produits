import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchProductById, formatMAD } from '../services/api';
import { useCart } from '../context/CartContext';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart, cart, getProductById, loading: storeLoading } = useCart();
  const storeProduct = getProductById(id);

  const [fallbackProduct, setFallbackProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    if (storeProduct || storeLoading) return;

    let cancelled = false;
    async function loadDetails() {
      try {
        setLoading(true);
        const data = await fetchProductById(id);
        if (!cancelled) {
          setFallbackProduct(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadDetails();
    return () => {
      cancelled = true;
    };
  }, [id, storeProduct, storeLoading]);

  const product = storeProduct || fallbackProduct;

  if (storeLoading || loading) {
    return (
      <p className="text-center" style={{ padding: '40px' }}>
        Chargement des détails...
      </p>
    );
  }
  if (error && !product) {
    return (
      <p className="text-center text-red" style={{ padding: '40px' }}>
        {error}
      </p>
    );
  }
  if (!product) {
    return (
      <p className="text-center" style={{ padding: '40px' }}>
        Produit introuvable.
      </p>
    );
  }

  const stock = Number(product.stock) || 0;
  const inCartQty = cart.find((item) => item.id === product.id)?.quantity || 0;
  const isOutOfStock = stock <= 0;
  const reachedMax = inCartQty >= stock;

  const handleAdd = () => {
    const ok = addToCart(product);
    if (ok) {
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 1800);
    }
  };

  return (
    <div
      className="container"
      style={{
        maxWidth: '820px',
        background: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      }}
    >
      <Link
        to="/produits"
        style={{ display: 'inline-block', marginBottom: '20px', color: '#007bff', textDecoration: 'none' }}
      >
        ← Retour au catalogue
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px' }}>
        <img
          src={product.thumbnail}
          alt={product.title}
          style={{ width: '100%', maxHeight: '340px', borderRadius: '6px', objectFit: 'contain', background: '#fafafa' }}
        />
        <div>
          <span className="badge badge-info">
            {product.categoryLabel || product.category}
          </span>
          {product.brand && (
            <span style={{ marginLeft: '10px', fontSize: '13px', color: '#666' }}>
              Marque : <strong>{product.brand}</strong>
            </span>
          )}

          <h2 style={{ marginTop: '10px' }}>{product.title}</h2>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
            {formatMAD(product.price)}
          </p>
          <p style={{ color: '#555', lineHeight: '1.6' }}>{product.description}</p>
          <p style={{ margin: '15px 0' }}>⭐ {product.rating} / 5</p>

          <p style={{ marginBottom: '18px' }}>
            Disponibilité :{' '}
            <span
              className={`badge ${
                isOutOfStock ? 'badge-danger' : stock <= 5 ? 'badge-warning' : 'badge-success'
              }`}
            >
              {isOutOfStock ? 'Rupture de stock' : `${stock} en stock`}
            </span>
          </p>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock || reachedMax}
            className="btn btn-orange"
            style={{
              opacity: isOutOfStock || reachedMax ? 0.55 : 1,
              cursor: isOutOfStock || reachedMax ? 'not-allowed' : 'pointer',
            }}
          >
            {isOutOfStock
              ? 'Rupture de stock'
              : reachedMax
              ? 'Quantité max atteinte dans le panier'
              : 'Ajouter au panier'}
          </button>

          {addedFeedback && (
            <p style={{ color: '#28a745', marginTop: '10px', fontWeight: 'bold' }}>
              ✓ Produit ajouté au panier !
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
