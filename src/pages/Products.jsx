import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { CATEGORY_LABELS, TECH_CATEGORIES } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const { products, loading, error } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <p className="text-center" style={{ padding: '40px' }}>
        Chargement du catalogue électronique...
      </p>
    );
  }

  if (error && products.length === 0) {
    return (
      <p className="text-center text-red" style={{ padding: '40px' }}>
        Erreur : {error}
      </p>
    );
  }

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !query ||
      product.title.toLowerCase().includes(query) ||
      (product.brand && product.brand.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container">
      <h1>Catalogue Électronique &amp; Informatique</h1>

      <div className="filter-bar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`tab-btn ${selectedCategory === 'all' ? 'active' : ''}`}
        >
          Tous ({products.length})
        </button>
        {TECH_CATEGORIES.map((category) => {
          const count = products.filter((p) => p.category === category).length;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`tab-btn ${selectedCategory === category ? 'active' : ''}`}
            >
              {CATEGORY_LABELS[category]} ({count})
            </button>
          );
        })}

        <input
          type="text"
          placeholder="Rechercher téléphone, PC, marque..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control"
          style={{ maxWidth: '280px', marginBottom: 0, marginLeft: 'auto' }}
        />
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-center" style={{ padding: '40px', color: '#666' }}>
          Aucun produit ne correspond à votre recherche.
        </p>
      ) : (
        <div className="grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
