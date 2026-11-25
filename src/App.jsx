import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Admin from './pages/Admin';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/produits" element={<Products />} />
              <Route path="/produits/:id" element={<ProductDetails />} />
              <Route path="/panier" element={<Cart />} />
              <Route path="/login" element={<Login />} />

              {/* Route protégée pour l'admin */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <Admin />
                  </ProtectedRoute>
                }
              />

              {/* Page 404 */}
              <Route
                path="*"
                element={
                  <div className="container text-center" style={{ padding: '60px 20px' }}>
                    <h1>404 - Page introuvable</h1>
                    <p style={{ color: '#666' }}>La page demandée n&apos;existe pas.</p>
                  </div>
                }
              />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
