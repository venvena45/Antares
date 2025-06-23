import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; 

// --- Fungsi API Diletakkan di Sini untuk Mengatasi Masalah Impor ---
// Dalam aplikasi nyata, ini akan berada di file terpisah seperti 'services/api.js'
const getMedicineById = async (id) => {
  // Pastikan URL API sudah benar dan dapat diakses
  const response = await fetch(`https://antaresapi-production.up.railway.app/api/obat/${id}`);
  if (!response.ok) {
    // Memberikan pesan error yang lebih spesifik
    throw new Error(`Gagal mengambil data obat: ${response.statusText}`);
  }
  const item = await response.json();
  
  // Transformasi data agar sesuai dengan yang diharapkan komponen
  return {
    id: item.obat_id,
    name: item.nama_obat,
    description: item.deskripsi,
    dosis: item.dosis,
    price: parseInt(item.harga_satuan, 10),
    harga_grosir: parseInt(item.harga_grosir, 10),
    stock: parseInt(item.stok, 10),
    kategori: item.kategori || "Tidak ada kategori", // Fallback jika kategori null
    foto: item.foto,
    satuan: item.satuan,
  };
};


// --- Komponen Ikon SVG untuk Menggantikan react-icons ---
const FaArrowLeft = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 448 512"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z"></path>
  </svg>
);

const FaCartPlus = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 576 512"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M528.12 301.319l47.273-208C578.806 78.301 567.391 64 551.99 64H159.99c-15.391 0-26.806 14.301-23.273 29.319L168.1 144h240l-22.067 96.933c-3.163 13.84-16.521 23.067-30.933 23.067H210.421l-15.104 66.458c-3.693 16.299 8.251 31.542 24.685 31.542h224c15.391 0 26.806-14.301 23.273-29.319L528.12 301.319zM256 496c26.51 0 48-21.49 48-48s-21.49-48-48-48-48 21.49-48 48 21.49 48 48 48zm128-48c0 26.51 21.49 48 48 48s48-21.49 48-48-21.49-48-48-48-48 21.49-48 48zm-114.89-283.319L128 32H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h38.686c-3.486-10.154-5.686-20.943-5.686-32 0-35.346 28.654-64 64-64 11.056 0 21.456 2.801 30.274 7.721z"></path>
  </svg>
);

function ProductDetail({ addToCart, user }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getMedicineById(id);
        setProduct(data);
      } catch (error) {
        console.error(`Error fetching product with id ${id}:`, error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    const itemToCart = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      wholesalePrice: product.harga_grosir,
      stock: product.stock,
      unit: product.satuan,
      image: product.foto,
      quantity: quantity,
    };

    addToCart(itemToCart);
    // Contoh notifikasi sederhana
    alert(`${quantity} ${product.name} telah ditambahkan ke keranjang!`);
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Memuat data produk...</div>;
  }

  if (!product) {
    return (
      <div className="text-center py-10 text-red-500">
        <p className="text-xl font-semibold">Produk tidak ditemukan</p>
        <p>Gagal mengambil data atau produk tidak ada.</p>
        <Link
          to="/products"
          className="mt-4 inline-flex items-center text-blue-600 hover:underline"
        >
          <FaArrowLeft /> <span className="ml-2">Kembali ke Daftar Produk</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 font-sans">
      <Link
        to="/products"
        className="inline-flex items-center text-blue-600 hover:underline mb-4"
      >
        <FaArrowLeft /> <span className="ml-2">Kembali ke Daftar Produk</span>
      </Link>

      <div className="grid md:grid-cols-2 gap-8 bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-center items-center">
          <img
            src={product.foto}
            alt={product.name}
            className="w-full max-w-sm h-auto object-cover rounded-lg shadow-md border"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/400x400/EEE/31343C?text=Gambar+Tidak+Tersedia";
            }}
          />
        </div>

        <div className="flex flex-col justify-center space-y-4">
          <p className="text-sm text-gray-500 uppercase">{product.kategori}</p>
          <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
          
          <p className="text-2xl text-green-600 font-semibold">
            Rp {typeof product.price === 'number' ? product.price.toLocaleString('id-ID') : 'N/A'}
          </p>

          <div>
            <h3 className="font-semibold text-gray-700 border-b pb-1 mb-2">Deskripsi</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>

          {product.dosis && (
            <div>
              <h3 className="font-semibold text-gray-700 border-b pb-1 mb-2">Dosis</h3>
              <p className="text-gray-600">{product.dosis}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-700">Ketersediaan</h3>
            <p
              className={`font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}
            >
              {product.stock > 0 ? `Tersedia (${product.stock} ${product.satuan})` : "Stok Habis"}
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex items-center border rounded-md overflow-hidden">
              <button
                onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
                disabled={product.stock <= 0}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (isNaN(val)) {
                    setQuantity(1);
                  } else {
                    setQuantity(Math.min(product.stock, Math.max(1, val)));
                  }
                }}
                disabled={product.stock <= 0}
                className="w-16 text-center border-x px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() =>
                  setQuantity((prev) =>
                    prev < product.stock ? prev + 1 : product.stock
                  )
                }
                disabled={quantity >= product.stock || product.stock <= 0}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="flex-grow flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
            >
              <FaCartPlus /> <span>Tambahkan ke Keranjang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
