import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getUserById, updateUserProfile } from '../services/api';

function Profile() {
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
    const fetchUser = async () => {
      if (!userId || !token) return;

      setLoading(true);
      try {
        const data = await getUserById(userId);
        setFormData({
          nama: data.nama || '',
          email: data.email || '',
          alamat: data.alamat || '',
          no_telepon: data.no_telepon || '',
        });
        setError(null);
      } catch (err) {
        setError('Gagal mengambil data profil.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, token]);

  if (!userId || !token) return <Navigate to="/login" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    } catch (err) {
      alert('Gagal memperbarui profil.');
    }
  };

  if (loading) return <p className="p-4">Memuat data profil...</p>;
  if (error) return <p className="text-red-600 p-4">{error}</p>;

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-semibold mb-4">
        {isEditing ? 'Edit Profil' : 'Profil Pengguna'}
      </h2>

      {successMsg && (
        <div className="text-green-600 mb-4">{successMsg}</div>
      )}

      <form className="space-y-4">
        {['nama', 'email', 'alamat', 'no_telepon'].map((field) => (
          <div key={field}>
            <label className="block font-medium capitalize mb-1">{field.replace('_', ' ')}</label>
            <input
              type="text"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full p-2 border ${
                isEditing ? 'border-gray-300' : 'border-transparent'
              } rounded-md`}
            />
          </div>
        ))}
      </form>

      <div className="mt-6 flex gap-3">
        {isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Simpan
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              setIsEditing(true);
              setSuccessMsg('');
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-md"
          >
            Edit Profil
          </button>
        )}
      </div>
    </div>
  );
}

export default Profile;
