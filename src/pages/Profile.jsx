import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { updateUserProfile } from '../services/api';

function Profile({ user, onUpdate }) {
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
    if (!userId || !token || !user) {
      setError('Data pengguna tidak tersedia. Silakan login ulang.');
      setLoading(false);
      return;
    }

    try {
      setFormData({
        nama: user.user.nama || '',
        email: user.user.email || '',
        alamat: user.user.alamat || '',
        no_telepon: user.user.no_telepon || '',
      });
      setError(null);
    } catch (err) {
      console.error('Gagal parsing data user:', err);
      setError('Data pengguna tidak valid.');
    } finally {
      setLoading(false);
    }
  }, [userId, token, user]);

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
      const updatedData = await updateUserProfile(userId, formData);
      localStorage.setItem('user', JSON.stringify(formData));
      if (onUpdate) onUpdate(formData); // update state global dari App
      setIsEditing(false);
      setSuccessMsg('Profil berhasil diperbarui.');
    } catch (err) {
      console.error('Gagal memperbarui profil:', err);
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

      {successMsg && <div className="text-green-600 mb-4">{successMsg}</div>}

      <form className="space-y-4">
        {['nama', 'email', 'alamat', 'no_telepon'].map((field) => (
          <div key={field}>
            <label
              htmlFor={field}
              className="block font-medium capitalize mb-1"
            >
              {field.replace('_', ' ')}
            </label>
            <input
              id={field}
              type="text"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full p-2 border ${
                isEditing ? 'border-gray-300' : 'border-transparent'
              } rounded-md bg-gray-100`}
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