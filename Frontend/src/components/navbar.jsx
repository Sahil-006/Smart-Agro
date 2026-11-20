import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useTheme } from "../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
  FaHome,
  FaTachometerAlt,
  FaChartLine,
  FaUserCircle,
  FaSun,
  FaMoon,
  FaSignOutAlt,
  FaInfoCircle,
  FaEnvelope,
} from "react-icons/fa";
import LanguageSwitcher from "./LanguageSwitcher";
import { springSmooth } from "../constants/motion";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileCoords, setProfileCoords] = useState({ top: 0, left: 0 });
  const profileButtonRef = useRef(null);

  // Shrink-on-scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile menu on route change or Escape
  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate("/login");
  };

  const openProfileMenu = () => {
    if (profileButtonRef.current) {
      const rect = profileButtonRef.current.getBoundingClientRect();
      setProfileCoords({
        top: rect.bottom + 8,
        left: Math.max(16, rect.right - 250),
      });
    }
    setProfileOpen((prev) => !prev);
  };

  const navLinks = [
    { to: "/", label: t("navbar.home"), key: "home" },
    ...(isAuthenticated
      ? [{ to: "/dashboard", label: t("navbar.dashboard"), key: "dashboard" }]
      : []),
    { to: "/about", label: t("navbar.about"), key: "about" },
    { to: "/contact", label: t("navbar.contact"), key: "contact" },
  ];

  // Mobile Bottom Tab Bar items
  const mobileTabs = [
    {
      to: "/",
      label: t("navbar.home"),
      icon: FaHome,
      isActive: location.pathname === "/",
    },
    {
      to: isAuthenticated ? "/dashboard" : "/login",
      label: t("navbar.dashboard"),
      icon: FaTachometerAlt,
      isActive: location.pathname.startsWith("/dashboard"),
    },
    {
      to: isAuthenticated ? "/insights/soil" : "/login",
      label: t("navbar.insights"),
      icon: FaChartLine,
      isActive: location.pathname.startsWith("/insights"),
    },
    {
      to: isAuthenticated ? "/profile" : "/login",
      label: isAuthenticated ? (user?.username || "Profile") : t("navbar.login"),
      icon: FaUserCircle,
      isActive: location.pathname === "/profile" || location.pathname === "/login",
    },
  ];

  const portalRoot = typeof document !== "undefined" ? document.getElementById("portal-root") || document.body : null;

  return (
    <>
      {/* =========================================================================
          DESKTOP FLOATING CAPSULE NAVBAR (>= md)
          ========================================================================= */}
      <header className="fixed top-3 inset-x-0 mx-auto max-w-5xl z-40 px-4 transition-all duration-300">
        <div
          className={`glass-strong border border-white/70 dark:border-white/10 rounded-full px-5 flex items-center justify-between transition-all duration-300 ${
            scrolled ? "py-2 shadow-2xl backdrop-blur-2xl" : "py-2.5 shadow-lg"
          }`}
        >
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group outline-none select-none"
            aria-label="SmartAgro Home"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-105 transition-transform">
              SA
            </div>
            <span className="font-extrabold text-base md:text-lg tracking-tight bg-gradient-to-r from-emerald-800 to-green-700 dark:from-emerald-300 dark:to-green-400 bg-clip-text text-transparent">
              Smart-Agro
            </span>
          </Link>

          {/* Desktop Nav Links with Sliding Active Pill */}
          <nav className="hidden md:flex items-center gap-1 relative" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;

              return (
                <Link
                  key={link.key}
                  to={link.to}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-colors duration-200 ${
                    isActive
                      ? "text-emerald-950 dark:text-emerald-100"
                      : "text-slate-800 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="desktop-nav-pill"
                      transition={springSmooth}
                      className="absolute inset-0 bg-emerald-500/20 dark:bg-emerald-400/20 rounded-full -z-10 border border-emerald-600/30 dark:border-emerald-500/25"
                    />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle (Light / Dark) */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
              className="w-9 h-9 rounded-full glass-pill flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/80 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <motion.div
                key={resolvedTheme}
                initial={{ rotate: -90, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={springSmooth}
              >
                {resolvedTheme === "dark" ? (
                  <FaSun className="text-amber-400 text-sm" />
                ) : (
                  <FaMoon className="text-slate-700 text-sm" />
                )}
              </motion.div>
            </button>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Auth Buttons / Avatar */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  ref={profileButtonRef}
                  type="button"
                  onClick={openProfileMenu}
                  aria-label="User Account Menu"
                  aria-expanded={profileOpen}
                  className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-green-600 text-white font-bold text-xs flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer border border-white/40"
                >
                  {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-800 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60 transition"
                >
                  {t("navbar.login")}
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 shadow-sm transition"
                >
                  {t("navbar.signup")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          MOBILE FLOATING BOTTOM TAB BAR (iOS Dock Style) (< md)
          ========================================================================= */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-3 inset-x-3 z-40 md:hidden select-none"
      >
        <div className="glass-strong border border-slate-900/10 dark:border-white/10 rounded-2xl p-1.5 shadow-2xl flex items-center justify-around backdrop-blur-2xl">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.label}
                to={tab.to}
                className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all min-h-[44px] min-w-[56px] ${
                  tab.isActive
                    ? "text-emerald-950 dark:text-emerald-300 font-extrabold"
                    : "text-slate-800 dark:text-slate-400 font-bold hover:text-emerald-700"
                }`}
              >
                {tab.isActive && (
                  <motion.div
                    layoutId="mobile-nav-pill"
                    transition={springSmooth}
                    className="absolute inset-0 bg-emerald-500/20 dark:bg-emerald-400/20 rounded-xl -z-10 border border-emerald-600/30"
                  />
                )}
                <Icon className="text-lg mb-0.5" aria-hidden="true" />
                <span className="text-[11px] leading-tight truncate max-w-[70px]">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* =========================================================================
          PROFILE DROPDOWN VIA PORTAL
          ========================================================================= */}
      {portalRoot &&
        createPortal(
          <AnimatePresence>
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-[9998]"
                  onClick={() => setProfileOpen(false)}
                  aria-hidden="true"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={springSmooth}
                  style={{
                    position: "fixed",
                    top: `${profileCoords.top}px`,
                    left: `${profileCoords.left}px`,
                    width: "250px",
                    zIndex: 9999,
                  }}
                  className="glass-strong border border-white/80 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl"
                  role="menu"
                >
                  {/* User Profile Header */}
                  <div className="p-3.5 border-b border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/40">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
                        {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {user?.fullName || user?.username}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          @{user?.username}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-1.5 flex flex-col gap-0.5">
                    <Link
                      to="/profile"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition min-h-[36px]"
                    >
                      <FaUserCircle className="text-emerald-600 text-sm shrink-0" />
                      <span>{t("profile_dropdown.view_profile")}</span>
                    </Link>

                    <Link
                      to="/about"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition min-h-[36px]"
                    >
                      <FaInfoCircle className="text-emerald-600 text-sm shrink-0" />
                      <span>{t("navbar.about")}</span>
                    </Link>

                    <Link
                      to="/contact"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition min-h-[36px]"
                    >
                      <FaEnvelope className="text-emerald-600 text-sm shrink-0" />
                      <span>{t("navbar.contact")}</span>
                    </Link>

                    <div className="h-px bg-slate-200/50 dark:bg-white/10 my-1" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition min-h-[36px] w-full text-left cursor-pointer"
                    >
                      <FaSignOutAlt className="text-sm shrink-0" />
                      <span>{t("profile_dropdown.logout")}</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          portalRoot
        )}
    </>
  );
}

export default Navbar;
