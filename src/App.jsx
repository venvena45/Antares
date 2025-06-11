import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import HeaderLogin from "./components/HeaderLogin";
import HeaderRegistrasi from "./components/HeaderRegistrasi";
import HeaderHome from "./components/HeaderHome";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile.jsx";

function App({ pathname, user, login, logout, setUser }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: product.quantity }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(
      cart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  let header;
  if (pathname === "/home") {
    header = user ? (
      <HeaderHome user={user} onLogout={logout} />
    ) : (
      <Navbar user={user} onLogout={logout} />
    );
  } else if (pathname === "/login") {
    header = <HeaderLogin />;
  } else if (pathname === "/register") {
    header = <HeaderRegistrasi />;
  } else {
    header = (
      <Navbar
        cartItemCount={cart.reduce((total, item) => total + item.quantity, 0)}
        user={user}
        onLogout={logout}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800">
      {header}

      <main className="flex-grow container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/products"
            element={<ProductList addToCart={addToCart} user={user} />}
          />
          <Route
            path="/products/:id"
            element={<ProductDetail addToCart={addToCart} user={user} />}
          />
          <Route
            path="/cart"
            element={
              <Cart
                cart={cart}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <Checkout cart={cart} user={user} clearCart={clearCart} />
            }
          />
          <Route path="/login" element={<Login onLogin={login} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={
              <Profile
                user={user}
                onUpdate={(updatedUserData) => {
                  setUser(updatedUserData);
                  localStorage.setItem("user", JSON.stringify(updatedUserData));
                }}
              />
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function AppWithRouter() {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <App
      pathname={location.pathname}
      user={user}
      login={login}
      logout={logout}
      setUser={setUser}
    />
  );
}

export default function RootApp() {
  return (
    <Router>
      <AppWithRouter />
    </Router>
  );
}
