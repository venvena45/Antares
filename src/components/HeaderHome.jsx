import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const HeaderHome = ({ user, onLogout }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();

  // Tutup popup saat klik di luar menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header
      style={{ backgroundColor: "#309898" }}
      className="py-4 px-6 flex justify-between items-center relative"
    >
      {/* Isi kiri header */}
      <div></div>

      {/* Icon di kanan */}
      <div className="flex items-center space-x-6 relative">
        {/* Cart Icon */}
        <Link to="/cart" className="hover:scale-110 transition-transform">
          <img src="/Shopping cart.png" alt="Cart" className="w-6 h-6" />
        </Link>

        {/* Profile Icon dan Popup */}
        <div className="relative" ref={menuRef}>
          <img
            src="profile.png"
            alt="Profile"
            className="w-8 h-8 cursor-pointer rounded-full border border-white hover:scale-110 transition-transform"
            onClick={() => setShowMenu(!showMenu)}
          />

          {/* Popup Menu tanpa overlay blocking */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded shadow-lg border z-50">
              <div className="flex items-center p-4 border-b">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {user?.name || "Guest"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email || "guest@example.com"}
                  </p>
                </div>
              </div>

              <Link
                to="/akun"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowMenu(false)}
              >
                Akun Saya
              </Link>
              <Link
                to="/riwayat"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowMenu(false)}
              >
                Riwayat Pemesanan
              </Link>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onLogout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderHome;
