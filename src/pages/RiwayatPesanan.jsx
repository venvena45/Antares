// src/pages/RiwayatPesanan.js

import React, { useEffect, useState } from "react";
import { getPesananByUserId } from "../services/api"; // Impor fungsi yang benar

function RiwayatPesanan() {
  const [daftarPesanan, setDaftarPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError("User ID tidak ditemukan. Silakan login kembali.");
        setLoading(false);
        return;
      }

      try {
        const data = await getPesananByUserId(userId);
        if (Array.isArray(data)) {
          setDaftarPesanan(data);
        } else {
          console.error("Format data tidak sesuai:", data);
          setError("Gagal memuat riwayat: format data tidak sesuai.");
        }
      } catch (err) {
        console.error(err);
        setError("Gagal memuat riwayat pesanan.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]); // Tambahkan userId sebagai dependency

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  if (loading) return <p className="text-center mt-8">Memuat riwayat...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-6 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-3">Riwayat Pemesanan Anda</h2>
      {daftarPesanan.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Tidak ada riwayat pemesanan yang ditemukan.</p>
      ) : (
        <div className="space-y-6">
          {daftarPesanan.map((pesanan) => (
            <div key={pesanan.pesanan_id} className="border border-gray-200 p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-700">
                    ID Pesanan: #{pesanan.pesanan_id}
                  </p>
                  <p className="text-sm text-gray-500">
                    Tanggal: {formatDate(pesanan.tanggal_pesanan)}
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  pesanan.status === 'Selesai' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {pesanan.status}
                </span>
              </div>
              
              <h4 className="font-semibold mb-2 text-gray-800">Detail Obat:</h4>
              <ul className="space-y-2 border-t pt-3">
                {pesanan.DetailPesanans && pesanan.DetailPesanans.map((item) => (
                  <li key={item.detail_pesanan_id} className="flex justify-between items-center text-sm">
                    <div>
                      {/* Asumsi: Relasi DetailPesanans ke Obat ada */}
                      <p className="font-semibold">{item.Obat.nama_obat}</p>
                      <p className="text-gray-600">{item.jumlah} x Rp {Number(item.harga_satuan).toLocaleString('id-ID')}</p>
                    </div>
                    <p className="font-semibold">Rp {(item.jumlah * item.harga_satuan).toLocaleString('id-ID')}</p>
                  </li>
                ))}
              </ul>
              <div className="border-t mt-3 pt-3 flex justify-end">
                  <p className="font-bold text-lg text-gray-900">
                    Total Pesanan: Rp {Number(pesanan.total_harga).toLocaleString('id-ID')}
                  </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RiwayatPesanan;