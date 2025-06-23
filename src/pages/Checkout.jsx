import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// --- Komponen Ikon SVG (Tidak berubah) ---
const FaCheckCircle = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"></path></svg>
);
const FaEdit = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.2 15.2-39.9 0-55.2z"></path></svg>
);

// --- Konstanta API ---
const API_BASE_URL = "https://antaresapi-production.up.railway.app/api";

// --- Fungsi-fungsi API dengan Penanganan Error ---

/**
 * Membuat pesanan baru.
 * @param {object} orderData - Data utama pesanan.
 * @returns {Promise<object>} Respons dari server.
 */
const createOrder = async (orderData) => {
  const response = await fetch(`${API_BASE_URL}/pesanan/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

/**
 * Membuat catatan detail untuk sebuah pesanan.
 * @param {object} detailData - Data detail pesanan.
 * @returns {Promise<object>} Respons dari server.
 */
const createOrderDetail = async (detailData) => {
  const response = await fetch(`${API_BASE_URL}/detail-pesanan/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(detailData),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal menyimpan detail pesanan. Status: ${response.status}, Pesan: ${errorText}`);
  }
  return await response.json();
};

/**
 * Mengambil data lengkap satu obat berdasarkan ID-nya.
 * @param {number} id - ID dari obat.
 * @returns {Promise<object>} Data lengkap obat.
 */
const getObatById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/obat/${id}`);
  if (!response.ok) {
    throw new Error(`Gagal mendapatkan data untuk obat ID ${id}`);
  }
  return await response.json();
};

/**
 * Memperbarui data sebuah obat.
 * @param {number} id - ID dari obat yang akan diperbarui.
 * @param {object} data - Objek data lengkap untuk obat.
 * @returns {Promise<object>} Respons dari server.
 */
const updateObat = async (id, data) => {
  console.log(`Mengirim update LENGKAP untuk obat ID ${id}:`, data);
  const response = await fetch(`${API_BASE_URL}/obat/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal update stok untuk obat ID ${id}. Status: ${response.status}. Pesan: ${errorText}`);
  }
  return await response.json();
};

/**
 * Komponen Checkout untuk menangani langkah terakhir dari sebuah pesanan.
 * @param {{cart: Array<object>, clearCart: Function}} props - Props komponen.
 */
