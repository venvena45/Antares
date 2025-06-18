import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaEdit } from "react-icons/fa";
import { getObatById, createOrder, updateObat } from "../services/api";

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
    paymentMethod: "transfer",
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
        console.warn(
          "Data user atau userId tidak ditemukan di localStorage. Mengarahkan ke login."
        );
        navigate("/login");
        return;
      }

      const userDetails = JSON.parse(userRaw);
      const finalUserObject =
        userDetails.user || userDetails.data || userDetails;
      finalUserObject.id = parseInt(userIdRaw, 10);

      if (isNaN(finalUserObject.id)) {
        throw new Error("User ID dari localStorage tidak valid.");
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
      console.error("Gagal memproses data pengguna dari localStorage:", error);
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (cart.length === 0 && !isOrderComplete) {
      navigate("/cart");
    }
  }, [cart, isOrderComplete, navigate]);

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const totalWithShipping = totalPrice + shippingFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Nama harus diisi";
    if (!formData.email.trim()) {
      newErrors.email = "Email harus diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }
    if (!formData.phone.trim()) newErrors.phone = "Nomor telepon harus diisi";
    if (!formData.address.trim()) newErrors.address = "Alamat harus diisi";
    if (!formData.city.trim()) newErrors.city = "Kota harus diisi";
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "Kode pos harus diisi";
    }
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
      alert("Data pelanggan tidak ditemukan. Silakan login kembali.");
      return;
    }

    try {
      setIsSubmitting(true);

      const pesananData = {
        pelanggan_id: userData.id,
        tanggal_pesan: new Date().toISOString().split("T")[0],
        total_harga: totalWithShipping,
        status_pesanan: "diproses",
        metode_pembayaran: formData.paymentMethod,
      };

      console.log("Mengirim data pesanan ke API:", pesananData);
      const response = await createOrder(pesananData);

      console.log("📦 Respons mentah dari API createOrder:", response);

      // --- PERBAIKAN UTAMA: Gunakan 'orderNumber' bukan 'id' ---
      if (response && response.orderNumber) {
        setCompletedOrderId(response.orderNumber); // Simpan orderNumber
        setIsOrderComplete(true);
        clearCart();
        window.scrollTo({ top: 0, behavior: "smooth" });

        console.log("Pesanan berhasil dibuat. Memulai proses update stok...");

        for (const item of cart) {
          try {
            const fullObatData = await getObatById(item.id);
            if (fullObatData) {
              const newStok = fullObatData.stok - item.quantity;
              const updatePayload = {
                ...fullObatData,
                stok: newStok >= 0 ? newStok : 0,
              };
              await updateObat(item.id, updatePayload);
              console.log(
                `✅ Stok untuk ${updatePayload.nama_obat} berhasil diupdate.`
              );
            }
          } catch (err) {
            console.error(
              `❌ Gagal update stok untuk item ID ${item.id}:`,
              err
            );
          }
        }

        console.log("✅ Proses update stok selesai.");

        setTimeout(() => {
          navigate("/");
        }, 5000);
      } else {
        throw new Error(
          "Gagal membuat pesanan. Respons dari server tidak valid."
        );
      }
    } catch (error) {
      console.error("Terjadi kesalahan saat memproses pesanan:", error);
      alert(error.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userData) {
    return <div className="text-center py-10">Memuat data pengguna...</div>;
  }

  if (isOrderComplete) {
    return (
      <div className="max-w-2xl mx-auto text-center py-10">
        <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Pesanan Berhasil!</h1>
        <p className="text-gray-600 mb-1">
          Terima kasih, pesanan Anda sedang kami proses.
        </p>
        <p className="text-gray-700 font-medium">
          {/* Tampilkan Nomor Pesanan dari state */}
          Nomor Pesanan Anda: <strong>{completedOrderId}</strong>
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Anda akan diarahkan ke halaman utama dalam 5 detik...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800 text-sm">
                  ✓ Data pengiriman telah diisi otomatis dari profil Anda.
                </p>
              </div>
            )}

            {[
              { label: "Nama Lengkap", name: "name", type: "text" },
              { label: "Email", name: "email", type: "email" },
              { label: "Nomor Telepon", name: "phone", type: "tel" },
            ].map(({ label, name, type }) => (
              <div key={name}>
                <label htmlFor={name} className="block font-medium mb-1">
                  {label}
                </label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  value={formData[name]}
                  onChange={handleChange}
                  disabled={!isEditingProfile}
                  className={`w-full border rounded px-3 py-2 ${
                    errors[name] ? "border-red-500" : "border-gray-300"
                  } ${
                    !isEditingProfile ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
                {errors[name] && (
                  <p className="text-sm text-red-500 mt-1">{errors[name]}</p>
                )}
              </div>
            ))}

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
              {[
                { label: "Kota", name: "city" },
                { label: "Kode Pos", name: "postalCode" },
              ].map(({ label, name }) => (
                <div key={name}>
                  <label htmlFor={name} className="block font-medium mb-1">
                    {label}
                  </label>
                  <input
                    id={name}
                    name={name}
                    type="text"
                    value={formData[name]}
                    onChange={handleChange}
                    disabled={!isEditingProfile}
                    className={`w-full border rounded px-3 py-2 ${
                      errors[name] ? "border-red-500" : "border-gray-300"
                    } ${
                      !isEditingProfile ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  />
                  {errors[name] && (
                    <p className="text-sm text-red-500 mt-1">{errors[name]}</p>
                  )}
                </div>
              ))}
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-2">
              Metode Pembayaran
            </h2>
            <div className="space-y-2">
              {[
                { id: "transfer", label: "Transfer Bank" },
                { id: "cod", label: "Bayar di Tempat (COD)" },
                { id: "ewallet", label: "E-Wallet" },
              ].map(({ id, label }) => (
                <div key={id} className="flex items-center">
                  <input
                    type="radio"
                    id={id}
                    name="paymentMethod"
                    value={id}
                    checked={formData.paymentMethod === id}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor={id}>{label}</label>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition mt-4 disabled:bg-gray-400"
            >
              {isSubmitting ? "Memproses..." : "Proses Pesanan"}
            </button>
          </form>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Ringkasan Pesanan</h2>
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 border-b pb-2"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-600">
                    {item.quantity} x Rp {item.price.toLocaleString()}
                  </p>
                </div>
                <div className="text-sm font-medium text-gray-800">
                  Rp {(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>Rp {totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Biaya Pengiriman:</span>
              <span>Rp {shippingFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>Rp {totalWithShipping.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
