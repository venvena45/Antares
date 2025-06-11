import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMedicineById } from '../services/api';
import { FaCartPlus, FaArrowLeft } from 'react-icons/fa';

function ProductDetail({ addToCart, user }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getMedicineById(id);
        setProduct(data);
      } catch (error) {
        console.error(`Error fetching product with id ${id}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      alert('Silakan login terlebih dahulu untuk menambahkan ke keranjang.');
      return;
    }

    if (product) {
      const productWithQuantity = { ...product, quantity };
      addToCart(productWithQuantity);
      setQuantity(1);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center py-10 text-red-500">Produk tidak ditemukan</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Link to="/products" className="inline-flex items-center text-blue-600 hover:underline mb-4">
        <FaArrowLeft className="mr-2" /> Kembali ke Daftar Produk
      </Link>

      <div className="grid md:grid-cols-2 gap-8 bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-center">
          <img src={product.image} alt={product.name} className="w-full max-w-sm rounded-lg shadow" />
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-sm text-gray-600">{product.category}</p>
          <p className="text-xl text-green-600 font-semibold">Rp {product.price.toLocaleString()}</p>

          <div>
            <h3 className="font-semibold">Deskripsi</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>

          {product.dosage && (
            <div>
              <h3 className="font-semibold">Dosis</h3>
              <p className="text-gray-700">{product.dosage}</p>
            </div>
          )}

          {product.sideEffects && (
            <div>
              <h3 className="font-semibold">Efek Samping</h3>
              <p className="text-gray-700">{product.sideEffects}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold">Stok</h3>
            <p className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
              {product.stock > 0 ? `${product.stock} tersedia` : 'Stok Habis'}
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center border rounded overflow-hidden">
              <button
                onClick={() => setQuantity(prev => (prev > 1 ? prev - 1 : 1))}
                disabled={product.stock <= 0}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))
                }
                disabled={product.stock <= 0}
                className="w-16 text-center border-x px-2 py-1"
              />
              <button
                onClick={() => setQuantity(prev => (prev < product.stock ? prev + 1 : product.stock))}
                disabled={product.stock <= 0}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:bg-gray-400"
            >
              <FaCartPlus /> Tambahkan ke Keranjang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
