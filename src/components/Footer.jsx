// src/components/Footer.jsx

import React from 'react';
import { Twitter, Linkedin, Github, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    // Footer menggunakan background putih atau sangat muda (gray-50) agar clean, 
    // dan padding yang cukup besar.
    <footer className="bg-gray-400 border-t border-gray-100">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          
          {/* Col 1: Brand & Description */}
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center text-2xl font-extrabold text-emerald-600">
              {/* Mengganti logo dengan teks sederhana untuk konsistensi */}
              LCode
            </div>
            <p className="max-w-xs mt-4 text-sm text-gray-500">
              Adaptive learning for faster dev career. Master coding, build your future.
            </p>
          </div>

          {/* Col 2: Product Links */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-900 uppercase">Product</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#languages" className="text-base text-gray-500 transition duration-150 hover:text-emerald-600">Languages</a></li>
              <li><a href="#leaderboard" className="text-base text-gray-500 transition duration-150 hover:text-emerald-600">Leaderboard</a></li>
              <li><a href="#" className="text-base text-gray-500 transition duration-150 hover:text-emerald-600">Pricing</a></li>
              <li><a href="#" className="text-base text-gray-500 transition duration-150 hover:text-emerald-600">Features</a></li>
            </ul>
          </div>

          {/* Col 3: Company Links */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-900 uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className="text-base text-gray-500 transition duration-150 hover:text-emerald-600">About</a></li>
              <li><a href="#" className="text-base text-gray-500 transition duration-150 hover:text-emerald-600">Careers</a></li>
              <li><a href="#" className="text-base text-gray-500 transition duration-150 hover:text-emerald-600">Blog</a></li>
              <li><a href="#" className="text-base text-gray-500 transition duration-150 hover:text-emerald-600">Contact Us</a></li>
            </ul>
          </div>
          
          {/* Col 4: Legal Links */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-900 uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className="text-base text-gray-500 transition duration-150 hover:text-emerald-600">Privacy Policy</a></li>
              <li><a href="#" className="text-base text-gray-500 transition duration-150 hover:text-emerald-600">Terms of Service</a></li>
            </ul>
          </div>

        </div>

        {/* Separator dan Copyright */}
        <div className="flex flex-wrap items-center justify-between pt-8 mt-12 border-t border-gray-100">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} LCode. All rights reserved.
          </p>
          
          {/* Social Icons */}
          <div className="flex mt-4 space-x-6 md:mt-0">
            <a href="#" className="text-gray-400 transition duration-150 hover:text-emerald-600">
              <Twitter className="w-6 h-6" />
            </a>
            <a href="#" className="text-gray-400 transition duration-150 hover:text-emerald-600">
              <Linkedin className="w-6 h-6" />
            </a>
            <a href="#" className="text-gray-400 transition duration-150 hover:text-emerald-600">
              <Github className="w-6 h-6" />
            </a>
            <a href="#" className="text-gray-400 transition duration-150 hover:text-emerald-600">
              <Mail className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;