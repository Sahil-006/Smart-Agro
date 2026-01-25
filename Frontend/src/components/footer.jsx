import React from "react";
import { FaLinkedin, FaGithub, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-200 shadow-sm px-6 py-3 
                       flex flex-col sm:flex-row items-center justify-between
                       text-gray-500 text-sm">

      {/* LEFT */}
      <span className="text-center sm:text-left">
        © 2025{" "}
        <span className="font-medium text-gray-700">
          Smart Agro-Solar™
        </span>{" "}
        . All Rights Reserved.
      </span>

      {/* RIGHT - SOCIALS */}
      <div className="flex items-center gap-6 mt-2 sm:mt-0 text-xl">
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
          className="hover:text-gray-900 transition"
        >
          <FaGithub />
        </a>

        <a
          href="https://x.com/your-profile"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-500 transition"
          aria-label="X"
        >
          <FaXTwitter />
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
