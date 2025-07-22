import React from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

function Footer() {
  return (
    <footer
      className="mt-10 px-5 py-10"
      style={{ backgroundColor: "#309898", color: "#ffffff" }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8">
        {/* Kiri - Kontak */}
        <div className="min-w-[250px] flex-1">
          <h3 className="text-xl mb-4 font-semibold">Kontak</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <FaPhoneAlt /> +62 853 8112 8438
            </li>
            {/* <li className="flex items-center gap-3">
              <FaEnvelope /> info@apoteksehat.com
            </li> */}
            <li className="flex items-center gap-3">
              <FaMapMarkerAlt /> Jl. Pringadi No.128, RT.001, Pringsewu Utara, Kec. Pringsewu, Kabupaten Pringsewu, Lampung 35373
            </li>
          </ul>
        </div>

        {/* Kanan - Jam Operasional */}
        <div className="min-w-[250px] flex-1 text-left md:text-right">
          <h3 className="text-xl mb-4 font-semibold">Jam Operasional</h3>
          <p>Senin - Jumat: 08.00 - 21.00</p>
          <p>Sabtu - Minggu: 09.00 - 20.00</p>
        </div>
      </div>

      <div className="text-center mt-8 pt-6 border-t border-white/30 space-y-2">
        <p>
          &copy; {new Date().getFullYear()} Apotek Antares. All Rights Reserved.
        </p>
        {/* Tambahan Kebijakan Pengembalian Dana */}
        <p>
          <a
            href="/kebijakan-pengembalian-dana"
            className="underline hover:text-gray-200"
          >
            Kebijakan Pengembalian Dana
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
