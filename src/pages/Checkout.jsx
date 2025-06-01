import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaEdit } from 'react-icons/fa';
import { createOrder } from '../services/api';

function Checkout({ cart, user, clearCart }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'transfer',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Auto-fill form dengan data user saat component mount atau user berubah
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
      }));
    }
  }, [user]);

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nama harus diisi';
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon harus diisi';
    } else if (!/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Nomor telepon tidak valid';
    }
    if (!formData.address.trim()) newErrors.address = 'Alamat harus diisi';
    if (!formData.city.trim()) newErrors.city = 'Kota harus diisi';
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Kode pos harus diisi';
    } else if (!/^\d{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Kode pos harus 5 digit';
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

    try {
      setIsSubmitting(true);

      const orderData = {
        userId: user ? user.id : null,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: totalPrice,
        shippingDetails: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
        },
        paymentMethod: formData.paymentMethod,
        orderDate: new Date().toISOString(),
      };

      const response = await createOrder(orderData);
      setOrderNumber(response.orderNumber);
      setIsOrderComplete(true);
      clearCart();

      setTimeout(() => {
        navigate('/');
      }, 5000);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && !isOrderComplete) {
    navigate('/cart');
    return null;
  }

  if (isOrderComplete) {
    return (
      <div className="max-w-2xl mx-auto text-center py-10">
        <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Pesanan Berhasil!</h1>
        <p className="text-gray-600 mb-1">Terima kasih telah berbelanja di Apotek Sehat</p>
        <p className="text-gray-700 font-medium">
          Nomor Pesanan: <strong>{orderNumber}</strong>
        </p>
        <p className="text-sm text-gray-500 mt-4">Anda akan diarahkan ke halaman utama dalam 5 detik...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid md:grid-cols-3 gap-8">
        {/* Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header untuk informasi pengiriman */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Informasi Pengiriman</h2>
              {user && (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <FaEdit />
                  {isEditingProfile ? 'Selesai Edit' : 'Edit Data'}
                </button>
              )}
            </div>

            {/* Status informasi untuk user yang login */}
            {user && !isEditingProfile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800 text-sm">
                  ✓ Data pengiriman telah diisi otomatis dari profil Anda. 
                  Klik "Edit Data" jika ingin mengubah informasi.
                </p>
              </div>
            )}

            {/* Form fields - disabled jika user login dan tidak sedang edit */}
            {[
              { label: 'Nama Lengkap', name: 'name', type: 'text' },
              { label: 'Email', name: 'email', type: 'email' },
              { label: 'Nomor Telepon', name: 'phone', type: 'tel' },
            ].map(({ label, name, type }) => (
              <div key={name}>
                <label htmlFor={name} className="block font-medium mb-1">{label}</label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  value={formData[name]}
                  onChange={handleChange}
                  disabled={user && !isEditingProfile}
                  className={`w-full border rounded px-3 py-2 ${
                    errors[name] ? 'border-red-500' : 'border-gray-300'
                  } ${user && !isEditingProfile ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {errors[name] && <p className="text-sm text-red-500 mt-1">{errors[name]}</p>}
              </div>
            ))}

            <div>
              <label htmlFor="address" className="block font-medium mb-1">Alamat</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={user && !isEditingProfile}
                className={`w-full border rounded px-3 py-2 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                } ${user && !isEditingProfile ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                rows="3"
              />
              {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Kota', name: 'city', type: 'text' },
                { label: 'Kode Pos', name: 'postalCode', type: 'text' },
              ].map(({ label, name, type }) => (
                <div key={name}>
                  <label htmlFor={name} className="block font-medium mb-1">{label}</label>
                  <input
                    id={name}
                    name={name}
                    type={type}
                    value={formData[name]}
                    onChange={handleChange}
                    disabled={user && !isEditingProfile}
                    className={`w-full border rounded px-3 py-2 ${
                      errors[name] ? 'border-red-500' : 'border-gray-300'
                    } ${user && !isEditingProfile ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                  {errors[name] && <p className="text-sm text-red-500 mt-1">{errors[name]}</p>}
                </div>
              ))}
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-2">Metode Pembayaran</h2>
            <div className="space-y-2">
              {[
                { id: 'transfer', label: 'Transfer Bank' },
                { id: 'cod', label: 'Bayar di Tempat (COD)' },
                { id: 'ewallet', label: 'E-Wallet' },
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
              {isSubmitting ? 'Memproses...' : 'Proses Pesanan'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Ringkasan Pesanan</h2>
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-start gap-4 border-b pb-2">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-600">{item.quantity} x Rp {item.price.toLocaleString()}</p>
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
              <span>Rp 10,000</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>Rp {(totalPrice + 10000).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;