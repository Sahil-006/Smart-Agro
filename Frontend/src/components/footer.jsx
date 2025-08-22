import React from "react";
import { Link } from "react-router-dom";
import { FaLinkedin, FaGithub,  FaInstagram } from "react-icons/fa";
import { FaXTwitter } from 'react-icons/fa6'; // ✅ updated icon from FontAwesome 6


const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 z-20 w-full p-2 bg-white border-t border-gray-200 shadow-sm flex items-center justify-between dark:bg-gray-800 dark:border-gray-600">
      <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
        © 2025{" "}
        <a href="#" className="hover:underline font-medium">
          Smart Agro-Solar™
        </a>
        . All Rights Reserved.
      </span>

      <div className="flex items-center gap-7 mt-3 sm:mt-0 text-gray-500 dark:text-gray-400 text-xl">
        <a
          href="https://linkedin.com/in/your-profile"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-600 transition"
        >
          <FaLinkedin />
        </a>
        <a
          href="https://github.com/your-username"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-900 dark:hover:text-white transition"
        >
          <FaGithub />
        </a>
        <a
          href="https://x.com/your-profile"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-400 transition"
          aria-label="X"
        >
          <FaXTwitter className="text-xl" />
        </a>

        <a
          href="https://instagram.com/your-profile"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-pink-500 transition"
        >
          <FaInstagram />
        </a>
      </div>
    </footer>
  );
};

export default Footer;