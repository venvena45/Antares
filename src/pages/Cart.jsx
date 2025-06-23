// src/pages/Cart.js - Updated Version

import React from "react";
import { Link } from "react-router-dom";
import { FaTrash, FaArrowRight, FaMinus, FaPlus } from "react-icons/fa";

function Cart({ cart, updateQuantity, removeFromCart, clearCart }) {
  // Hitung total harga dari item di keranjang
  const totalPrice = cart.reduce(
    (total, item) => total + (item.price ?? 0) * (item.quantity ?? 0),
    0
  );

  // Hitung total items
  const totalItems = cart.reduce((total, item) => total + (item.quantity ?? 0), 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center min-h-screen flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-3xl font-semibold mb-4">Keranjang Belanja</h1>
        <p className="text-gray-600 mb-6">Keranjang belanja Anda kosong.</p>
        <Link
          to="/products"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Keranjang Belanja</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-800 text-sm underline"
        >
          Hapus Semua
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daftar Item Keranjang */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 border rounded-lg p-4 shadow-sm bg-white"
            >
              {/* Gambar Produk */}
              <div className="flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded border"
                  onError={(e) => {
                    e.target.src = '/placeholder-medicine.png'; // fallback image
                  }}
                />
              </div>

              {/* Info Produk */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-800 truncate">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {item.category || 'Obat'}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-lg font-bold text-green-600">
                    Rp {(item.price ?? 0).toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">
                    per unit
                  </span>
                </div>
              </div>

              {/* Kontrol Quantity */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.id, (item.quantity ?? 1) - 1)}
                    className="p-2 text-gray-600 bg-gray-50 hover:bg-gray-100 transition disabled:opacity-50"
                    disabled={(item.quantity ?? 1) <= 1}
                    title="Kurangi"
                  >
                    <FaMinus size={12} />
                  </button>
                  
                  <div className="px-4 py-2 min-w-[50px] text-center font-semibold">
                    {item.quantity ?? 1}
                  </div>
                  
                  <button
                    onClick={() => updateQuantity(item.id, (item.quantity ?? 1) + 1)}
                    className="p-2 text-gray-600 bg-gray-50 hover:bg-gray-100 transition disabled:opacity-50"
                    disabled={(item.quantity ?? 1) >= (item.stock ?? Infinity)}
                    title="Tambah"
                  >
                    <FaPlus size={12} />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700">
                    Rp {((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    subtotal
                  </p>
                </div>

                {/* Tombol Hapus */}
                <button
                  onClick={() => {
                    if (window.confirm(`Hapus ${item.name} dari keranjang?`)) {
                      removeFromCart(item.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition"
                  title="Hapus dari keranjang"
                >
                  <FaTrash size={14} />
                </button>

                {/* Stock warning */}
                {item.stock && item.quantity >= item.stock && (
                  <p className="text-xs text-orange-600">
                    Stok terbatas
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Ringkasan Belanja */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Ringkasan Belanja
          </h2>
          
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Item:</span>
              <span className="font-semibold">{totalItems} items</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">Rp {totalPrice.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ongkos Kirim:</span>
              <span className="text-green-600">Gratis</span>
            </div>
            
            <hr className="border-gray-300" />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total Harga:</span>
              <span className="text-green-600">Rp {totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="space-y-3">
            <Link
              to="/checkout"
              className="flex items-center justify-center w-full bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Lanjutkan ke Pembayaran
              <FaArrowRight className="ml-2" />
            </Link>
            
            <Link
              to="/products"
              className="block w-full text-center text-blue-600 hover:text-blue-800 hover:underline py-2 transition"
            >
              Lanjutkan Belanja
            </Link>
          </div>

          {/* Info Tambahan */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>💊 Konsultasi gratis dengan apoteker</p>
            <p>🚚 Pengiriman cepat & aman</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;