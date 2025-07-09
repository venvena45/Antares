import React, { useEffect, useState } from "react";
import { getPesananByUserId, getDetailPesananById, getObatById } from "../services/api";

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
        const pesananUser = await getPesananByUserId(userId);

        const daftarLengkap = await Promise.all(
          pesananUser.map(async (pesanan) => {
            try {
              const detail = await getDetailPesananById(pesanan.pesanan_id);

              const detailWithObat = await Promise.all(
                detail.map(async (item) => {
                  if (!item.Obat && item.obat_id) {
                    try {
                      const obat = await getObatById(item.obat_id);
                      return { ...item, Obat: obat };
                    } catch {
                      return item;
                    }
                  }
                  return item;
                })
              );

              return { ...pesanan, DetailPesanans: detailWithObat };
            } catch {
              console.warn(`❗ Detail tidak ditemukan untuk pesanan ${pesanan.pesanan_id}`);
              return { ...pesanan, DetailPesanans: [] };
            }
          })
        );

        setDaftarPesanan(daftarLengkap);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat riwayat pesanan.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const formatDate = (dateString) => {
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };

    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  if (loading) return <p className="text-center mt-8">Memuat riwayat...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-6 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-3">
        Riwayat Pemesanan Anda
      </h2>
      {daftarPesanan.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          Tidak ada riwayat pemesanan yang ditemukan.
        </p>
      ) : (
        <div className="space-y-6">
          {daftarPesanan.map((pesanan) => (
            <div
              key={pesanan.pesanan_id}
              className="border border-gray-200 p-4 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-700">
                    ID Pesanan: #{pesanan.pesanan_id}
                  </p>
                  <p className="text-sm text-gray-500">
                    Tanggal: {formatDate(pesanan.tanggal_pesan)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    pesanan.status_pesanan === "selesai"
                      ? "bg-green-100 text-green-800"
                      : pesanan.status_pesanan === "diproses"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {pesanan.status_pesanan}
                </span>
              </div>

              <h4 className="font-semibold mb-2 text-gray-800">Detail Obat:</h4>
              <ul className="space-y-2 border-t pt-3">
                {pesanan.DetailPesanans && pesanan.DetailPesanans.length > 0 ? (
                  pesanan.DetailPesanans.map((item) => (
                    <li
                      key={item.detail_pesanan_id}
                      className="flex justify-between items-center text-sm"
                    >
                      <div>
                        <p className="font-semibold">
                          {item.Obat?.nama_obat || "Nama obat tidak tersedia"}
                        </p>
                        <p className="text-gray-600">
                          {item.jumlah} x Rp{" "}
                          {Number(item.Obat?.harga_satuan || 0).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="font-semibold">
                        Rp{" "}
                        {(item.jumlah * (item.Obat?.harga_satuan || 0)).toLocaleString("id-ID")}
                      </p>
                    </li>
                  ))
                ) : (
                  <li className="italic text-gray-500">
                    Detail obat tidak tersedia
                  </li>
                )}
              </ul>

              <div className="border-t mt-3 pt-3 flex flex-col items-end">
                <p className="text-sm text-gray-500 mb-1">
                  Termasuk biaya kirim sebesar Rp 10.000
                </p>
                <p className="font-bold text-lg text-gray-900">
                  Total Pesanan: Rp{" "}
                  {Number(pesanan.total_harga).toLocaleString("id-ID")}
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
