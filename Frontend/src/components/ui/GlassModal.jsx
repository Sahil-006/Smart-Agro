import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { springSmooth } from "../../constants/motion";

/**
 * Universal Apple Liquid Glass Modal & iOS Bottom Sheet
 * Automatically renders as a bottom sheet on mobile (< 768px) and a centered modal on desktop.
 * Uses createPortal to break free from parent stacking contexts.
 */
export function GlassModal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
  showCloseButton = true,
}) {
  const modalRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (typeof document === "undefined") return null;
  const portalRoot = document.getElementById("portal-root") || document.body;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-slate-950/45 dark:bg-black/65 backdrop-blur-md transition-opacity"
          />

          {/* Modal / Bottom Sheet Content */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={springSmooth}
            className={`relative z-10 w-full ${maxWidth} glass-strong border border-slate-900/10 dark:border-white/10
                       rounded-t-[32px] md:rounded-[28px] shadow-2xl p-6 md:p-8
                       max-h-[90dvh] overflow-y-auto pb-safe`}
          >
            {/* Mobile Grab Handle Indicator */}
            <div className="md:hidden flex justify-center pb-3">
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
              {title && (
                <h3
                  id="modal-title"
                  className="text-lg md:text-xl font-black tracking-tight text-slate-950 dark:text-slate-50"
                >
                  {title}
                </h3>
              )}

              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="ml-auto w-9 h-9 rounded-full flex items-center justify-center
                             text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-100
                             hover:bg-slate-200/70 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <FaTimes className="text-base" />
                </button>
              )}
            </div>

            {/* Body */}
            <div className="mt-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    portalRoot
  );
}

export default GlassModal;
