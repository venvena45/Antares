import React from 'react';
import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';

const DraggableWhatsAppButton = () => {
  const phoneNumber = "6285381128438";
  const whatsappLink = `https://wa.me/${phoneNumber}?text=Halo, saya ingin berkonsultasi.`;

  return (
    <motion.div
      drag
      dragConstraints={{
        top: 10,
        left: 10,
        right: window.innerWidth - 70,
        bottom: window.innerHeight - 70,
      }}
      dragMomentum={false}
      whileTap={{ scale: 1.1, cursor: 'grabbing' }}
      className="fixed bottom-8 right-8 z-[1000] cursor-grab w-[60px] h-[60px] bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl"
      title="Konsultasi via WhatsApp"
    >
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full h-full flex items-center justify-center"
      >
        <FaWhatsapp className="text-white text-3xl" />
      </a>
    </motion.div>
  );
};

export default DraggableWhatsAppButton;