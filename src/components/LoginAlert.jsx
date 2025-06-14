import React, { useEffect, useState } from "react";

export default function LoginAlert({ user }) {
  const [showAlert, setShowAlert] = useState(false);
  const [firstLoadDone, setFirstLoadDone] = useState(false);

  useEffect(() => {
    // Hindari tampilkan alert saat load pertama kali
    if (!firstLoadDone) {
      setFirstLoadDone(true);
      return;
    }

    if (!user) {
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [user, firstLoadDone]);

  if (!showAlert) return null;

  return (
    <div className="fixed top-6 right-6 z-50">
      <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg animate-bounce transition-all duration-300">
        <strong className="font-bold">Oops! </strong>
        <span className="block sm:inline">Kamu belum login!</span>
      </div>
    </div>
  );
}
