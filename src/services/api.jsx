import axios from "axios";

const DELAY = 800; // Simulasi network delay

// Gunakan ENV untuk API backend (Vite env variable)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Data dummy untuk obat-obatan
const medicines = [
  // ... (data medicines kamu tetap sama)
];

// User dan order mock data
let users = [
  { id: 1, name: "User Test", email: "user@test.com", password: "password123" },
];

let orders = [];
let orderCounter = 1;

const delay = (ms = DELAY) => new Promise((resolve) => setTimeout(resolve, ms));

// ====================
// === BACKEND API ====
// ====================

// ✅ Register ke backend
export const register = async (name, email, password, alamat, no_telepon) => {
  console.log("Terpencet");
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      nama: name,
      email,
      password,
      role: "Pelanggan",
      alamat,
      no_telepon,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ✅ Login ke backend
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ====================
// === MOCK APIs ======
// ====================

export const getMedicines = async () => {
  const response = await axios.get(`${API_BASE_URL}/obat`);
  return response.data.map(item => ({
    id: item.obat_id,
    name: item.nama_obat,
    description: item.deskripsi,
    dosage: item.dosis,
    price: item.harga_satuan,
    wholesalePrice: item.harga_grosir,
    stock: item.stok,
    unit: item.satuan,
    image: item.foto,
    category: '', // Tambahkan jika ada kategori di response
  }));
};

// services/api.js
export const getMedicineById = async (id) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/obat/${id}`);
  const data = await response.json();

  return {
    id: data.obat_id,
    name: data.nama_obat,
    description: data.deskripsi,
    dosage: data.dosis,
    price: data.harga_satuan,
    wholesalePrice: data.harga_grosir,
    stock: data.stok,
    unit: data.satuan,
    image: data.foto,
  };
};


// ⚠️ MOCK REGISTER: fallback jika backend tidak tersedia
export const mockRegister = async (name, email, password) => {
  await delay();
  if (users.some((u) => u.email === email))
    throw new Error("Email already in use");

  const newUser = { id: users.length + 1, name, email, password };
  users.push(newUser);
  const { password: _, ...userData } = newUser;
  return userData;
};

export const createOrder = async (orderData) => {
  await delay();

  const newOrder = {
    ...orderData,
    id: orderCounter,
    orderNumber: `ORD-${Date.now()}`,
    status: "pending",
  };

  orders.push(newOrder);
  orderCounter++;

  return {
    success: true,
    orderNumber: newOrder.orderNumber,
  };
};
