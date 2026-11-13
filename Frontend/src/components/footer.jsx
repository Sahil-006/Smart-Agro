import React from "react";
import { FaLinkedin, FaGithub, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-200 shadow-sm px-4 sm:px-6 py-4 sm:py-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] 
                       flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0
                       text-gray-500 text-sm">

      {/* LEFT */}
      <span className="text-center sm:text-left text-xs sm:text-sm">
        © 2025{" "}
        <span className="font-semibold text-gray-700">
          Smart Agro-Solar™
        </span>{" "}
        . All Rights Reserved.
      </span>

      {/* RIGHT - SOCIALS */}
      <div className="flex items-center gap-2 sm:gap-3 text-lg">
        <a
          href="https://linkedin.com/in/your-profile"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-blue-50 hover:text-blue-600 transition"
        >
          <FaLinkedin />
        </a>

        <a
          href="https://github.com/your-username"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 hover:text-gray-900 transition"
        >
          <FaGithub />
        </a>

        <a
          href="https://x.com/your-profile"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X (formerly Twitter)"
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 hover:text-gray-900 transition"
        >
          <FaXTwitter />
        </a>

        <a
          href="https://instagram.com/your-profile"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-pink-50 hover:text-pink-500 transition"
        >
          <FaInstagram />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
