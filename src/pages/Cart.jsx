import React from "react";
import { Link } from "react-router-dom";
import { FaTrash, FaArrowRight } from "react-icons/fa";

function Cart({ cart, updateQuantity, removeFromCart }) {
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <h1 className="text-3xl font-semibold mb-4">Keranjang Belanja</h1>
        <p className="text-gray-600 mb-6">Keranjang belanja Anda kosong</p>
        <Link
          to="/products"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Lanjutkan Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-6">Keranjang Belanja</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 border rounded-lg p-4 shadow-sm"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 object-cover rounded"
              />

              <div className="flex-1">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-500">
                  Rp {item.price.toLocaleString()}
                </p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center border rounded">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2 py-1 text-lg bg-gray-200 hover:bg-gray-300 transition"
                  >
                    -
                  </button>
                  <span className="px-3">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2 py-1 text-lg bg-gray-200 hover:bg-gray-300 transition"
                    disabled={item.quantity >= item.stock}
                  >
                    +
                  </button>
                </div>

                <p className="text-sm text-gray-700">
                  Rp {(item.price * item.quantity).toLocaleString()}
                </p>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Ringkasan Belanja</h2>

          <div className="flex justify-between mb-2">
            <span>Total Item:</span>
            <span>
              {cart.reduce((total, item) => total + item.quantity, 0)}
            </span>
          </div>

          <div className="flex justify-between mb-4 font-semibold">
            <span>Total Harga:</span>
            <span>Rp {totalPrice.toLocaleString()}</span>
          </div>

          <Link
            to="/checkout"
            className="block w-full bg-green-600 text-white text-center py-2 rounded hover:bg-green-700 transition mb-2"
          >
            Lanjutkan ke Pembayaran <FaArrowRight className="inline ml-1" />
          </Link>

          <Link
            to="/products"
            className="block w-full text-center text-blue-600 hover:underline"
          >
            Lanjutkan Belanja
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Cart;
