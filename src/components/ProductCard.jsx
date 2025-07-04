import React from 'react';
import { Link } from 'react-router-dom';
import { FaCartPlus } from 'react-icons/fa';

function ProductCard({ product, addToCart, user }) {
  const handleAddToCart = () => {
    if (!user) {
      alert('Silakan login terlebih dahulu untuk menambahkan ke keranjang.');
      return;
    }
    addToCart(product);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden transition-transform hover:scale-105">
      <img 
        src={product.image} 
        alt={product.name} 
        className="w-full h-48 object-cover" 
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://placehold.co/400x400/EEE/31343C?text=Gambar+Tidak+Tersedia";
        }}
      />
      <div className="p-4 space-y-2">
        {/* Kategori sebagai badge seperti di ProductDetail */}
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          {product.category || 'Tanpa Kategori'}
        </span>

        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>

        <p className="text-md font-bold text-green-600">
          Rp {Number(product.price).toLocaleString("id-ID")}
        </p>

        <div className="flex justify-between items-center mt-3">
          <Link 
            to={`/products/${product.id}`} 
            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition"
          >
            Detail
          </Link>
          <button 
            className="flex items-center gap-1 text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition" 
            onClick={handleAddToCart}
          >
            <FaCartPlus /> Tambah
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
