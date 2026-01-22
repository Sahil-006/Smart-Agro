import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useState } from "react";
import i18n from "i18next";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const languages = [
    { code: "en", label: "EN" },
    { code: "hi", label: "हिं" },
    { code: "gu", label: "ગુ" },
  ];

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
      <div className="backdrop-blur-md bg-white/70 dark:bg-black/30 border border-gray-200 dark:border-white/10 shadow-xl rounded-full px-6 py-3 flex justify-between items-center">

        {/* LOGO */}
        <Link to="/" className="text-xl font-bold text-green-700">
          SmartAgro
        </Link>

        {/* NAV LINKS */}
        <nav className="flex gap-6 font-medium items-center">
          <Link to="/">Home</Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="hover:text-green-700">
              Dashboard
            </Link>
          )}
          <Link to="/about" className="hover:text-green-700">
            About Us
          </Link>
          <Link to="/contact" className="hover:text-green-700">
            Contact Us
          </Link>

          {/* AUTH SECTION */}
          {isAuthenticated ? (
            <div className="flex items-center gap-4 relative">

              {/* 🌐 LANGUAGE SWITCHER */}
              <div className="relative">
                <button
                  onClick={() => {
                    setLangOpen(!langOpen);
                    setProfileOpen(false);
                  }}
                  className="px-3 py-1 border rounded-full text-sm hover:bg-white/60"
                >
                  🌐 {i18n.language?.toUpperCase() || "EN"}
                </button>

                {langOpen && (
                  <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border w-28 overflow-hidden">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          i18n.changeLanguage(lang.code);
                          setLangOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 👤 PROFILE DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => {
                    setProfileOpen(!profileOpen);
                    setLangOpen(false);
                  }}
                  className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold"
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border overflow-hidden">
                    <div className="px-4 py-3 border-b">
                      <p className="font-semibold text-gray-800">
                        {user?.fullName || user?.username}
                      </p>
                      <p className="text-sm text-gray-500">
                        @{user?.username}
                      </p>
                      <p className="text-xs text-gray-400">
                        {user?.email}
                      </p>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate("/profile");
                          setProfileOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        View Profile
                      </button>

                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="hover:text-green-700">
                Login
              </Link>
              <Link to="/signup" className="hover:text-green-700">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