function Checkout({ cart, clearCart }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "",
    city: "", postalCode: "", paymentMethod: "transfer",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const shippingFee = 10000;

  useEffect(() => {
    try {
      const userRaw = localStorage.getItem("user");
      const userIdRaw = localStorage.getItem("userId");
      if (!userRaw || !userIdRaw) {
        navigate("/login");
        return;
      }

      const userDetails = JSON.parse(userRaw);
      const finalUserObject = userDetails.user || userDetails.data || userDetails;
      finalUserObject.id = parseInt(userIdRaw, 10);
      if (isNaN(finalUserObject.id)) {
        throw new Error("User ID tidak valid.");
      }
      
      setUserData(finalUserObject);
      setFormData((prev) => ({
        ...prev,
        name: finalUserObject.nama || "",
        email: finalUserObject.email || "",
        phone: finalUserObject.no_telepon || "",
        address: finalUserObject.alamat || "",
        city: finalUserObject.kota || "",
        postalCode: finalUserObject.kode_pos || "",
      }));
    } catch (error) {
      console.error("Gagal memproses data pengguna:", error);
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (cart.length === 0 && !isOrderComplete) {
      navigate("/cart");
    }
  }, [cart, isOrderComplete, navigate]);

  const totalPrice = cart.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0);
  const totalWithShipping = totalPrice + shippingFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Nama harus diisi";
    if (!formData.email.trim()) newErrors.email = "Email harus diisi";
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Format email tidak valid";
    if (!formData.phone.trim()) newErrors.phone = "Nomor telepon harus diisi";
    if (!formData.address.trim()) newErrors.address = "Alamat harus diisi";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    if (!userData || !userData.id) {
      alert("Data pelanggan tidak ditemukan.");
      return;
    }

    setIsSubmitting(true);
    
    const pesananData = {
      pelanggan_id: userData.id,
      tanggal_pesan: new Date().toISOString().split("T")[0],
      total_harga: totalWithShipping,
      status_pesanan: "diproses",
      metode_pembayaran: formData.paymentMethod,
      alamat_pengiriman: `${formData.address}, ${formData.city}, ${formData.postalCode}`,
    };

    try {
      const mainOrderResponse = await createOrder(pesananData);
      const orderId = mainOrderResponse.pesanan_id || mainOrderResponse.id;
      
      if (orderId) {
        setCompletedOrderId(orderId);

        // Loop untuk menyimpan detail pesanan
        console.log(`Pesanan utama dibuat dengan ID: ${orderId}. Menyimpan detail item...`);
        for (const item of cart) {
          try {
            const detailData = {
              pesanan_id: orderId,
              obat_id: item.id, // ID dari obat
              jumlah: item.quantity,
              subtotal: (item.price || 0) * (item.quantity || 0),
            };
            await createOrderDetail(detailData);
          } catch (err) {
            console.error(`Gagal menyimpan detail untuk obat ID ${item.id}:`, err);
            // Lanjutkan proses meskipun satu item gagal
          }
        }
        
        // Loop untuk memperbarui stok menggunakan strategi 'GET-then-PUT'
        console.log("Memulai proses update stok dengan strategi 'GET-then-PUT'...");
        for (const item of cart) {
          try {
            // LANGKAH 1: Ambil data obat yang lengkap dari server
            console.log(`Mengambil data lengkap untuk obat ID ${item.id}...`);
            const obatLengkap = await getObatById(item.id);
            
            // LANGKAH 2: Hitung stok baru
            const stokBaru = obatLengkap.stok - item.quantity;

            // LANGKAH 3: Buat payload LENGKAP untuk dikirim kembali
            const dataUntukUpdate = {
                nama_obat: obatLengkap.nama_obat,
                deskripsi: obatLengkap.deskripsi,
                dosis: obatLengkap.dosis,
                harga_satuan: obatLengkap.harga_satuan,
                harga_grosir: obatLengkap.harga_grosir,
                stok: stokBaru, // Nilai stok yang baru
                satuan: obatLengkap.satuan,
                foto: obatLengkap.foto,
                kategori: obatLengkap.kategori,
            };

            // LANGKAH 4: Kirim data LENGKAP untuk update
            await updateObat(item.id, dataUntukUpdate);

            console.log(`Stok untuk obat ID ${item.id} berhasil diupdate menjadi ${stokBaru}`);
          } catch (err) {
            // Error dari updateObat atau getObatById akan ditangkap di sini
            console.error(err.message);
            // Anda bisa memutuskan untuk menghentikan proses atau melanjutkan
          }
        }
        
        // Selesaikan proses checkout
        setIsOrderComplete(true);
        clearCart();
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
          navigate("/");
        }, 5000);

      } else {
        throw new Error(`Respons dari API pesanan tidak berisi ID yang valid. Respons: ${JSON.stringify(mainOrderResponse)}`);
      }
    } catch (error) {
      console.error("Terjadi kesalahan saat memproses pesanan:", error.message);
      alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userData) {
    return <div className="text-center py-10">Memuat data...</div>;
  }
  if (isOrderComplete) {
    return (
      <div className="max-w-2xl mx-auto text-center py-10">
        <div className="flex justify-center text-green-500 text-5xl mx-auto mb-4"><FaCheckCircle /></div>
        <h1 className="text-2xl font-bold mb-2">Pesanan Berhasil!</h1>
        <p className="text-gray-600 mb-1">Terima kasih, pesanan Anda sedang kami proses.</p>
        <p className="text-gray-700 font-medium">Nomor ID Pesanan Anda: <strong>{completedOrderId}</strong></p>
        <p className="text-sm text-gray-500 mt-4">Anda akan diarahkan ke halaman utama dalam 5 detik...</p>
      </div>
    );
  }

  // --- JSX untuk render form (tidak ada perubahan signifikan) ---
  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Informasi Pengiriman</h2>
              <button type="button" onClick={() => setIsEditingProfile(!isEditingProfile)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"><FaEdit />{isEditingProfile ? "Selesai Edit" : "Edit Data"}</button>
            </div>
            {!isEditingProfile && (<div className="bg-green-50 border border-green-200 rounded-lg p-4"><p className="text-green-800 text-sm">✓ Data pengiriman telah diisi otomatis dari profil Anda.</p></div>)}
            <div>
              <label htmlFor="name" className="block font-medium mb-1">Nama Lengkap</label>
              <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} disabled={!isEditingProfile} className={`w-full border rounded px-3 py-2 ${errors.name ? "border-red-500" : "border-gray-300"} ${!isEditingProfile ? "bg-gray-100 cursor-not-allowed" : ""}`} />
              {errors.name && (<p className="text-sm text-red-500 mt-1">{errors.name}</p>)}
            </div>
            <div>
              <label htmlFor="email" className="block font-medium mb-1">Email</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled={!isEditingProfile} className={`w-full border rounded px-3 py-2 ${errors.email ? "border-red-500" : "border-gray-300"} ${!isEditingProfile ? "bg-gray-100 cursor-not-allowed" : ""}`} />
              {errors.email && (<p className="text-sm text-red-500 mt-1">{errors.email}</p>)}
            </div>
            <div>
              <label htmlFor="phone" className="block font-medium mb-1">Nomor Telepon</label>
              <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} disabled={!isEditingProfile} className={`w-full border rounded px-3 py-2 ${errors.phone ? "border-red-500" : "border-gray-300"} ${!isEditingProfile ? "bg-gray-100 cursor-not-allowed" : ""}`} />
              {errors.phone && (<p className="text-sm text-red-500 mt-1">{errors.phone}</p>)}
            </div>
            <div>
              <label htmlFor="address" className="block font-medium mb-1">Alamat</label>
              <textarea id="address" name="address" value={formData.address} onChange={handleChange} disabled={!isEditingProfile} className={`w-full border rounded px-3 py-2 ${errors.address ? "border-red-500" : "border-gray-300"} ${!isEditingProfile ? "bg-gray-100 cursor-not-allowed" : ""}`} rows="3" />
              {errors.address && (<p className="text-sm text-red-500 mt-1">{errors.address}</p>)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block font-medium mb-1">Kota</label>
                <input id="city" name="city" type="text" value={formData.city} onChange={handleChange} disabled={!isEditingProfile} className={`w-full border rounded px-3 py-2 ${errors.city ? "border-red-500" : "border-gray-300"} ${!isEditingProfile ? "bg-gray-100 cursor-not-allowed" : ""}`} />
                {errors.city && (<p className="text-sm text-red-500 mt-1">{errors.city}</p>)}
              </div>
              <div>
                <label htmlFor="postalCode" className="block font-medium mb-1">Kode Pos</label>
                <input id="postalCode" name="postalCode" type="text" value={formData.postalCode} onChange={handleChange} disabled={!isEditingProfile} className={`w-full border rounded px-3 py-2 ${errors.postalCode ? "border-red-500" : "border-gray-300"} ${!isEditingProfile ? "bg-gray-100 cursor-not-allowed" : ""}`} />
                {errors.postalCode && (<p className="text-sm text-red-500 mt-1">{errors.postalCode}</p>)}
              </div>
            </div>
            <h2 className="text-xl font-semibold mt-6 mb-2">Metode Pembayaran</h2>
            <div className="space-y-2">
              {[
                { id: "transfer", label: "Transfer Bank" },
                { id: "cod", label: "Bayar di Tempat (COD)" },
                { id: "ewallet", label: "E-Wallet" },
              ].map(({ id, label }) => (
                <div key={id} className="flex items-center">
                  <input type="radio" id={id} name="paymentMethod" value={id} checked={formData.paymentMethod === id} onChange={handleChange} className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                  <label htmlFor={id} className="text-gray-700">{label}</label>
                </div>
              ))}
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition mt-6 disabled:bg-gray-400">
              {isSubmitting ? "Memproses Pesanan..." : "Proses & Bayar Sekarang"}
            </button>
          </form>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Ringkasan Pesanan</h2>
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-start gap-4 border-b pb-4">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md border" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{item.name}</h4>
                  <p className="text-sm text-gray-600">{item.quantity} x Rp {(item.price || 0).toLocaleString('id-ID')}</p>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Rp {((item.price || 0) * (item.quantity || 0)).toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Biaya Pengiriman</span>
              <span>Rp {shippingFee.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-900 mt-2">
              <span>Total</span>
              <span>Rp {totalWithShipping.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
