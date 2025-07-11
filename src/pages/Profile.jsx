import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { updateUserProfile } from '../services/api';

const menuItems = ['Informasi Akun', 'Data Diri', 'Alamat', 'Kontak'];

function Profile() {
  const [activeMenu, setActiveMenu] = useState('Informasi Akun');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    alamat: '',
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

        setFormData({
          nama: finalUser.nama || '',
          email: finalUser.email || '',
          alamat: finalUser.alamat || '',
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
  }, []);

  if (!userId || !token) return <Navigate to="/login" replace />;
  if (loading) return <p className="p-4">Memuat data profil...</p>;
  if (error) return <p className="text-red-600 p-4">{error}</p>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.nama.trim() || !formData.email.trim()) {
      alert('Nama dan Email wajib diisi.');
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

      const updatedUser = {
        ...formData,
        id: userId,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      alert('Gagal memperbarui profil.');
    }
  };

  const fieldMap = {
    'Data Diri': ['nama', 'email'],
    Alamat: ['alamat'],
    Kontak: ['no_telepon'],
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 flex flex-col lg:flex-row gap-6 px-4">
      {/* Sidebar */}
      <aside className="w-full lg:w-1/4 bg-white shadow rounded-lg p-4">
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
              className={`cursor-pointer px-3 py-2 rounded-md transition ${
                activeMenu === item
                  ? 'bg-blue-100 text-blue-800 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
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
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md border border-green-300 text-sm">
            {successMsg}
          </div>
        )}

        {/* Informasi Akun (Readonly) */}
        {activeMenu === 'Informasi Akun' ? (
          <div className="space-y-4 text-sm text-gray-700">
            <InfoRow label="Nama" value={formData.nama} />
            <InfoRow label="Email" value={formData.email} />
            <InfoRow label="Alamat" value={formData.alamat} />
            <InfoRow label="No Telepon" value={formData.no_telepon} />
          </div>
        ) : (
          <form className="space-y-4">
            {fieldMap[activeMenu]?.map((field) => (
              <InputField
                key={field}
                label={field.replace("_", " ")}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                disabled={!isEditing}
              />
            ))}

            <div className="mt-4 flex gap-3">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Simpan
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                >
                  Edit
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
  <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200">
    <span className="text-gray-500 font-medium">{label}</span>
    <span className="col-span-2 text-gray-800 font-semibold">{value || '-'}</span>
  </div>
);


const InputField = ({ label, name, value, onChange, disabled }) => (
  <div>
    <label className="block text-gray-700 font-medium mb-1 capitalize">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-4 py-2 border rounded-md transition ${
        disabled
          ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
          : 'border-gray-300 focus:ring-2 focus:ring-blue-400'
      }`}
    />
  </div>
);

export default Profile;
