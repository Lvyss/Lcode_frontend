import React, { useEffect, useRef, useState, memo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom'; // Import useNavigate

/* ======================================= */
/* 1. CUSTOM HOOKS 🛠️                   */
/* ======================================= */

// Hook untuk menghitung dan mengatur 1vh agar responsif di mobile
function useVh() {
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVH();
    window.addEventListener("resize", setVH);
    return () => window.removeEventListener("resize", setVH);
  }, []);
}

// Hook untuk menyembunyikan elemen saat scroll ke bawah
function useHideOnScroll(threshold = 100) {
  const lastY = useRef(0);
  const ticking = useRef(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    function onScroll() {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          if (currentY > lastY.current && currentY > threshold) {
            setVisible(false);
          } else {
            setVisible(true);
          }
          lastY.current = currentY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return visible;
}


/* ======================================= */
/* 2. KOMPONEN PEMBANTU 🖼️              */
/* ======================================= */

/**
 * Komponen untuk memuat Spline 3D menggunakan IFRAME
 */
function LazyIframe({ src, placeholderDelay = 2000 }) {
  const [loading, setLoading] = useState(true);
  const [shouldRender, setShouldRender] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setShouldRender(true);
      setLoading(false);
    }, placeholderDelay);

    return () => clearTimeout(timeoutRef.current);
  }, [placeholderDelay]);

  return (
    <div className="flex items-center justify-center w-full h-full">
      {loading && (
        <div className="flex items-center justify-center w-full h-full">
          <div className="w-10 h-10 border-4 border-gray-200 rounded-full border-t-emerald-500 animate-spin" />
        </div>
      )}

      {shouldRender && (
        <motion.iframe
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
          src={src}
          frameBorder="0"
          // ✅ PERUBAHAN PENTING: pointer-events-auto dan z-index lebih tinggi
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                     w-[110%] h-[110%] md:w-[70%] md:h-[70%] scale-[1.1] md:scale-100 
                     pointer-events-auto z-20" // ✅ pointer-events-auto & z-20
          allow="autoplay; fullscreen"
          title="lcode-3d-background"
        />
      )}
    </div>
  );
}


/**
 * Teks Sudut (Detail Ocmba Style)
 */
const CornerDetails = memo(function CornerDetails() {
    // Teks Vertikal Kiri
    const LeftSidebarText = () => (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            // Fix: left-0 di mobile untuk menghindari dorongan scroll horizontal
            className="absolute top-0 left-0 z-30 flex items-center h-full pointer-events-none md:left-10" 
        >
            <p 
                // Fix: translate-x untuk rotasi agar aman
                className="text-[10px] text-gray-700/80 tracking-[0.2em] uppercase font-light 
                           transform -rotate-90 origin-bottom-left whitespace-nowrap font-satoshi
                           translate-x-3 md:translate-x-0" 
                style={{ letterSpacing: '0.25em' }} 
            >
                ADAPTIVE • INTELLIGENT • PRECISE
            </p>
        </motion.div>
    );

    // Teks Kanan ATAS (REVISI)
    const TopRightText = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 1.1 }}
            // KUNCI PERUBAHAN: Dipindahkan ke atas. top-[15vh] sejajar dengan konten kiri.
            className="absolute top-[15vh] right-5 md:right-10 z-40 text-right pointer-events-none" 
        >
            <p className="text-[18px] text-gray-800 font-bold tracking-[0.3em] uppercase font-satoshi"> 
                Lcode <span className="text-emerald-600">+</span>
            </p>
            <p className="text-[10px] text-gray-600/70 tracking-widest uppercase font-satoshi"> 
                2025 V1.0 EVOLVE
            </p>
        </motion.div>
    );

    return (
        <>
            <LeftSidebarText />
            <TopRightText /> {/* Panggil komponen yang sudah dipindahkan */}
        </>
    );
});


/**
 * Footer disesuaikan untuk background terang
 */
