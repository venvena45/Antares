import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaUser } from 'react-icons/fa';

function Navbar({ cartItemCount, user, onLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav style={{ backgroundColor: '#309898' }} className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <div className="text-2xl font-bold text-white">
        <Link to="/">Apotek Antares</Link>
      </div>
      <div className="flex items-center gap-6 relative">
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
          <div className="relative" ref={dropdownRef}>
            <button onClick={toggleDropdown} className="text-white hover:text-[#F4631E] transition">
              <FaUser size={20} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-2 z-50">
                <Link
                  to="/login"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
