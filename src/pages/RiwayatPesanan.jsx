import React, { useEffect, useState } from "react";
import { getDetailPesananById } from "../services/api";

function RiwayatPesanan() {
  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError("User ID tidak ditemukan.");
        setLoading(false);
        return;
      }

      try {
        const data = await getDetailPesananById(userId);
        setPesanan(data);
      } catch (err) {
        setError("Gagal memuat riwayat.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Memuat riwayat...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-6 p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Riwayat Pemesanan Obat</h2>
      {pesanan.length === 0 ? (
        <p>Tidak ada riwayat pemesanan.</p>
      ) : (
        <ul className="space-y-4">
          {pesanan.map((item, index) => (
            <li key={index} className="border p-3 rounded">
              <p>
                <strong>Nama Obat:</strong> {item.nama_obat}
              </p>
              <p>
                <strong>Jumlah:</strong> {item.jumlah}
              </p>
              <p>
                <strong>Harga Satuan:</strong> Rp {item.harga}
              </p>
              <p>
                <strong>Total:</strong> Rp {item.harga * item.jumlah}
              </p>
              <p>
                <strong>Status:</strong> {item.status}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RiwayatPesanan;
