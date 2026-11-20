import { useState, useId } from "react";
import { FaEye, FaEyeSlash, FaExclamationCircle } from "react-icons/fa";

/**
 * Universal Apple Liquid Glass Inset Input
 * Strictly enforces 16px font-size to prevent mobile Safari auto-zoom.
 * Provides accessible labels, password toggles, and inline validation states.
 */
export function GlassInput({
  label,
  error,
  icon: Icon,
  type = "text",
  id: customId,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  autoComplete,
  className = "",
  disabled = false,
  ...props
}) {
  const generatedId = useId();
  const inputId = customId || name || generatedId;
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordType = type === "password";
  const effectiveType = isPasswordType ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-red-600 ml-1" aria-hidden="true">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-slate-600 dark:text-slate-400">
            <Icon className="text-base" aria-hidden="true" />
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={effectiveType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          style={{
            paddingLeft: Icon ? "2.75rem" : "0.875rem",
            paddingRight: isPasswordType ? "3rem" : "0.875rem",
            ...props.style,
          }}
          className={`glass-input text-[16px] leading-normal transition-all duration-200 ${
            Icon ? "!pl-11" : "!pl-3.5"
          } ${isPasswordType ? "!pr-12" : "!pr-3.5"} ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              : "focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          {...props}
        />

        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-1 w-10 h-10 flex items-center justify-center text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer rounded-xl"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash className="text-base" /> : <FaEye className="text-base" />}
          </button>
        )}
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 mt-0.5 animate-in fade-in slide-in-from-top-1"
        >
          <FaExclamationCircle className="shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export default GlassInput;
