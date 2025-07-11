import React, { useEffect, useState } from "react";
import {
  getPesananByUserId,
  getDetailPesananById,
  getObatById,
} from "../services/api";

function RiwayatPesanan() {
  const [daftarPesanan, setDaftarPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("diproses");

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
                      return {
                        ...item,
                        Obat: {
                          ...obat,
                          gambar: obat.foto, 
                        },
                      };
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

  const filterByStatus = (status) => {
    return daftarPesanan.filter((p) => p.status_pesanan === status);
  };

  const statusLabels = {
    diproses: "Diproses",
    dikirim: "Dikirim",
    selesai: "Selesai",
  };

  const statusColors = {
    diproses: "bg-yellow-100 text-yellow-800",
    dikirim: "bg-blue-100 text-blue-800",
    selesai: "bg-green-100 text-green-800",
  };

  if (loading) return <p className="text-center mt-8">Memuat riwayat...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto mt-6 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-3">
        Riwayat Pemesanan Anda
      </h2>

      <div className="flex gap-4 mb-6">
        {Object.keys(statusLabels).map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`px-4 py-2 rounded-full font-semibold border ${
              activeTab === status
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {statusLabels[status]}
          </button>
        ))}
      </div>

      {filterByStatus(activeTab).length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          Tidak ada pesanan dengan status {statusLabels[activeTab]}.
        </p>
      ) : (
        <div className="space-y-6">
          {filterByStatus(activeTab).map((pesanan) => (
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
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[pesanan.status_pesanan]}`}
                >
                  {pesanan.status_pesanan}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed text-sm bg-white shadow-sm rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="w-[100px] px-6 py-3 text-left font-medium">Gambar</th>
                      <th className="w-1/2 px-6 py-3 text-left font-medium">Nama Obat</th>
                      <th className="w-1/6 px-6 py-3 text-center font-medium">Jumlah</th>
                      <th className="w-1/6 px-6 py-3 text-right font-medium">Harga Satuan</th>
                      <th className="w-1/6 px-6 py-3 text-right font-medium">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800 divide-y divide-gray-200">
                    {pesanan.DetailPesanans?.length > 0 ? (
                      pesanan.DetailPesanans.map((item) => (
                        <tr key={item.detail_pesanan_id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-3">
                              {item.Obat?.gambar ? (
                                <div className="relative w-16 h-16">
                                  <img
                                    src={item.Obat.gambar}
                                    alt={item.Obat.nama_obat}
                                    className="w-full h-full object-cover rounded-xl shadow-md border border-gray-300 hover:scale-105 hover:shadow-lg transition-transform duration-300 ease-in-out"
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 text-gray-400 rounded-xl border">
                                  <span className="text-xs text-center">Tidak ada gambar</span>
                                </div>
                              )}
                            </td>

                          <td className="px-6 py-3">{item.Obat?.nama_obat || "Tidak tersedia"}</td>
                          <td className="px-6 py-3 text-center">{item.jumlah}</td>
                          <td className="px-6 py-3 text-right">
                            Rp {Number(item.Obat?.harga_satuan || 0).toLocaleString("id-ID")}
                          </td>
                          <td className="px-6 py-3 text-right">
                            Rp {(item.jumlah * (item.Obat?.harga_satuan || 0)).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-6 py-4 italic text-gray-500 text-center" colSpan="5">
                          Detail obat tidak tersedia
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 flex flex-col items-end">
                <p className="text-sm text-gray-500 mb-1">
                  Termasuk biaya kirim sebesar Rp 10.000
                </p>
                <p className="font-bold text-lg text-gray-900">
                  Total Pesanan: Rp {Number(pesanan.total_harga).toLocaleString("id-ID")}
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
