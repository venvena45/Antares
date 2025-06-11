import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser } from 'react-icons/fa';

function Navbar({ cartItemCount, user, onLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const guestDropdownRef = useRef(null);
  const navigate = useNavigate(); // digunakan untuk redirect

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (user) {
        if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
          setIsDropdownOpen(false);
        }
      } else {
        if (guestDropdownRef.current && !guestDropdownRef.current.contains(event.target)) {
          setIsDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [user]);

  return (
    <nav style={{ backgroundColor: '#309898' }} className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <div className="text-2xl font-bold text-white">
        <Link to="/">Apotek Antares</Link>
      </div>
      <div className="flex items-center gap-6 relative">
        <Link to="/" className="text-white font-medium hover:text-[#F4631E] transition">Home</Link>
        <Link to="/products" className="text-white font-medium hover:text-[#F4631E] transition">Produk</Link>

        {user && (
          <Link to="/cart" className="relative text-white hover:text-[#F4631E] transition">
            <FaShoppingCart size={20} />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 text-xs rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
        )}

        {user ? (
          <div className="relative" ref={userDropdownRef}>
            <button onClick={toggleDropdown} className="text-white hover:text-[#F4631E] transition flex items-center gap-2">
              <FaUser size={20} />
              <span>{user.name}</span>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-2 z-50">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/riwayat"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Riwayat
                </Link>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onLogout();      // logout user
                    navigate('/');  // redirect ke halaman awal
                  }}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="relative" ref={guestDropdownRef}>
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
