import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { FaGlobe, FaCheck } from "react-icons/fa";
import { springSmooth } from "../constants/motion";

const languages = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
];

export function LanguageSwitcher({ className = "" }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0, width: 180 });
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const currentLang = i18n.language || "en";

  // Position calculation relative to viewport
  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownWidth = 190;
    const dropdownHeight = 160;

    // Check if dropdown would overflow the bottom of the viewport
    const openUpwards = rect.bottom + dropdownHeight > window.innerHeight && rect.top > dropdownHeight;

    setDropdownCoords({
      top: openUpwards ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
      left: Math.max(12, Math.min(rect.right - dropdownWidth, window.innerWidth - dropdownWidth - 16)),
      width: dropdownWidth,
    });
  }, []);

  useEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
    }
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  // Handle outside clicks
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Keyboard navigation: Escape, ArrowDown, ArrowUp, Enter
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % languages.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + languages.length) % languages.length);
      } else if (e.key === "Enter" && focusedIndex >= 0) {
        e.preventDefault();
        const selected = languages[focusedIndex];
        if (selected) {
          i18n.changeLanguage(selected.code);
          try {
            localStorage.setItem("lang", selected.code);
          } catch {
            // ignore
          }
          setOpen(false);
          buttonRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, focusedIndex, i18n]);

  const selectLanguage = (code) => {
    i18n.changeLanguage(code);
    try {
      localStorage.setItem("lang", code);
    } catch {
      // ignore
    }
    setOpen(false);
    buttonRef.current?.focus();
  };

  const portalRoot = typeof document !== "undefined" ? document.getElementById("portal-root") || document.body : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          setFocusedIndex(-1);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select interface language"
        className={`glass-pill px-3 py-1.5 text-xs font-semibold tracking-wide flex items-center gap-1.5
                    text-slate-800 dark:text-slate-100 hover:bg-white/80 dark:hover:bg-slate-800/80
                    active:scale-95 transition-all duration-200 cursor-pointer min-h-[36px] ${className}`}
      >
        <FaGlobe className="text-emerald-600 dark:text-emerald-400 text-sm" aria-hidden="true" />
        <span className="uppercase font-bold">{currentLang}</span>
      </button>

      {portalRoot &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={dropdownRef}
                role="listbox"
                aria-label="Languages"
                style={{
                  position: "fixed",
                  top: `${dropdownCoords.top}px`,
                  left: `${dropdownCoords.left}px`,
                  width: `${dropdownCoords.width}px`,
                  zIndex: 9999,
                }}
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={springSmooth}
                className="glass-strong border border-slate-900/10 dark:border-white/10 rounded-2xl shadow-2xl p-1.5 overflow-hidden backdrop-blur-2xl"
              >
                {languages.map((lang, index) => {
                  const isActive = currentLang === lang.code;
                  const isKeyboardFocused = focusedIndex === index;

                  return (
                    <button
                      key={lang.code}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => selectLanguage(lang.code)}
                      className={`w-full px-3 py-2 text-left rounded-xl transition-all duration-150 flex items-center justify-between cursor-pointer min-h-[40px] ${
                        isActive
                          ? "bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 font-bold"
                          : isKeyboardFocused
                          ? "bg-slate-100/90 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 font-bold"
                          : "text-slate-800 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold leading-tight">{lang.native}</span>
                        <span className="text-[10px] text-slate-700 dark:text-slate-400 font-semibold">{lang.label}</span>
                      </div>
                      {isActive && (
                        <FaCheck className="text-emerald-700 dark:text-emerald-400 text-xs shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>,
          portalRoot
        )}
    </>
  );
}

export default LanguageSwitcher;
