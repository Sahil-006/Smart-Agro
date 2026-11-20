import { motion } from "framer-motion";
import { tapScale } from "../../constants/motion";

/**
 * Universal Apple Liquid Glass Button
 * Standardizes 44px minimum touch targets, spring tactile response, and WCAG AA contrast.
 */
export function GlassButton({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  icon: Icon,
  className = "",
  disabled = false,
  onClick,
  type = "button",
  ...props
}) {
  const sizeClasses = {
    sm: "min-h-[40px] px-3.5 py-1.5 text-xs rounded-xl",
    md: "min-h-[44px] px-5 py-2.5 text-sm rounded-2xl",
    lg: "min-h-[48px] px-6 py-3 text-base rounded-2xl",
  }[size] || "min-h-[44px] px-5 py-2.5 text-sm rounded-2xl";

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-semibold shadow-lg shadow-emerald-700/25 border border-white/25",
    secondary:
      "glass hover:bg-white/90 dark:hover:bg-slate-800/90 text-slate-950 dark:text-slate-100 font-bold border border-slate-900/10 dark:border-white/10 shadow-sm",
    ghost:
      "bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 font-bold",
    danger:
      "bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-semibold shadow-lg shadow-red-700/25 border border-white/20",
    pill:
      "glass-pill hover:bg-white/90 dark:hover:bg-slate-800/90 text-slate-950 dark:text-slate-100 font-bold border border-slate-900/10 dark:border-white/10",
  }[variant] || "";

  return (
    <motion.button
      type={type}
      whileTap={disabled || isLoading ? undefined : tapScale}
      onClick={disabled || isLoading ? undefined : onClick}
      disabled={disabled || isLoading}
      className={`relative inline-flex items-center justify-center gap-2 select-none touch-manipulation cursor-pointer transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${sizeClasses} ${variantClasses} ${
        disabled || isLoading ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="text-base shrink-0" aria-hidden="true" />}
          {children}
        </>
      )}
    </motion.button>
  );
}

export default GlassButton;
