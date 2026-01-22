import { useState, useRef, useEffect } from "react";
import i18n from "i18next";
import { motion, AnimatePresence } from "framer-motion";
import { FaGlobe } from "react-icons/fa";

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "gu", label: "ગુજરાતી" },
];

const LanguageSwitcher = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang = i18n.language || "en";

  return (
    <div className="relative" ref={ref}>
      {/* Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => setOpen(!open)}
        className="px-3 py-1.5 border rounded-full text-sm 
                   hover:bg-white/60 backdrop-blur-md 
                   flex items-center gap-2 transition shadow-sm"
      >
        <FaGlobe className="text-green-600" />
        <span className="font-medium uppercase">{currentLang}</span>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-44 bg-white rounded-xl 
                       shadow-xl border overflow-hidden z-50"
          >
            {languages.map((lang) => {
              const isActive = currentLang === lang.code;

              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-sm text-left flex items-center justify-between
                    transition
                    ${isActive 
                      ? "bg-green-50 text-green-700 font-semibold" 
                      : "hover:bg-gray-50 text-gray-700"}
                  `}
                >
                  <span>{lang.label}</span>
                  {isActive && <span className="text-green-600">✓</span>}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
