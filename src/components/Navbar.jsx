import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaUser } from 'react-icons/fa';

function Navbar({ cartItemCount, user, onLogout }) {
  return (
    <nav style={{ backgroundColor: '#309898' }} className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <div className="text-2xl font-bold text-white">
        <Link to="/">Apotek Antares</Link>
      </div>
      <div className="flex items-center gap-6">
        <Link to="/" className="text-white font-medium hover:text-[#F4631E] transition">Home</Link>
        <Link to="/products" className="text-white font-medium hover:text-[#F4631E] transition">Produk</Link>
        <Link to="/cart" className="relative text-white hover:text-[#F4631E] transition">
          <FaShoppingCart size={20} />
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 text-xs rounded-full flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </Link>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-white">Hi, {user.name}</span>
            <button 
              onClick={onLogout} 
              className="bg-gray-100 px-3 py-1 rounded text-red-600 font-medium hover:bg-gray-200 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link to="/login" className="text-white font-medium hover:text-[#F4631E] transition">Login</Link>
            <Link to="/register" className="text-white font-medium hover:text-[#F4631E] transition">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
