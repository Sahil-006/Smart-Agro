import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useState, useRef, useEffect } from "react";
import i18n from "i18next";
import { FaUserCircle, FaSignOutAlt, FaGlobe, FaBars, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);

  const profileRef = useRef(null);
  const langRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिंदी" },
    { code: "gu", label: "ગુજરાતી" },
  ];

  /* 🔒 Close mobile menu on route change */
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
    setLangOpen(false);
    setMobileLangOpen(false);
  }, [location.pathname]);

  /* 🔒 Close on escape key */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setProfileOpen(false);
        setLangOpen(false);
        setMobileLangOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* 🔒 Prevent body scrolling when mobile menu is open */
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  /* 🔒 Close desktop dropdowns on outside click */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target) &&
        langRef.current &&
        !langRef.current.contains(e.target)
      ) {
        setProfileOpen(false);
        setLangOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-[90%] max-w-5xl">
      <div className="backdrop-blur-md bg-white/80 dark:bg-black/40 border border-gray-200/80 dark:border-white/10 shadow-xl rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex justify-between items-center transition-all">

        {/* LOGO */}
        <Link 
          to="/" 
          className="text-lg sm:text-xl font-black text-gray-900 tracking-tight italic shrink-0 py-1"
          aria-label="SmartAgro Home"
        >
          SmartAgro
        </Link>

        {/* DESKTOP NAV LINKS & ACTIONS (identical to original desktop layout) */}
        <nav className="hidden md:flex gap-6 font-medium items-center">
          <Link to="/" className="hover:text-green-700 transition-colors">
            {t("navbar.home")}
          </Link>

          {isAuthenticated && (
            <Link to="/dashboard" className="hover:text-green-700 transition-colors">
              {t("navbar.dashboard")}
            </Link> 
          )}

          <Link to="/about" className="hover:text-green-700 transition-colors">
            {t("navbar.about")}
          </Link>

          <Link to="/contact" className="hover:text-green-700 transition-colors">
            {t("navbar.contact")}
          </Link>

          {/* --- 🌐 LANGUAGE SWITCHER (Desktop) --- */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => {
                setLangOpen(!langOpen);
                setProfileOpen(false);
              }}
              className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-white hover:text-green-700 flex items-center gap-1.5 transition cursor-pointer"
              title="Change Language"
              aria-expanded={langOpen}
              aria-label="Select Language"
            >
              <FaGlobe /> {i18n.language?.toUpperCase() || "EN"}
            </button>

            <div
              className={`absolute right-0 mt-3 w-32 bg-white rounded-xl shadow-xl border overflow-hidden z-50
                transition-all duration-200 origin-top-right
                ${langOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}
              `}
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    localStorage.setItem("lang", lang.code);
                    setLangOpen(false);
                  }}
                  className={`block w-full px-4 py-2 text-sm text-left transition hover:bg-green-50 cursor-pointer
                    ${i18n.language === lang.code ? "text-green-700 font-bold bg-green-50/50" : "text-gray-600"}
                  `}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* --- AUTH SECTION (Desktop) --- */}
          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              {/* Avatar Button */}
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setLangOpen(false);
                }}
                className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold 
                           shadow-md hover:scale-105 transition-transform duration-200 cursor-pointer"
                aria-label={t("profile_dropdown.aria_label")}
                aria-expanded={profileOpen}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </button>

              {/* Dropdown */}
              <div
                className={`absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border overflow-hidden z-50
                  transition-all duration-200 origin-top-right
                  ${profileOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}
                `}
              >
                {/* Header */}
                <div className="px-4 py-4 border-b bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 leading-tight">
                        {user?.fullName || user?.username}
                      </p>
                      <p className="text-xs text-gray-500">@{user?.username}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 truncate">{user?.email}</p>
                </div>

                {/* Actions */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setProfileOpen(false);
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm 
                               hover:bg-green-50 transition cursor-pointer"
                  >
                    <FaUserCircle className="text-green-600 text-base" />
                    {t("profile_dropdown.view_profile")}
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm 
                               text-red-600 hover:bg-red-50 transition cursor-pointer"
                  >
                    <FaSignOutAlt className="text-base" />
                    {t("profile_dropdown.logout")}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="hover:text-green-700 transition-colors">
                 {t("navbar.login")}
              </Link>
              <Link to="/signup" className="hover:text-green-700 transition-colors">
                 {t("navbar.signup")}
              </Link>
            </>
          )}
        </nav>

        {/* MOBILE CONTROLS (< md) */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Mobile Language Button */}
          <button
            onClick={() => setMobileLangOpen(!mobileLangOpen)}
            className="p-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-white flex items-center gap-1 min-w-[40px] min-h-[40px] justify-center transition"
            aria-label="Change Language"
          >
            <FaGlobe className="text-sm" />
            <span>{i18n.language?.toUpperCase() || "EN"}</span>
          </button>

          {/* Hamburger Menu Toggle Button (Min 44x44px target) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-11 h-11 flex items-center justify-center rounded-full text-gray-800 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition cursor-pointer"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
          </button>
        </div>

      </div>

      {/* MOBILE LANGUAGE DROPDOWN (< md) */}
      {mobileLangOpen && (
        <div 
          className="md:hidden absolute right-4 mt-2 w-44 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 p-1 animate-in fade-in zoom-in-95 duration-150"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                localStorage.setItem("lang", lang.code);
                setMobileLangOpen(false);
              }}
              className={`block w-full px-4 py-3 text-sm text-left rounded-xl transition min-h-[44px] flex items-center justify-between
                ${i18n.language === lang.code ? "text-green-700 font-bold bg-green-50" : "text-gray-700 hover:bg-gray-50"}
              `}
            >
              <span>{lang.label}</span>
              {i18n.language === lang.code && <span className="text-green-600 text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}

      {/* MOBILE DRAWER OVERLAY & MENU (< md) */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Menu Panel */}
          <div
            ref={mobileMenuRef}
            className="relative z-50 mt-3 w-full bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-3xl p-5 overflow-hidden max-h-[calc(100dvh-90px)] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
          >
            {/* Authenticated user preview in mobile drawer */}
            {isAuthenticated && (
              <div className="flex items-center gap-3 p-3 mb-4 bg-green-50 rounded-2xl border border-green-100">
                <div className="w-11 h-11 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 truncate">
                    {user?.fullName || user?.username}
                  </p>
                  <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
                </div>
              </div>
            )}

            {/* Mobile Navigation Links (Each with min 44px touch height) */}
            <nav className="flex flex-col space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-2xl text-base font-semibold transition min-h-[44px] ${
                  location.pathname === "/" ? "bg-green-600 text-white" : "text-gray-800 hover:bg-green-50 hover:text-green-700"
                }`}
              >
                {t("navbar.home")}
              </Link>

              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-2xl text-base font-semibold transition min-h-[44px] ${
                    location.pathname === "/dashboard" ? "bg-green-600 text-white" : "text-gray-800 hover:bg-green-50 hover:text-green-700"
                  }`}
                >
                  {t("navbar.dashboard")}
                </Link>
              )}

              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-2xl text-base font-semibold transition min-h-[44px] ${
                  location.pathname === "/about" ? "bg-green-600 text-white" : "text-gray-800 hover:bg-green-50 hover:text-green-700"
                }`}
              >
                {t("navbar.about")}
              </Link>

              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-2xl text-base font-semibold transition min-h-[44px] ${
                  location.pathname === "/contact" ? "bg-green-600 text-white" : "text-gray-800 hover:bg-green-50 hover:text-green-700"
                }`}
              >
                {t("navbar.contact")}
              </Link>

              {isAuthenticated && (
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold transition min-h-[44px] ${
                    location.pathname === "/profile" ? "bg-green-600 text-white" : "text-gray-800 hover:bg-green-50 hover:text-green-700"
                  }`}
                >
                  <FaUserCircle className="text-lg" />
                  {t("profile_dropdown.view_profile")}
                </Link>
              )}
            </nav>

            {/* Mobile Auth Actions */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl text-base font-bold text-red-600 bg-red-50 hover:bg-red-100 transition min-h-[44px] cursor-pointer"
                >
                  <FaSignOutAlt />
                  {t("profile_dropdown.logout")}
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-3 rounded-2xl text-center text-sm font-bold text-gray-800 border border-gray-200 hover:bg-gray-50 transition min-h-[44px]"
                  >
                    {t("navbar.login")}
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-3 rounded-2xl text-center text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition min-h-[44px]"
                  >
                    {t("navbar.signup")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;
