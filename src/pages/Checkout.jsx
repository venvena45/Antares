import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// --- Komponen Ikon SVG (Tidak berubah) ---
const FaCheckCircle = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 512 512"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"></path>
  </svg>
);
const FaEdit = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 576 512"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.2 15.2-39.9 0-55.2z"></path>
  </svg>
);

// --- Konstanta API (Tidak berubah) ---
const API_BASE_URL = "https://antaresapi-production-006d.up.railway.app/api";

// --- Fungsi-fungsi API dengan Penanganan Error (Tidak berubah) ---
const createOrder = async (orderData) => {
  console.log("🟦 Request ke /pesanan/:", JSON.stringify(orderData, null, 2));
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

const createOrderDetail = async (detailData) => {
  console.log(
    "🟨 Request ke /detail-pesanan/:",
    JSON.stringify(detailData, null, 2)
  );
  const response = await fetch(`${API_BASE_URL}/detail-pesanan/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(detailData),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Gagal menyimpan detail pesanan. Status: ${response.status}, Pesan: ${errorText}`
    );
  }
  return await response.json();
};

const getObatById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/obat/${id}`);
  if (!response.ok) {
    throw new Error(`Gagal mendapatkan data untuk obat ID ${id}`);
  }
  return await response.json();
};

const updateObat = async (id, data) => {
  console.log(`🟥 PUT ke /obat/${id}:`, JSON.stringify(data, null, 2));
  const response = await fetch(`${API_BASE_URL}/obat/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Gagal update stok untuk obat ID ${id}. Status: ${response.status}. Pesan: ${errorText}`
    );
  }
  return await response.json();
};

// ++ PERUBAHAN 1: Tambahkan fungsi helper ini
const parseAddress = (addressString) => {
  if (!addressString) {
    return { extractedCity: "", extractedPostalCode: "" };
  }
  const postalCodeMatch = addressString.match(/\b\d{5}\b/);
  const extractedPostalCode = postalCodeMatch ? postalCodeMatch[0] : "";
  let extractedCity = "";
  const cityKeywords = ["Kota", "Kab.", "Kabupaten"];
  const addressParts = addressString.split(/[\s,]+/);
  for (let i = 0; i < addressParts.length; i++) {
    if (cityKeywords.includes(addressParts[i]) && addressParts[i + 1]) {
      extractedCity = addressParts[i + 1];
      break;
    }
  }
  if (!extractedCity && extractedPostalCode) {
    const postalCodeIndex = addressString.lastIndexOf(extractedPostalCode);
    if (postalCodeIndex > 0) {
      const relevantPart = addressString.substring(0, postalCodeIndex).trim();
      const parts = relevantPart.split(/[\s,]+/);
      extractedCity = parts.pop() || "";
    }
  }
  if (extractedCity) {
    extractedCity = extractedCity.replace(/,/g, "");
  }
  return { extractedCity, extractedPostalCode };
};

function Checkout({ cart, clearCart }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);

  const shippingFee = 10000;

  useEffect(() => {
    console.log("=== CHECKOUT CART DEBUG ===");
    console.log("Cart data:", cart);
    cart.forEach((item, index) => {
      console.log(`Checkout Item ${index + 1}:`, {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        quantityType: typeof item.quantity,
        quantityIsValid: !isNaN(item.quantity) && item.quantity > 0,
        price: item.price,
        priceType: typeof item.price,
        subtotal:
          (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0),
      });
    });
    console.log("============================");
  }, [cart]);

  // ++ PERUBAHAN 2: Logika di dalam useEffect ini diubah
  useEffect(() => {
    try {
      const userRaw = localStorage.getItem("user");
      const userIdRaw = localStorage.getItem("userId");
      if (!userRaw || !userIdRaw) {
        navigate("/login");
        return;
      }

      const userDetails = JSON.parse(userRaw);
      const finalUserObject =
        userDetails.user || userDetails.data || userDetails;
      finalUserObject.id = parseInt(userIdRaw, 10);
      if (isNaN(finalUserObject.id)) {
        throw new Error("User ID tidak valid.");
      }

      setUserData(finalUserObject);

      // Parsing alamat dari data yang dimuat
      const fullAddress = finalUserObject.alamat || "";
      const { extractedCity, extractedPostalCode } = parseAddress(fullAddress);

      setFormData((prev) => ({
        ...prev,
        name: finalUserObject.nama || "",
        email: finalUserObject.email || "",
        phone: finalUserObject.no_telepon || "",
        address: fullAddress,
        // Gunakan hasil parsing sebagai prioritas
        city: extractedCity || finalUserObject.kota || "",
        postalCode: extractedPostalCode || finalUserObject.kode_pos || "",
      }));
    } catch (error) {
      console.error("Gagal memproses data pengguna:", error);
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (cart.length === 0 && !isOrderComplete && !paymentUrl) {
      navigate("/cart");
    }
  }, [cart, isOrderComplete, paymentUrl, navigate]);

  const totalPrice = cart.reduce((total, item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    const subtotal = price * quantity;
    console.log(`Item ${item.name}: ${price} x ${quantity} = ${subtotal}`);
    return total + subtotal;
  }, 0);

  const totalWithShipping = totalPrice + shippingFee;

  // ++ PERUBAHAN 3: Fungsi handleChange ini diubah
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Jika field alamat yang berubah, update juga kota dan kode pos
    if (name === "address") {
      const { extractedCity, extractedPostalCode } = parseAddress(value);
      setFormData((prev) => ({
        ...prev,
        address: value,
        city: extractedCity,
        postalCode: extractedPostalCode,
      }));
    } else {
      // Jika field lain, update seperti biasa
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ++ PERUBAHAN 4: Fungsi validateForm ini diubah
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Nama harus diisi";
    if (!formData.email.trim()) newErrors.email = "Email harus diisi";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Format email tidak valid";
    if (!formData.phone.trim()) newErrors.phone = "Nomor telepon harus diisi";
    if (!formData.address.trim()) newErrors.address = "Alamat harus diisi";
    // Validasi tambahan
    if (!formData.city.trim()) newErrors.city = "Kota harus diisi";
    if (!formData.postalCode.trim())
      newErrors.postalCode = "Kode pos harus diisi";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("=== FORM SUBMIT DEBUG ===");
    console.log("Form data:", formData);
    console.log("Cart data saat submit:", cart);
    console.log("========================");

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const invalidItems = cart.filter((item) => {
      const quantity = parseInt(item.quantity);
      return isNaN(quantity) || quantity < 1;
    });

    if (invalidItems.length > 0) {
      alert(
        "Ada item dengan quantity tidak valid di keranjang. Silakan periksa kembali."
      );
      console.error("Invalid cart items:", invalidItems);
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
      console.log("Creating main order with data:", pesananData);
      const mainOrderResponse = await createOrder(pesananData);
      const orderId = mainOrderResponse.pesanan_id || mainOrderResponse.id;

      if (orderId) {
        setCompletedOrderId(orderId);

        console.log(
          `Pesanan utama dibuat dengan ID: ${orderId}. Menyimpan detail item...`
        );

        for (const item of cart) {
          try {
            const itemId = parseInt(item.id);
            const quantity = parseInt(item.quantity);
            const price = parseFloat(item.price) || 0;

            console.log("=== PROCESSING ITEM DETAIL ===");
            console.log("Original item:", item);
            console.log("Processed values:", { itemId, quantity, price });

            if (isNaN(itemId) || itemId <= 0) {
              throw new Error(`ID obat tidak valid: ${item.id}`);
            }

            if (isNaN(quantity) || quantity < 1) {
              throw new Error(
                `Quantity tidak valid untuk ${item.name}: ${item.quantity}`
              );
            }

            if (isNaN(price) || price < 0) {
              throw new Error(
                `Harga tidak valid untuk ${item.name}: ${item.price}`
              );
            }

            const detailData = {
              pesanan_id: orderId,
              obat_id: itemId,
              jumlah: quantity,
            };

            console.log("Sending detail data:", detailData);
            await createOrderDetail(detailData);
            console.log("================================");
          } catch (err) {
            console.error(
              `Gagal menyimpan detail untuk obat ${item.name} (ID: ${item.id}):`,
              err
            );
          }
        }

        console.log("Memulai proses update stok...");
        for (const item of cart) {
          try {
            const itemId = parseInt(item.id);
            const quantity = parseInt(item.quantity);

            if (isNaN(itemId) || isNaN(quantity)) {
              console.error(`Skipping stock update for invalid item:`, item);
              continue;
            }

            const obatLengkap = await getObatById(itemId);
            const stokBaru = obatLengkap.stok - quantity;

            if (stokBaru < 0) {
              console.warn(
                `Stok akan menjadi negatif untuk obat ID ${itemId}. Melanjutkan...`
              );
            }

            const dataUntukUpdate = {
              nama_obat: obatLengkap.nama_obat,
              deskripsi: obatLengkap.deskripsi,
              dosis: obatLengkap.dosis,
              harga_satuan: obatLengkap.harga_satuan,
              harga_grosir: obatLengkap.harga_grosir,
              stok: stokBaru,
              satuan: obatLengkap.satuan,
              foto: obatLengkap.foto,
              kategori: obatLengkap.kategori,
            };

            await updateObat(itemId, dataUntukUpdate);
          } catch (err) {
            console.error(
              `Error updating stock for item ${item.name}:`,
              err.message
            );
          }
        }

        console.log("Memanggil API pembayaran...");

        const paymentData = {
          orderId: `INV-${new Date()
            .toISOString()
            .split("T")[0]
            .replace(/-/g, "")}-${orderId}`,
          grossAmount: totalWithShipping,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        };

        console.log("Payload pembayaran:", paymentData);

        const paymentResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/pembayaran`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(paymentData),
          }
        );

        if (!paymentResponse.ok) {
          const errorText = await paymentResponse.text();
          throw new Error(
            `Gagal memproses pembayaran: ${paymentResponse.status} - ${errorText}`
          );
        }

        const paymentResult = await paymentResponse.json();
        console.log("Hasil respon pembayaran:", paymentResult);

        // --- Tambahkan cek redirectUrl dari API ---
        if (paymentResult.redirect_url) {
          setPaymentUrl(paymentResult.redirect_url);

          // TUNDA clearCart dan navigate
          // Tunggu user selesai di modal
        } else {
          alert(
            "Pesanan berhasil, tetapi tidak ada link pembayaran ditemukan."
          );

          // Kalau redirect_url TIDAK ADA, tetap anggap order selesai.
          setIsOrderComplete(true);
          clearCart();
          window.scrollTo({ top: 0, behavior: "smooth" });
          setTimeout(() => {
            navigate("/");
          }, 5000);
        }
      } else {
        throw new Error(
          `Respons dari API pesanan tidak berisi ID yang valid. Respons: ${JSON.stringify(
            mainOrderResponse
          )}`
        );
      }
    } catch (error) {
      console.error("Terjadi kesalahan saat memproses pesanan:", error);
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
        <div className="flex justify-center text-green-500 text-5xl mx-auto mb-4">
          <FaCheckCircle />
        </div>
        <h1 className="text-2xl font-bold mb-2">Pesanan Berhasil!</h1>
        <p className="text-gray-600 mb-1">
          Terima kasih, pesanan Anda sedang kami proses.
        </p>
        <p className="text-gray-700 font-medium">
          Nomor ID Pesanan Anda: <strong>{completedOrderId}</strong>
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Anda akan diarahkan ke halaman utama dalam 5 detik...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white p-8 rounded-lg shadow-md"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Informasi Pengiriman</h2>
              <button
                type="button"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                <FaEdit />
                {isEditingProfile ? "Selesai Edit" : "Edit Data"}
              </button>
            </div>
            {!isEditingProfile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  ✓ Data pengiriman telah diisi otomatis dari profil Anda.
                </p>
              </div>
            )}
            <div>
              <label htmlFor="name" className="block font-medium mb-1">
                Nama Lengkap
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditingProfile}
                className={`w-full border rounded px-3 py-2 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } ${!isEditingProfile ? "bg-gray-100 cursor-not-allowed" : ""}`}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditingProfile}
                className={`w-full border rounded px-3 py-2 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } ${!isEditingProfile ? "bg-gray-100 cursor-not-allowed" : ""}`}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="phone" className="block font-medium mb-1">
                Nomor Telepon
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditingProfile}
                className={`w-full border rounded px-3 py-2 ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                } ${!isEditingProfile ? "bg-gray-100 cursor-not-allowed" : ""}`}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>
            <div>
              <label htmlFor="address" className="block font-medium mb-1">
                Alamat
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditingProfile}
                className={`w-full border rounded px-3 py-2 ${
                  errors.address ? "border-red-500" : "border-gray-300"
                } ${!isEditingProfile ? "bg-gray-100 cursor-not-allowed" : ""}`}
                rows="3"
              />
              {errors.address && (
                <p className="text-sm text-red-500 mt-1">{errors.address}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block font-medium mb-1">
                  Kota
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditingProfile}
                  className={`w-full border rounded px-3 py-2 ${
                    errors.city ? "border-red-500" : "border-gray-300"
                  } ${
                    !isEditingProfile ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
                {errors.city && (
                  <p className="text-sm text-red-500 mt-1">{errors.city}</p>
                )}
              </div>
              <div>
                <label htmlFor="postalCode" className="block font-medium mb-1">
                  Kode Pos
                </label>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  value={formData.postalCode}
                  onChange={handleChange}
                  disabled={!isEditingProfile}
                  className={`w-full border rounded px-3 py-2 ${
                    errors.postalCode ? "border-red-500" : "border-gray-300"
                  } ${
                    !isEditingProfile ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
                {errors.postalCode && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.postalCode}
                  </p>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition mt-6 disabled:bg-gray-400"
            >
              {isSubmitting
                ? "Memproses Pesanan..."
                : "Proses & Bayar Sekarang"}
            </button>
          </form>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">
            Ringkasan Pesanan
          </h2>
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 border-b pb-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md border"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{item.name}</h4>
                  <p className="text-sm text-gray-600">
                    {item.quantity} x Rp{" "}
                    {(item.price || 0).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Rp{" "}
                  {((item.price || 0) * (item.quantity || 0)).toLocaleString(
                    "id-ID"
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Biaya Pengiriman</span>
              <span>Rp {shippingFee.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-900 mt-2">
              <span>Total</span>
              <span>Rp {totalWithShipping.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>
      </div>
      {paymentUrl && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl relative shadow-2xl animate-fadeIn">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    💳 Pembayaran Pesanan
                  </h2>
                  <p className="text-blue-100 text-sm">
                    Selesaikan pembayaran untuk melanjutkan pesanan Anda
                  </p>
                </div>
                <button
                  className="text-white hover:text-gray-200 transition-colors duration-200 p-2 rounded-full hover:bg-white hover:bg-opacity-20"
                  onClick={() => {
                    setPaymentUrl(null);
                    setIsOrderComplete(true);
                    clearCart();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setTimeout(() => navigate("/"), 5000);
                  }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Payment Frame */}
            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium">
                      Transaksi Aman & Terpercaya
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <iframe
                    src={paymentUrl}
                    className="w-full h-[500px] border-0 rounded-lg shadow-inner bg-white"
                    title="Pembayaran"
                  ></iframe>

                  {/* Loading overlay jika diperlukan */}
                  <div
                    className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg hidden"
                    id="loading-overlay"
                  >
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-600 text-sm">
                        Memuat pembayaran...
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                <div className="flex items-center text-gray-500 text-sm">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Halaman akan otomatis tertutup setelah pembayaran selesai
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setPaymentUrl(null);
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                  >
                    Batal
                  </button>

                  <button
                    onClick={() => {
                      setPaymentUrl(null);
                      setIsOrderComplete(true);
                      clearCart();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setTimeout(() => navigate("/"), 5000);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    ✅ Selesai Bayar & Tutup
                  </button>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <span>PCI Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
