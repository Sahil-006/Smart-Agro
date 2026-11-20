/**
 * Universal Apple Status Badge
 * Visual status indicator with live pulsing dot and liquid glass pill styling.
 */
export function StatusBadge({
  status = "online",
  label,
  children,
  size = "md",
  className = "",
}) {
  const displayLabel = label || children || status;

  const statusConfig = {
    online: {
      dot: "bg-emerald-500",
      ping: "bg-emerald-400",
      pill: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/25",
    },
    success: {
      dot: "bg-emerald-500",
      ping: "bg-emerald-400",
      pill: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/25",
    },
    warning: {
      dot: "bg-amber-500",
      ping: "bg-amber-400",
      pill: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/25",
    },
    danger: {
      dot: "bg-red-500",
      ping: "bg-red-400",
      pill: "bg-red-500/10 text-red-800 dark:text-red-300 border-red-500/25",
    },
    error: {
      dot: "bg-red-500",
      ping: "bg-red-400",
      pill: "bg-red-500/10 text-red-800 dark:text-red-300 border-red-500/25",
    },
    info: {
      dot: "bg-sky-500",
      ping: "bg-sky-400",
      pill: "bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/25",
    },
    neutral: {
      dot: "bg-slate-400",
      ping: "bg-slate-300",
      pill: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
    },
  }[status] || {
    dot: "bg-emerald-500",
    ping: "bg-emerald-400",
    pill: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/25",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  }[size] || "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border backdrop-blur-md shadow-xs ${statusConfig.pill} ${sizeClasses} ${className}`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusConfig.ping}`}
        />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${statusConfig.dot}`} />
      </span>
      <span className="truncate capitalize">{displayLabel}</span>
    </span>
  );
}

export default StatusBadge;
