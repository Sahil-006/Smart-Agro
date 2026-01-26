import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useState, useRef, useEffect } from "react";
import i18n from "i18next";
import { FaUserCircle, FaSignOutAlt, FaGlobe } from "react-icons/fa"; // Added FaGlobe for minimalism
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const profileRef = useRef(null);
  const langRef = useRef(null);
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिंदी" },
    { code: "gu", label: "ગુજરાતી" },
  ];

  /* 🔒 Close dropdowns on outside click */
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
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
      <div className="backdrop-blur-md bg-white/70 dark:bg-black/30 border border-gray-200 dark:border-white/10 shadow-xl rounded-full px-6 py-3 flex justify-between items-center">

        {/* LOGO */}
        <Link to="/" className="text-xl font-black text-gray-900 tracking-tight italic">
          SmartAgro
        </Link>

        {/* NAV LINKS & ACTIONS */}
        <nav className="flex gap-6 font-medium items-center">
          <Link to="/">{t("navbar.home")}</Link>

          {isAuthenticated && (
            <Link to="/dashboard" className="hover:text-green-700">
              {t("navbar.dashboard")}
            </Link> 
          )}

          <Link to="/about" className="hover:text-green-700">
            {t("navbar.about")}
          </Link>

          <Link to="/contact" className="hover:text-green-700">
            {t("navbar.contact")}
          </Link>

          {/* --- 🌐 LANGUAGE SWITCHER (Always Visible) --- */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => {
                setLangOpen(!langOpen);
                setProfileOpen(false);
              }}
              className="px-2 py-1 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-white hover:text-green-700 flex items-center gap-1 transition"
              title="Change Language"
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
                  className={`block w-full px-4 py-2 text-sm text-left transition hover:bg-green-50
                    ${i18n.language === lang.code ? "text-green-700 font-bold bg-green-50/50" : "text-gray-600"}
                  `}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* --- AUTH SECTION --- */}
          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              {/* Avatar Button */}
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setLangOpen(false);
                }}
                className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold 
                           shadow-md hover:scale-105 transition-transform duration-200"
                aria-label={t("profile_dropdown.aria_label")}
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
                    className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm 
                               hover:bg-green-50 transition"
                  >
                    <FaUserCircle className="text-green-600" />
                    {t("profile_dropdown.view_profile")}
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm 
                               text-red-600 hover:bg-red-50 transition"
                  >
                    <FaSignOutAlt />
                    {t("profile_dropdown.logout")}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="hover:text-green-700">
                 {t("navbar.login")}
              </Link>
              <Link to="/signup" className="hover:text-green-700">
                 {t("navbar.signup")}
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Navbar;