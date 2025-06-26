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
import LoginAlert from "./components/LoginAlert";

import RiwayatPesanan from "./pages/RiwayatPesanan";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile.jsx";

function App({ pathname, user, login, logout, setUser }) {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Sinkronisasi antar tab browser
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "cart") {
        setCart(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: product.quantity || 1 }]);
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
      cart.map((item) => (item.id === productId ? { ...item, quantity } : item))
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
      <LoginAlert user={user} />

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
          <Route path="/riwayat" element={<RiwayatPesanan />} />

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
            element={<Checkout cart={cart} user={user} clearCart={clearCart} />}
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

  const SESSION_TIMEOUT_MINUTES = 2;

  const login = (userData) => {
    setUser(userData);

    const userId = userData.user?.user_id;
    localStorage.setItem("userId", userId);
    localStorage.setItem("token", "session-token");
    localStorage.setItem("tokenTimestamp", Date.now());

    let jsonString = JSON.stringify(userData, null, 2);
    jsonString = jsonString
      .replace(/"user_id":\s*\d+,?\n?/g, "")
      .replace(/"role":\s*".*?",?\n?/g, "")
      .replace(/,\n\s*}$/, "\n}");

    localStorage.setItem("user", jsonString);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("tokenTimestamp");
    localStorage.removeItem("userId");
    localStorage.removeItem("userVisual");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    const tokenTimestamp = localStorage.getItem("tokenTimestamp");

    if (token && tokenTimestamp) {
      const now = Date.now();
      const timeoutMs = SESSION_TIMEOUT_MINUTES * 60 * 1000;
      const elapsed = now - Number(tokenTimestamp);

      if (elapsed < timeoutMs) {
        if (savedUser) setUser(JSON.parse(savedUser));
      } else {
        logout();
      }
    } else {
      logout();
    }
  }, []);

  useEffect(() => {
    const updateActivity = () => {
      if (localStorage.getItem("token")) {
        localStorage.setItem("tokenTimestamp", Date.now());
      }
    };

    window.addEventListener("click", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("scroll", updateActivity);

    return () => {
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("scroll", updateActivity);
    };
  }, []);

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
