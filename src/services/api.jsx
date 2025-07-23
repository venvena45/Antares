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

export const updateUserProfile = async (userId, formData) => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.put(
      `${API_BASE_URL}/auth/users/${userId}`,
      {
        nama: formData.nama,
        email: formData.email,
        alamat: formData.alamat,
        no_telepon: formData.no_telepon,
        role: formData.role || "admin", // <-- tambahkan ini
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error.response || error);
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

    // FIXED: gunakan kategori asli
    category: item.kategori || "Tanpa Kategori",
  }));
};


export const getMedicineById = async (id) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/obat/${id}`
  );

  const item = await response.json();

  return {
    id: item.obat_id,

    name: item.nama_obat,

    description: item.deskripsi,

    dosis: item.dosis,

    price: parseInt(item.harga_satuan),

    harga_grosir: parseInt(item.harga_grosir),

    stock: parseInt(item.stok),

    kategori: item.kategori,

    foto: item.foto,
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

// Perbaikan function updateObat di api.jsx

export const updateObat = async (id, data) => {
  try {
    // ✅ Validasi input

    if (!id) {
      throw new Error("ID obat tidak valid atau undefined");
    }

    if (!data || typeof data !== "object") {
      throw new Error("Data update tidak valid");
    } // ✅ Validasi field yang wajib ada

    if (data.stok === undefined || data.stok === null) {
      throw new Error("Field stok harus ada dalam data update");
    }

    if (data.stok < 0) {
      throw new Error("Stok tidak boleh negatif");
    } // ✅ Log untuk debugging

    console.log(`📤 Mengirim PUT request ke: /api/obat/${id}`);

    console.log("📦 Data yang dikirim:", JSON.stringify(data, null, 2));

    const response = await fetch(
      `https://antaresapi-production-006d.up.railway.app/api/obat/${id}`,

      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json", // Tambahkan header lain jika diperlukan (misal: Authorization) // 'Authorization': `Bearer ${getToken()}`,
        },

        body: JSON.stringify(data),
      }
    ); // ✅ Log response status

    console.log(
      `📥 Response status: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      // ✅ Ambil detail error dari response

      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.text();

        if (errorData) {
          errorMessage += ` - ${errorData}`;
        }
      } catch (e) {
        // Ignore jika gagal baca error response
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();

    console.log("✅ Update berhasil:", result);

    return result;
  } catch (error) {
    console.error("❌ Error dalam updateObat:", error); // ✅ Buat error message yang lebih informatif

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Gagal terhubung ke server API");
    }

    throw new Error(`Gagal update obat: ${error.message}`);
  }
};

// Di file: src/services/api.jsx

export const getObatById = async (id) => {
  const response = await fetch(
    `https://antaresapi-production-006d.up.railway.app/api/obat/${id}`
  );

  if (!response.ok) throw new Error("Gagal ambil detail obat");

  return await response.json();
};

/**
 * Mengambil seluruh riwayat pesanan berdasarkan ID pengguna.
 * ASUMSI: Endpoint di backend adalah '/pesanan/user/:userId'
 * @param {string} userId - ID dari pengguna yang sedang login.
 * @returns {Promise<Array>} - Sebuah promise yang resolve ke array daftar pesanan.
 */
// Ambil semua pesanan
export const getPesananByUserId = async (userId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/pesanan`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Gagal ambil pesanan");
  const allPesanan = await res.json();
  return allPesanan.filter((p) => p.pelanggan_id == userId);
};

export const getDetailPesananById = async (pesananId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/detail-pesanan/pesanan/${pesananId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Gagal ambil detail");
  return await res.json();
};

export const batalkanPesananById = async (pesanan) => {
  const token = localStorage.getItem("token");

  // Konversi tanggal_pesan ke format MySQL yang valid (YYYY-MM-DD HH:mm:ss)
  const formatMySQLDate = (dateString) => {
    const date = new Date(dateString);
    const pad = (n) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const fixedPesanan = {
    ...pesanan,
    status_pesanan: "dibatalkan",
    tanggal_pesan: formatMySQLDate(pesanan.tanggal_pesan),
  };

  const response = await fetch(`${API_BASE_URL}/pesanan/${pesanan.pesanan_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(fixedPesanan),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal membatalkan pesanan: ${errorText}`);
  }

  return await response.json();
};




