import React from "react";

function KebijakanPengembalianDana() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-10 text-gray-800 leading-relaxed">
      <h1 className="text-3xl font-bold mb-6 text-teal-700">
        Kebijakan Pengembalian Dana
      </h1>
      <p className="mb-4">
        Terima kasih telah berbelanja di <strong>Apotek Antares</strong>.
        Kebijakan ini menjelaskan ketentuan dan prosedur pengembalian dana
        (refund) untuk transaksi yang dilakukan melalui sistem pembayaran kami
        yang terintegrasi dengan <strong>Midtrans</strong>.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">
        1. Kondisi Pengajuan Refund
      </h2>
      <p className="mb-4">
        Anda dapat mengajukan pengembalian dana apabila memenuhi salah satu
        kondisi berikut:
      </p>
      <ul className="list-disc pl-6 mb-4 space-y-2">
        <li>Produk yang diterima rusak atau cacat.</li>
        <li>Produk yang diterima tidak sesuai dengan pesanan.</li>
        <li>
          Pesanan dibatalkan sesuai dengan ketentuan yang berlaku sebelum proses
          pengiriman.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">
        2. Batas Waktu Pengajuan
      </h2>
      <p className="mb-4">
        Permintaan refund harus diajukan maksimal <strong>3 (tiga) hari</strong>
        setelah Anda menerima produk, atau dalam waktu yang ditentukan di
        halaman detail produk. Lewat dari batas waktu tersebut, kami berhak
        menolak pengajuan refund.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">
        3. Prosedur Pengajuan Refund
      </h2>
      <p className="mb-4">
        Untuk mengajukan pengembalian dana, silakan ikuti langkah berikut:
      </p>
      <ul className="list-disc pl-6 mb-4 space-y-2">
        <li>
          Hubungi layanan pelanggan kami di{" "}
          <a
            href="mailto:info@apoteksehat.com"
            className="text-teal-600 underline"
          >
            info@apoteksehat.com
          </a>{" "}
          atau WhatsApp ke{" "}
          <span className="font-medium">+62 853 8112 8438</span>.
        </li>
        <li>
          Sertakan bukti transaksi (invoice) yang didapatkan dari email Midtrans
          atau halaman riwayat pesanan Anda.
        </li>
        <li>Sertakan foto/video produk yang bermasalah (jika relevan).</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">
        4. Proses dan Waktu Refund
      </h2>
      <p className="mb-4">
        Setelah pengajuan diverifikasi, kami akan memproses refund melalui
        sistem Midtrans ke metode pembayaran yang Anda gunakan saat
        bertransaksi. Proses pengembalian dana biasanya memerlukan waktu:
      </p>
      <ul className="list-disc pl-6 mb-4 space-y-2">
        <li>
          <strong>Transfer Bank / Virtual Account:</strong> 3–7 hari kerja.
        </li>
        <li>
          <strong>Kartu Kredit:</strong> 7–14 hari kerja (tergantung bank
          penerbit).
        </li>
        <li>
          <strong>e-Wallet (OVO, GoPay, ShopeePay, dll.):</strong> 1–3 hari
          kerja.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">5. Catatan Penting</h2>
      <ul className="list-disc pl-6 mb-4 space-y-2">
        <li>Kami tidak memungut biaya apapun untuk proses refund.</li>
        <li>
          Kami tidak bertanggung jawab atas keterlambatan yang disebabkan oleh
          pihak bank atau penyedia layanan pembayaran.
        </li>
        <li>
          Kami berhak menolak refund jika produk telah digunakan, tidak lengkap,
          atau tidak memenuhi syarat di atas.
        </li>
      </ul>

      <p className="mt-8">
        Dengan melakukan transaksi di <strong>Apotek Antares</strong>, Anda
        dianggap telah membaca, memahami, dan menyetujui kebijakan pengembalian
        dana ini. Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk
        menghubungi kami.
      </p>
    </div>
  );
}

export default KebijakanPengembalianDana;
