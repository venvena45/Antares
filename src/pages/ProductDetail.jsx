// ProductDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

// Ikon SVG
const FaArrowLeft = () => (
  <svg fill="currentColor" viewBox="0 0 448 512" className="w-5 h-5">
    <path d="M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z" />
  </svg>
);

const FaCartPlus = () => (
  <svg fill="currentColor" viewBox="0 0 576 512" className="w-5 h-5">
    <path d="M528.1 301.3l47.3-208C578.8 78.3 567.4 64 552 64H160c-15.4 0-26.8 14.3-23.3 29.3L168.1 144h240l-22.1 96.9c-3.2 13.8-16.5 23.1-30.9 23.1H210.4l-15.1 66.5c-3.7 16.3 8.2 31.5 24.7 31.5h224c15.4 0 26.8-14.3 23.3-29.3L528.1 301.3zM256 496c26.5 0 48-21.5 48-48s-21.5-48-48-48-48 21.5-48 48 21.5 48 48 48zm128-48c0 26.5 21.5 48 48 48s48-21.5 48-48-21.5-48-48-48-48 21.5-48 48z" />
  </svg>
);

// Ambil data obat dari API
const getMedicineById = async (id) => {
  const res = await fetch(`https://antaresapi-production-006d.up.railway.app/api/obat/${id}`);
  if (!res.ok) throw new Error("Gagal ambil data obat");
  const data = await res.json();
  return {
    id: data.obat_id,
    name: data.nama_obat || "Nama tidak tersedia",
    price: parseInt(data.harga_satuan || "0"),
    stock: parseInt(data.stok || "0"),
    foto: data.foto,
    satuan: data.satuan,
    deskripsi: data.deskripsi || "-",
    komposisi: data.komposisi || "-",
    kemasan: data.kemasan || "-",
    manfaat: data.manfaat || "-",
    kategori: data.kategori || "-",
    dosis: data.dosis || "-",
    penyajian: data.penyajian || "-",
    cara_penyimpanan: data.cara_penyimpanan || "-",
    perhatian: data.perhatian || "-",
    efek_samping: data.efek_samping || "-",
    nama_standar_mims: data.nama_standar_mims || "-",
    nomor_izin_edar: data.nomor_izin_edar || "-",
    golongan_obat: data.golongan_obat || "-",
    keterangan: data.keterangan || null,
    referensi: data.referensi || "-",
  };
};

// Komponen reusable untuk detail section
const DetailSection = ({ title, content }) => content && (
  <div>
    <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
    <p className="text-gray-600 whitespace-pre-wrap text-sm">{content}</p>
  </div>
);

const InfoRow = ({ label, value, pill }) => (
  <div className="flex justify-between text-sm text-gray-700">
    <span className="font-medium">{label}</span>
    <span className={pill ? "bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs" : "text-gray-600"}>
      {value}
    </span>
  </div>
);

function ProductDetail({ addToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMedicineById(id);
        setProduct(res);
      } catch (e) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      unit: product.satuan,
      image: product.foto,
      quantity,
    });
    alert(`${quantity} ${product.name} telah ditambahkan ke keranjang.`);
  };

  if (loading)
    return <div className="text-center py-10 text-gray-500">Memuat data produk...</div>;

  if (!product) {
    return (
      <div className="text-center py-10 text-red-500">
        <p className="text-xl font-semibold">Produk tidak ditemukan</p>
        <Link to="/products" className="inline-flex items-center mt-4 text-blue-600 hover:underline">
          <FaArrowLeft /> <span className="ml-2">Kembali ke Produk</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Link to="/products" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <FaArrowLeft /> <span className="ml-2">Kembali ke Produk</span>
      </Link>

      <div className="grid md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl shadow-lg">
        <img
          src={product.foto}
          onError={(e) => (e.target.src = "https://placehold.co/400x400?text=Gambar+Tidak+Tersedia")}
          alt={product.name}
          className="w-full h-[400px] object-cover rounded-xl border shadow"
        />

        <div className="flex flex-col justify-between space-y-4">
          <div>
            <p className="text-sm uppercase text-gray-400">{product.kategori}</p>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <p className="text-2xl text-green-600 font-semibold mb-1">Rp {product.price.toLocaleString("id-ID")}</p>
            <p className={`font-medium ${product.stock > 0 ? "text-green-500" : "text-red-500"}`}>
              {product.stock > 0 ? `Tersedia (${product.stock} ${product.satuan})` : "Stok habis"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex items-center border rounded-md overflow-hidden shadow-sm">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={product.stock <= 0}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300">-</button>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (isNaN(val)) setQuantity(1);
                  else setQuantity(Math.min(product.stock, Math.max(1, val)));
                }}
                className="w-16 text-center border-x outline-none"
              />
              <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={product.stock <= 0}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300">+</button>
            </div>
            <button
              onClick={handleAdd}
              disabled={product.stock <= 0}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-transform hover:scale-105 disabled:bg-gray-400">
              <FaCartPlus /> <span>Tambah ke Keranjang</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 bg-white p-6 rounded-2xl shadow-md space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Detail Produk</h2>
        <DetailSection title="Deskripsi" content={product.deskripsi} />
        <DetailSection title="Manfaat" content={product.manfaat} />
        <DetailSection title="Komposisi" content={product.komposisi} />
        <DetailSection title="Dosis" content={product.dosis} />
        <DetailSection title="Penyajian" content={product.penyajian} />
        <DetailSection title="Kemasan" content={product.kemasan} />
        <DetailSection title="Penyimpanan" content={product.cara_penyimpanan} />
        <DetailSection title="Perhatian" content={product.perhatian} />
        <DetailSection title="Efek Samping" content={product.efek_samping} />

        <div className="pt-4 mt-4 space-y-3 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">Informasi Tambahan</h3>
          <InfoRow label="Nama Standar MIMS" value={product.nama_standar_mims} />
          <InfoRow label="Nomor Izin Edar" value={product.nomor_izin_edar} />
          <InfoRow label="Golongan Obat" value={product.golongan_obat} pill />
          {product.keterangan && <InfoRow label="Keterangan" value={product.keterangan} />}
        </div>

        <DetailSection title="Referensi" content={product.referensi} />
      </div>
    </div>
  );
}

export default ProductDetail;
