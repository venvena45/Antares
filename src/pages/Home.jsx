import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPills, FaStethoscope, FaTruck } from 'react-icons/fa';
import HeaderHome from '../components/HeaderHome';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/obat`;

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [fadeGroup, setFadeGroup] = useState(true);

  const categories = [
    { id: "obat-resep", name: "Obat Resep", value: "Obat Resep" },
    { id: "obat-bebas", name: "Obat Bebas", value: "Obat Bebas" },
    { id: "vitamin-suplemen", name: "Vitamin & Suplemen", value: "Vitamin & Suplemen" },
    { id: "perawatan-pribadi", name: "Perawatan Pribadi", value: "Perawatan Pribadi" }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Gagal mengambil data produk');

        const data = await response.json();
        const mappedProducts = data.map(item => ({
          id: item.obat_id,
          name: item.nama_obat,
          description: item.deskripsi,
          price: parseInt(item.harga_satuan) || 0,
          stock: parseInt(item.stok) || 0,
          category: item.kategori,
          image: item.foto || '/api/placeholder/200/200',
          dosis: item.dosis
        }));

        setFeaturedProducts(mappedProducts);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = featuredProducts.filter(product =>
        product.category === selectedCategory.value
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [selectedCategory, featuredProducts]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleResetFilter = () => {
    setSelectedCategory(null);
  };

  // Bagi produk dalam grup 3 item
  const groupedProducts = [];
  for (let i = 0; i < featuredProducts.length; i += 3) {
    groupedProducts.push(featuredProducts.slice(i, i + 3));
  }

  // Slideshow otomatis
  useEffect(() => {
    if (groupedProducts.length === 0) return;

    const interval = setInterval(() => {
      setFadeGroup(false); // Fade out

      setTimeout(() => {
        setCurrentGroupIndex((prevIndex) =>
          (prevIndex + 1) % groupedProducts.length
        );
        setFadeGroup(true); // Fade in
      }, 300); // delay sebelum fade in
    }, 4000); // setiap 4 detik

    return () => clearInterval(interval);
  }, [groupedProducts]);

  return (
    <div className="px-4 py-10 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Selamat Datang di Apotek Antares</h1>
        <p className="text-lg text-gray-600 mb-6">Kesehatan Anda adalah prioritas kami</p>
        <Link to="/products" className="inline-block bg-[#F4631E] text-white px-6 py-3 rounded-xl shadow transition">
          Lihat Produk
        </Link>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-20">
        <div className="text-center bg-white shadow-lg p-6 rounded-xl">
          <FaPills className="text-blue-600 text-4xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Produk Berkualitas</h3>
          <p className="text-gray-600">Semua obat dan produk kesehatan kami terjamin kualitasnya</p>
        </div>
        <div className="text-center bg-white shadow-lg p-6 rounded-xl">
          <FaStethoscope className="text-blue-600 text-4xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Konsultasi Gratis</h3>
          <p className="text-gray-600">Konsultasikan kebutuhan kesehatan Anda dengan apoteker kami</p>
        </div>
        <div className="text-center bg-white shadow-lg p-6 rounded-xl">
          <FaTruck className="text-blue-600 text-4xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Pengiriman Cepat</h3>
          <p className="text-gray-600">Kami mengantar pesanan Anda dengan cepat dan aman</p>
        </div>
      </div>

      {/* Categories Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Kategori Produk</h2>
        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6">
          {categories.map(category => (
            <div
              key={category.id}
              className={`bg-white shadow-md rounded-xl p-6 text-center cursor-pointer hover:shadow-lg transition ${selectedCategory?.id === category.id ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => handleCategoryClick(category)}
            >
              <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
              <button className="text-blue-600 hover:underline">
                Lihat Semua
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Filtered Products */}
      {selectedCategory && (
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Produk {selectedCategory.name}</h2>
            <button onClick={handleResetFilter} className="text-blue-600 hover:underline flex items-center">
              Kembali ke Semua Kategori
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-10">
              <p>Memuat produk...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white shadow-md rounded-xl overflow-hidden">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="font-bold text-lg">Rp {product.price.toLocaleString()}</span>
                      <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock > 0 ? `Stok: ${product.stock}` : 'Habis'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-xl">
              <p className="text-gray-600">Tidak ada produk dalam kategori ini.</p>
            </div>
          )}
        </div>
      )}

      {/* Produk Terlaris - Fade Slider */}
      {!selectedCategory && featuredProducts.length > 0 && (
        <div className="mb-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Produk Terlaris</h2>

          <div className="relative w-full mx-auto min-h-[420px]">
            <div
              key={currentGroupIndex}
              className={`absolute inset-0 transition-opacity duration-500 ${
                fadeGroup ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
                {groupedProducts[currentGroupIndex].map(product => (
                  <div key={product.id} className="bg-white shadow-md rounded-xl overflow-hidden">
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="font-bold text-lg">Rp {product.price.toLocaleString()}</span>
                        <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.stock > 0 ? `Stok: ${product.stock}` : 'Habis'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
