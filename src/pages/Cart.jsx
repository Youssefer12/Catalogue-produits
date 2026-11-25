import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatMAD } from '../services/api';

export default function Cart() {
  const {
    cart,
    products,
    removeFromCart,
    updateQuantity,
    totalPrice,
    clearCart,
    consumeStockForItems,
  } = useCart();

  const [errorMsg, setErrorMsg] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const getAvailableStock = (productId, fallbackStock) => {
    const found = products.find((p) => p.id === productId);
    if (found) return Number(found.stock) || 0;
    return Number(fallbackStock) || 0;
  };

  const handleConfirmOrder = () => {
    setErrorMsg('');
    if (cart.length === 0) return;

    try {
      consumeStockForItems(cart);
      clearCart();
      setConfirmed(true);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  if (confirmed) {
    return (
      <div className="container" style={{ maxWidth: '700px', marginTop: '30px', textAlign: 'center' }}>
        <div
          style={{
            background: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ color: '#28a745' }}>Commande confirmée avec succès !</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Merci pour vos achats. Le stock a été mis à jour.
          </p>
          <Link to="/produits" className="btn">
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container" style={{ marginTop: '30px', textAlign: 'center' }}>
        <h2>Mon Panier</h2>
        <p style={{ color: '#666', margin: '15px 0 25px' }}>Votre panier est vide.</p>
        <Link to="/produits" className="btn">
          Parcourir le catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '750px', marginTop: '30px' }}>
      <h2>Mon Panier</h2>

      {errorMsg && (
        <div
          style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '12px 15px',
            borderRadius: '6px',
            marginBottom: '15px',
          }}
        >
          {errorMsg}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        {cart.map((item) => {
          const maxStock = getAvailableStock(item.id, item.stock);
          return (
            <div key={item.id} className="cart-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {item.thumbnail && <img src={item.thumbnail} alt={item.title} />}
                <div>
                  <h4 style={{ margin: '0 0 5px 0' }}>{item.title}</h4>
                  <p style={{ margin: 0, color: '#007bff', fontWeight: 'bold' }}>
                    {formatMAD(item.price)} x {item.quantity} ={' '}
                    {formatMAD(item.price * item.quantity)}
                  </p>
                  <small style={{ color: '#666' }}>Stock disponible : {maxStock}</small>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1, maxStock)}
                  className="btn"
                  style={{ padding: '4px 10px' }}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1, maxStock)}
                  disabled={item.quantity >= maxStock}
                  className="btn"
                  style={{
                    padding: '4px 10px',
                    opacity: item.quantity >= maxStock ? 0.5 : 1,
                    cursor: item.quantity >= maxStock ? 'not-allowed' : 'pointer',
                  }}
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="btn btn-red"
                  style={{ padding: '5px 10px', fontSize: '13px' }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3 style={{ margin: 0 }}>
          Total : <span style={{ color: '#19a819' }}>{formatMAD(totalPrice)}</span>
        </h3>
        <button
          onClick={handleConfirmOrder}
          className="btn btn-green"
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          Confirmer la commande
        </button>
      </div>
    </div>
  );
}
