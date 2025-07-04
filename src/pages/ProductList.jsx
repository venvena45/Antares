import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getMedicines } from '../services/api';

function ProductList({ addToCart, user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: '',
    sort: 'name-asc',
  });
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getMedicines();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory = !filters.category || product.category === filters.category;
      const matchesSearch =
        !filters.search ||
        (product.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
         product.description?.toLowerCase().includes(filters.search.toLowerCase()));

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      const [field, direction] = filters.sort.split('-');

      if (field === 'name') {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return direction === 'asc'
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      } else if (field === 'price') {
        const priceA = a.price ?? 0;
        const priceB = b.price ?? 0;
        return direction === 'asc' ? priceA - priceB : priceB - priceA;
      }

      return 0;
    });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };

    if (showFilter) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Daftar Produk</h1>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <button
            onClick={() => setShowFilter((prev) => !prev)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-[#309898] hover:text-white transition"
            aria-label="Toggle filter options"
          >
            <img src="/filter-outline.png" alt="Filter" className="w-5 h-5 mr-2" />
            Filter
          </button>

          {showFilter && (
            <div
              ref={filterRef}
              className="absolute left-0 top-full mt-2 w-72 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50"
            >
              <div className="flex flex-col gap-4">
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#309898]"
                >
                    <option value="">Semua Kategori</option>
                    <option value="Obat Resep">Obat Resep</option>
                    <option value="Obat Bebas">Obat Bebas</option>
                    <option value="Vitamin & Suplemen">Vitamin & Suplemen</option>
                    <option value="Skincare">Skincare</option>
                </select>

                <select
                  name="sort"
                  value={filters.sort}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#309898]"
                >
                  <option value="name-asc">Nama (A-Z)</option>
                  <option value="name-desc">Nama (Z-A)</option>
                  <option value="price-asc">Harga (Rendah-Tinggi)</option>
                  <option value="price-desc">Harga (Tinggi-Rendah)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="relative flex-1">
          <input
            type="text"
            name="search"
            placeholder="Cari produk..."
            value={filters.search}
            onChange={handleFilterChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#309898]"
          />
          <img
            src="/search.png"
            alt="Search"
            className="absolute left-3 top-2.5 w-5 h-5 opacity-60 pointer-events-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center text-gray-500">Tidak ada produk yang ditemukan</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
              user={user}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductList;