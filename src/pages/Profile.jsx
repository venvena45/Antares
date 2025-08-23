import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { updateUserProfile } from '../services/api'; 

const menuItems = ['Informasi Akun', 'Data Diri', 'Alamat', 'Kontak'];

/**
 * Fungsi helper untuk mem-parsing alamat.
 */
const parseAddress = (addressString) => {
  if (!addressString) {
    return { extractedCity: '', extractedPostalCode: '' };
  }

  const postalCodeMatch = addressString.match(/\b\d{5}\b/);
  const extractedPostalCode = postalCodeMatch ? postalCodeMatch[0] : '';

  let extractedCity = '';
  const cityKeywords = ['Kota', 'Kab.', 'Kabupaten'];
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
      extractedCity = parts.pop() || '';
    }
  }
  
  if (extractedCity) {
    extractedCity = extractedCity.replace(/,/g, '');
  }

  return { extractedCity, extractedPostalCode };
};


function Profile() {
  const [activeMenu, setActiveMenu] = useState('Informasi Akun');
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    alamat: '',
    kota: '',
    kode_pos: '',
    no_telepon: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const loadUserFromStorage = () => {
      setLoading(true);
      try {
        const userRaw = localStorage.getItem("user");
        if (!userRaw || !userId) {
          setError("User belum login.");
          setLoading(false);
          return;
        }

        const parsed = JSON.parse(userRaw);
        const finalUser = parsed.user || parsed.data || parsed;

        const fullAddress = finalUser.alamat || '';
        const { extractedCity, extractedPostalCode } = parseAddress(fullAddress);

        setFormData({
          nama: finalUser.nama || '',
          email: finalUser.email || '',
          alamat: fullAddress,
          kota: extractedCity,
          kode_pos: extractedPostalCode || finalUser.kode_pos || '',
          no_telepon: finalUser.no_telepon || '',
        });

        setError(null);
      } catch (err) {
        console.error("Gagal memuat data user:", err);
        setError("Terjadi kesalahan saat memuat data.");
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, [userId]);

  if (!userId || !token) return <Navigate to="/login" replace />;
  if (loading) return <p className="p-4 text-center text-gray-600">Memuat data profil...</p>;
  if (error) return <p className="text-red-600 p-4 text-center">{error}</p>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.nama.trim() || !formData.email.trim() || !formData.alamat.trim() || !formData.kota.trim() || !formData.kode_pos.trim()) {
      alert('Semua field wajib diisi, kecuali No Telepon.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      alert('Format email tidak valid.');
      return;
    }

    try {
      await updateUserProfile(userId, formData);
      setIsEditing(false);
      setSuccessMsg('Profil berhasil diperbarui.');

      const updatedUser = { ...formData, id: userId };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Gagal memperbarui profil:', err);
      alert('Gagal memperbarui profil. Silakan coba lagi.');
    }
  };

  // Sekarang pakai mapping objek { name, label }
  const fieldMap = {
    'Data Diri': [
      { name: 'nama', label: 'Nama' },
      { name: 'email', label: 'Email' },
    ],
    'Alamat': [
      { name: 'alamat', label: 'Alamat' },
      { name: 'kota', label: 'Kabupaten/Kota' },
      { name: 'kode_pos', label: 'Kode Pos' },
    ],
    'Kontak': [
      { name: 'no_telepon', label: 'No Telepon' },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 flex flex-col lg:flex-row gap-6 px-4">
      {/* Sidebar */}
      <aside className="w-full lg:w-1/4 bg-white shadow rounded-lg p-4 h-fit">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Menu Profil</h2>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li
              key={item}
              onClick={() => {
                setActiveMenu(item);
                setIsEditing(false);
                setSuccessMsg('');
              }}
              className={`cursor-pointer px-3 py-2 rounded-md transition duration-200 ${
                activeMenu === item
                  ? 'bg-blue-100 text-blue-800 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{activeMenu}</h2>

        {successMsg && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md border border-green-300 text-sm">
            {successMsg}
          </div>
        )}

        {activeMenu === 'Informasi Akun' ? (
          <div className="space-y-4 text-sm text-gray-700">
            <InfoRow label="Nama" value={formData.nama} />
            <InfoRow label="Email" value={formData.email} />
            <InfoRow label="Alamat" value={formData.alamat} />
            <InfoRow label="Kabupaten/Kota" value={formData.kota} />
            <InfoRow label="Kode Pos" value={formData.kode_pos} />
            <InfoRow label="No Telepon" value={formData.no_telepon} />
          </div>
        ) : (
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {fieldMap[activeMenu]?.map((field) => (
              <InputField
                key={field.name}
                label={field.label}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                disabled={!isEditing}
              />
            ))}

            <div className="mt-6 flex gap-3">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-semibold"
                  >
                    Simpan Perubahan
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 font-semibold"
                >
                  Edit Data
                </button>
              )}
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

const InfoRow = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200 last:border-b-0">
    <span className="text-gray-500 font-medium capitalize">{label}</span>
    <span className="col-span-2 text-gray-800 font-semibold break-words">{value || '-'}</span>
  </div>
);

const InputField = ({ label, name, value, onChange, disabled }) => (
  <div>
    <label htmlFor={name} className="block text-gray-700 font-medium mb-1">{label}</label>
    <input
      id={name}
      type={name === 'email' ? 'email' : 'text'}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-4 py-2 border rounded-md transition duration-200 ${
        disabled
          ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
          : 'border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400'
      }`}
    />
  </div>
);

export default Profile;
