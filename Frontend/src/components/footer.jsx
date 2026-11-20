import { FaLinkedin, FaGithub, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full max-w-6xl mx-auto px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-6">
      <div className="glass-card p-6 md:p-8 rounded-[28px] border border-slate-900/10 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 select-none">
        {/* Brand & Mission */}
        <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
              SA
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-950 dark:text-slate-50">
              Smart Agro-Solar™
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium max-w-md">
            Empowering modern agriculture through AI-driven leaf diagnosis, real-time IoT soil telemetry, and clean solar intelligence.
          </p>
        </div>

        {/* Quick Nav Links */}
        <div className="flex items-center gap-4 text-xs font-bold text-slate-800 dark:text-slate-200">
          <Link to="/" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
            Home
          </Link>
          <Link to="/about" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
            About Us
          </Link>
          <Link to="/contact" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
            Contact
          </Link>
        </div>

        {/* Social Icons & Copyright */}
        <div className="flex flex-col items-center md:items-end gap-2">
          <div className="flex items-center gap-1.5">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Smart-Agro on LinkedIn"
              className="w-9 h-9 rounded-full glass-pill flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:bg-white transition-all cursor-pointer"
            >
              <FaLinkedin className="text-sm" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Smart-Agro on GitHub"
              className="w-9 h-9 rounded-full glass-pill flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white transition-all cursor-pointer"
            >
              <FaGithub className="text-sm" />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Smart-Agro on X"
              className="w-9 h-9 rounded-full glass-pill flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white transition-all cursor-pointer"
            >
              <FaXTwitter className="text-sm" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Smart-Agro on Instagram"
              className="w-9 h-9 rounded-full glass-pill flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-pink-600 hover:bg-white transition-all cursor-pointer"
            >
              <FaInstagram className="text-sm" />
            </a>
          </div>
          <span className="text-[11px] text-slate-700 dark:text-slate-400 font-medium">
            © {currentYear} Smart Agro-Solar™. All Rights Reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
