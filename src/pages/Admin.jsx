import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CATEGORY_LABELS, TECH_CATEGORIES, formatMAD } from '../services/api';

export default function Admin() {
  const { user, logout } = useAuth();
  const { products, adjustStock, updateStock, addProduct, deleteProduct } = useCart();

  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('smartphones');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');

  const totalUnits = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => (Number(p.stock) || 0) === 0).length;

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(search.trim().toLowerCase())
  );

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim() || Number(price) <= 0) return;

    addProduct({ title, category, price, stock });
    setTitle('');
    setPrice('');
    setStock('10');
  };

  return (
    <div className="container" style={{ marginTop: '20px' }}>
      {/* En-tête */}
      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 5px 0' }}>Administration - Stock</h1>
          <p style={{ margin: 0, color: '#666' }}>
            Bienvenue, <strong style={{ color: '#1db80f' }}>{user?.username}</strong>
          </p>
        </div>
        <button onClick={logout} className="btn btn-red">
          Se déconnecter
        </button>
      </div>

      {/* Résumé du stock */}
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Produits</h4>
          <p>{products.length}</p>
        </div>
        <div className="stat-card">
          <h4>Total en stock</h4>
          <p>{totalUnits}</p>
        </div>
        <div className="stat-card">
          <h4>Stock faible / Rupture</h4>
          <p style={{ color: outOfStockCount > 0 ? '#dc3545' : '#fd7e14' }}>
            {lowStockCount} / {outOfStockCount}
          </p>
        </div>
      </div>

      {/* Ajouter un produit */}
      <form
        onSubmit={handleAdd}
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #ddd',
          marginBottom: '20px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="Nom du produit (ex: iPhone 16)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-control"
          style={{ flex: 2, minWidth: '180px', marginBottom: 0 }}
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="form-control"
          style={{ width: 'auto', marginBottom: 0 }}
        >
          {TECH_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          placeholder="Prix (MAD)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="form-control"
          style={{ width: '120px', marginBottom: 0 }}
          required
        />
        <input
          type="number"
          min="0"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="form-control"
          style={{ width: '90px', marginBottom: 0 }}
          required
        />
        <button type="submit" className="btn btn-green">
          + Ajouter
        </button>
      </form>

      {/* Recherche */}
      <input
        type="text"
        placeholder="Rechercher un produit..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="form-control"
        style={{ maxWidth: '300px' }}
      />

      {/* Tableau de gestion de stock */}
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Catégorie</th>
              <th>Prix</th>
              <th>Stock</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <strong>{product.title}</strong>
                </td>
                <td>{CATEGORY_LABELS[product.category] || product.category}</td>
                <td>{formatMAD(product.price)}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => adjustStock(product.id, -1)}
                      className="btn btn-outline"
                      style={{ padding: '3px 8px' }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={product.stock}
                      onChange={(e) => updateStock(product.id, e.target.value)}
                      style={{ width: '55px', textAlign: 'center', padding: '4px' }}
                    />
                    <button
                      onClick={() => adjustStock(product.id, 1)}
                      className="btn btn-outline"
                      style={{ padding: '3px 8px' }}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="btn btn-red"
                    style={{ padding: '5px 10px', fontSize: '12px' }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
