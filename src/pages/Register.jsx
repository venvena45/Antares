import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/api";
// Komponen HeaderRegistrasi tidak disertakan di sini, pastikan Anda memilikinya
// import HeaderRegistrasi from "../components/HeaderRegistrasi"; 

function Register() {
  const navigate = useNavigate();
  // State untuk melacak langkah form saat ini
  const [step, setStep] = useState(1); 
  
  // State untuk semua data form, termasuk 'kode_pos'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    alamat: "",
    no_telepon: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Hapus pesan error saat pengguna mulai mengetik
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (registerError) {
      setRegisterError("");
    }
  };

  // --- Fungsi Navigasi dan Validasi per Langkah ---

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Nama harus diisi";
    if (!formData.email.trim()) {
      newErrors.email = "Email harus diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }
    if (!formData.password) {
      newErrors.password = "Password harus diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.alamat.trim()) newErrors.alamat = "Alamat harus diisi";
    if (!formData.no_telepon.trim()) newErrors.no_telepon = "Nomor telepon harus diisi";
    return newErrors;
  };

  const nextStep = () => {
    const formErrors = validateStep1();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
    } else {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  // --- Fungsi Submit di Langkah Terakhir ---
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateStep2(); // Validasi hanya untuk langkah 2
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.alamat,
        formData.no_telepon
      );

      if (response && response.user) {
        localStorage.setItem("userData", JSON.stringify(response.user));
      }

      alert("Pendaftaran berhasil! Silakan login.");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      setRegisterError("Gagal mendaftar. Pastikan email belum digunakan dan data valid.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Fungsi untuk render input field (agar tidak duplikasi kode)
  const renderInput = (id, label, type) => (
    <div key={id}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        id={id}
        name={id}
        value={formData[id]}
        onChange={handleChange}
        className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
          errors[id] ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-blue-300"
        }`}
      />
      {errors[id] && <p className="text-xs text-red-500 mt-1">{errors[id]}</p>}
    </div>
  );


  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gray-100 px-6 py-12 gap-8">
      {/* Bagian logo kiri */}
      <div className="login-logo w-full md:w-1/2 max-w-lg flex items-center justify-center bg-gray-100 rounded-2xl p-6">
        <img src="/logo.png" alt="Logo" className="max-w-full max-h-[350px] object-contain" />
      </div>

      {/* Form registrasi kanan */}
      <div className="w-full md:w-1/2 max-w-lg bg-white shadow-lg rounded-2xl p-8">
        {registerError && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 border border-red-300 rounded p-2">
            {registerError}
          </div>
        )}

        <h1 className="text-2xl font-semibold text-center mb-2">Daftar Akun</h1>
        <p className="text-center text-sm text-gray-500 mb-6">Langkah {step} dari 2</p>

        {/* Form akan berganti tampilan berdasarkan state 'step' */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {step === 1 && (
            <>
              {renderInput("name", "Nama Lengkap", "text")}
              {renderInput("email", "Email", "email")}
              {renderInput("password", "Password", "password")}
              {renderInput("confirmPassword", "Konfirmasi Password", "password")}
              
              <button
                type="button" // type="button" agar tidak men-submit form
                onClick={nextStep}
                style={{ backgroundColor: "#F4631E" }}
                className="w-full text-white font-semibold py-2 px-4 rounded-md transition duration-200 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                Selanjutnya
              </button>
            </>
          )}

          {step === 2 && (
            <>
              {renderInput("alamat", "Alamat", "text")}
              {renderInput("no_telepon", "No. Telepon", "text")}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-full text-gray-700 bg-gray-200 font-semibold py-2 px-4 rounded-md transition duration-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Kembali
                </button>
                <button
                  type="submit" // type="submit" untuk mengirim semua data
                  style={{ backgroundColor: "#F4631E" }}
                  className="w-full text-white font-semibold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Loading..." : "Daftar"}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login disini
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;