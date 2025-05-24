import React from 'react';
import { Link } from 'react-router-dom';
import { FaCartPlus } from 'react-icons/fa';

function ProductCard({ product, addToCart }) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden transition-transform hover:scale-105">
      <img 
        src={product.image} 
        alt={product.name} 
        className="w-full h-48 object-cover" 
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="text-sm text-gray-500">{product.category}</p>
        <p className="text-md font-bold text-green-600 mt-1">
          Rp {product.price.toLocaleString()}
        </p>
        <div className="flex justify-between items-center mt-4">
          <Link 
            to={`/products/${product.id}`} 
            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition"
          >
            Detail
          </Link>
          <button 
            className="flex items-center gap-1 text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition" 
            onClick={() => addToCart(product)}
          >
            <FaCartPlus /> Tambah
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
