import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../services/api';
import HeaderLogin from '../components/HeaderLogin'; // <-- import header

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (loginError) setLoginError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
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
      const userData = await loginApi(formData.email, formData.password);
      onLogin(userData);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Email atau password salah. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <div className="login-page flex flex-col md:flex-row items-center justify-center min-h-screen bg-gray-100 px-6 md:px-12 gap-6">
    {/* Logo di kiri (atau atas di mobile) */}
    <div className="login-logo w-full md:w-1/2 max-w-lg flex items-center justify-center bg-gray-100 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none p-6">
      <img
        src="/logo.png"
        alt="Logo"
        className="max-w-full max-h-64 md:max-h-[400px] object-contain"
      />
    </div>

    {/* Form di kanan (atau bawah di mobile) */}
    <div className="login-container w-full md:w-1/2 max-w-lg flex items-stretch bg-white rounded-b-2xl md:rounded-r-2xl md:rounded-bl-none shadow-lg p-6">
      <div className="login-form flex flex-col justify-center w-full">
        <h1 className="text-2xl font-semibold text-center mb-6">Login</h1>

        {loginError && (
          <div className="mb-4 text-red-600 bg-red-100 px-4 py-2 rounded">
            {loginError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            style={{ backgroundColor: '#F4631E' }}
            className="w-full py-2 px-4 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Loading...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Belum punya akun?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Daftar disini
          </Link>
        </p>
      </div>
    </div>
  </div>
);

}

export default Login;
