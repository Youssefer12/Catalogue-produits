/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';
import { CATEGORY_LABELS, fetchProducts } from '../services/api';

const CartContext = createContext();
const CART_STORAGE_KEY = 'catalogue_cart_v1';
const PRODUCTS_STORAGE_KEY = 'catalogue_products_v1';

function readStoredList(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => readStoredList(CART_STORAGE_KEY) || []);
  const [products, setProducts] = useState(() => readStoredList(PRODUCTS_STORAGE_KEY) || []);
  const [loading, setLoading] = useState(() => {
    const stored = readStoredList(PRODUCTS_STORAGE_KEY);
    return !stored || stored.length === 0;
  });
  const [error, setError] = useState(null);

  // Charger les produits électroniques depuis l'API si non présents en cache
  useEffect(() => {
    const stored = readStoredList(PRODUCTS_STORAGE_KEY);
    if (stored && stored.length > 0) {
      return;
    }

    let cancelled = false;
    async function initProducts() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProducts();
        if (!cancelled) {
          setProducts(data);
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

    initProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage quota errors
    }
  }, [cart]);

  useEffect(() => {
    try {
      if (products.length > 0) {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
      }
    } catch {
      // Ignore storage quota errors
    }
  }, [products]);

  // Ajouter un produit ou incrémenter sa quantité en respectant le stock disponible
  const addToCart = (product) => {
    const liveProduct = products.find((p) => p.id === product.id) || product;
    const availableStock = Number.isFinite(Number(liveProduct.stock))
      ? Number(liveProduct.stock)
      : Infinity;

    if (availableStock <= 0) {
      return false;
    }

    let added = false;
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === liveProduct.id);
      if (existingItem) {
        if (existingItem.quantity >= availableStock) {
          return prevCart;
        }
        added = true;
        return prevCart.map((item) =>
          item.id === liveProduct.id
            ? {
                ...item,
                price: liveProduct.price,
                stock: availableStock,
                quantity: item.quantity + 1,
              }
            : item
        );
      }
      added = true;
      return [...prevCart, { ...liveProduct, quantity: 1 }];
    });
    return added;
  };

  // Supprimer un produit du panier
  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Modifier la quantité d'un produit en respectant le stock
  const updateQuantity = (id, quantity, maxStock) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    const cappedQuantity = Number.isFinite(Number(maxStock))
      ? Math.min(quantity, Math.max(0, Number(maxStock)))
      : quantity;

    if (cappedQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity: cappedQuantity } : item))
    );
  };

  // Vider le panier
  const clearCart = () => {
    setCart([]);
  };

  // Gestion de stock pour l'Admin et lors des achats
  const resetCatalogFromApi = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStock = (productId, newStock) => {
    const safeStock = Math.max(0, Math.floor(Number(newStock) || 0));
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: safeStock } : p))
    );
  };

  const adjustStock = (productId, delta) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, stock: Math.max(0, (Number(p.stock) || 0) + delta) }
          : p
      )
    );
  };

  const updateProduct = (productId, updates) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updates } : p))
    );
  };

  const addProduct = (productData) => {
    const nextId =
      products.length > 0
        ? Math.max(...products.map((p) => Number(p.id) || 0)) + 1
        : 1000;

    const category = productData.category || 'smartphones';
    const newProduct = {
      id: nextId,
      title: productData.title.trim(),
      brand: (productData.brand || 'TechStore').trim(),
      category,
      categoryLabel: CATEGORY_LABELS[category] || category,
      price: Math.max(1, Math.round(Number(productData.price) || 0)),
      stock: Math.max(0, Math.floor(Number(productData.stock) || 0)),
      rating: Number(productData.rating) || 4.8,
      description:
        productData.description?.trim() ||
        'Produit électronique haute performance disponible en stock.',
      thumbnail:
        productData.thumbnail?.trim() ||
        'https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/thumbnail.webp',
    };

    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const deleteProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const getProductById = (id) => {
    const numericId = Number(id);
    return products.find((p) => p.id === numericId || String(p.id) === String(id)) || null;
  };

  // Vérifier et décrémenter le stock lors de la validation d'une commande
  const consumeStockForItems = (items) => {
    for (const item of items) {
      const product = products.find((p) => p.id === item.id);
      const currentStock = product ? Number(product.stock) : 0;
      if (!product || currentStock < item.quantity) {
        throw new Error(
          `Stock insuffisant pour "${item.title}" (disponible : ${currentStock}).`
        );
      }
    }

    const qtyById = new Map(items.map((item) => [item.id, item.quantity]));
    const normalizedItems = items.map((item) => {
      const latest = products.find((p) => p.id === item.id);
      return {
        ...item,
        price: latest ? latest.price : item.price,
        thumbnail: latest?.thumbnail || item.thumbnail,
      };
    });

    setProducts((prev) =>
      prev.map((p) => {
        const boughtQty = qtyById.get(p.id);
        if (!boughtQty) return p;
        return { ...p, stock: Math.max(0, p.stock - boughtQty) };
      })
    );

    return normalizedItems;
  };

  // Calculs automatiques
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        products,
        loading,
        error,
        resetCatalogFromApi,
        updateStock,
        adjustStock,
        updateProduct,
        addProduct,
        deleteProduct,
        getProductById,
        consumeStockForItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