function Footer({ visible }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="absolute left-0 z-30 w-full text-gray-700 bottom-4 font-satoshi" 
    >
      <div className="pl-[5%] pr-[5%] flex justify-between items-center text-[10px] uppercase tracking-widest">
        <p>MASTER YOUR SKILLS • SMARTER LEARNING</p>
        <p>|| 2025</p>
      </div>

      <div className="w-full h-[1px] bg-gray-300 my-2" /> 

      <div className="pl-[5%] pr-[5%] flex justify-between items-center text-[10px] tracking-wider">
        <p>SCROLL TO EXPLORE LANGUAGES</p>
        <div className="flex gap-2">
          <span className="w-1 h-1 rounded-full bg-gray-400/50" />
          <span className="w-1 h-1 rounded-full bg-gray-500/80" />
          <span className="w-1 h-1 bg-gray-700 rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}


/* ======================================= */
/* 3. MAIN HEROSECTION 🖼️              */
/* ======================================= */

const HeroSection = () => {
  useVh();
  const footerVisible = useHideOnScroll(100);
  const navigate = useNavigate(); 

  // Animasi untuk teks dan tombol
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  // Animasi stagger untuk container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, 
        delayChildren: 0.5  
      }
    }
  };

  return (
    <section
      id="home"
      // Fix: overflow-x-hidden untuk mencegah scroll horizontal
      className="relative w-full h-[calc(var(--vh,1vh)*100)] overflow-hidden overflow-x-hidden bg-[#FFFFFF] flex items-center justify-center" 
    >
      {/* 1. Background Dinamis Ocmba Style: Gradient Vertikal Bawah ke Atas */}
      <div 
        className="absolute inset-0"
        style={{
           background: `linear-gradient(to top, #66BB6A 0%, #A5D6A7 50%, #FFFFFF 100%)`, 
        }}
      />
      
      {/* 2. Layer Kedalaman (Blob Blur) */}
      <div className="absolute inset-0 pointer-events-none">
          {/* A. Blob Cahaya Biru/Putih Lebar */}
          <div 
            className="absolute top-1/2 left-1/2 w-[120vw] h-[70vh] rounded-full"
            style={{
                background: 'rgba(240, 248, 255, 0.4)', 
                filter: 'blur(200px)',
                opacity: 0.9,
                transform: 'translate(-50%, -50%) rotate(0deg) scale(1.5)', 
                zIndex: 10,
            }}
          />
        
          {/* B. Blob Cahaya Hijau/Emerald */}
          <div 
            className="absolute top-[45%] left-[50%] w-[50vw] h-[50vw] rounded-full"
            style={{
                background: 'rgba(0, 168, 107, 0.08)', 
                filter: 'blur(100px)',
                opacity: 0.9,
                transform: 'translate(-50%, -50%)',
                zIndex: 11,
            }}
          />
      </div>

      {/* 3. Objek 3D (Iframe) di Tengah - Tidak ada yang menutupi */}
      <div 
        className="absolute inset-0 z-10 opacity-90" 
      >
        <LazyIframe src="https://my.spline.design/lcode-kQJpXZQCgQqltjCku17A68TM/" />
      </div>
      
      {/* 4. Konten Teks Utama di Kiri Atas */}
      <motion.div 
        className="absolute top-[15vh] left-[5%] md:left-[10%] z-40 text-left max-w-xs" 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Judul Utama */}
        <motion.h1 
          variants={itemVariants}
          className="mb-2 text-3xl font-extrabold leading-tight text-gray-900 md:text-5xl lg:text-5xl font-poppins" 
        >
          Master <span className="text-emerald-600">Coding</span>.
          <span className="block mt-1">Build Your Future.</span>
        </motion.h1>

        {/* Deskripsi / Tagline */}
        <motion.p 
          variants={itemVariants}
          className="max-w-xs mb-4 text-gray-700 text-md md:text-md font-satoshi" 
        >
          LCode is your interactive playground to learn programming step-by-step.
          Achieve your dev career goals with smart, adaptive lessons.
        </motion.p>
      </motion.div>

      {/* 5. Tombol CTA di Kanan Tengah */}
      <motion.div 
        className="absolute top-1/2 right-[5%] md:right-[10%] -translate-y-1/2 z-40 flex flex-col items-end gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.button
          variants={itemVariants}
          onClick={() => navigate('/auth/callback')}
          className="px-8 py-3 text-lg text-white transition-all duration-300 transform rounded-full shadow-lg bg-emerald-600 font-poppins hover:bg-emerald-700 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-300"
        >
          Start Learning
        </motion.button>
        <motion.button
          variants={itemVariants}
          onClick={() => navigate('/#languages')} 
          className="px-8 py-3 text-lg transition-all duration-300 transform bg-white border rounded-full shadow-lg text-emerald-700 font-poppins border-emerald-300 hover:bg-emerald-50 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-100"
        >
          Explore Languages
        </motion.button>
      </motion.div>

      {/* 6. Elemen Teks Absolut di Sudut dan Sisi (Sekarang TopRightText ada di Kanan Atas) */}
      <CornerDetails />
      
      {/* 7. Footer */}
      <Footer visible={footerVisible} />

    </section>
  );
};

export default HeroSection;