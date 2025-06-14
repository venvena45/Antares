import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// === Register ke backend ===
export const register = async (name, email, password, alamat, no_telepon) => {
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

// === Login ke backend ===
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });

    const { token, user } = response.data;

    if (token && user?.id) {
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);
    }

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// === Ambil data user berdasarkan ID ===
export const getUserById = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token tidak ditemukan. Harap login ulang.");

    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gagal mengambil user: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};

// === Fungsi bantu: ambil profil user yang sedang login ===
export const getMyProfile = async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) throw new Error("User ID tidak ditemukan. Harap login ulang.");
  return await getUserById(userId);
};

// === Update profil user ===
export const updateUserProfile = async (userId, userData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token tidak ditemukan. Harap login ulang.");

    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gagal update profil: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// === Get semua obat ===
export const getMedicines = async () => {
  const response = await axios.get(`${API_BASE_URL}/obat`);
  return response.data.map((item) => ({
    id: item.obat_id,
    name: item.nama_obat,
    description: item.deskripsi,
    dosage: item.dosis,
    price: item.harga_satuan,
    wholesalePrice: item.harga_grosir,
    stock: item.stok,
    unit: item.satuan,
    image: item.foto,
    category: "", // bisa diisi jika tersedia
  }));
};

// === Get obat berdasarkan ID ===
export const getMedicineById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/obat/${id}`);
  if (!response.ok) throw new Error("Gagal mengambil data obat");
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

// === Order mock ===
let orders = [];
let orderCounter = 1;

export const createOrder = async (orderData) => {
  await new Promise((resolve) => setTimeout(resolve, 800)); // Simulasi delay

  const newOrder = {
    ...orderData,
    id: orderCounter++,
    orderNumber: `ORD-${Date.now()}`,
    status: "pending",
  };

  orders.push(newOrder);
  return {
    success: true,
    orderNumber: newOrder.orderNumber,
  };
};
