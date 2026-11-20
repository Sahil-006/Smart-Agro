/**
 * Universal Apple Liquid Glass Shimmer Skeleton
 * Lightweight placeholder for cards, tables, and metric widgets during data fetching.
 */
export function GlassSkeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
}) {
  const variantClasses = {
    circular: "rounded-full shrink-0",
    rounded: "rounded-2xl",
    text: "rounded-md h-4",
    rectangular: "rounded-xl",
  }[variant] || "rounded-xl";

  return (
    <div
      aria-hidden="true"
      style={{ width, height }}
      className={`relative overflow-hidden bg-slate-200/60 dark:bg-slate-800/60 animate-pulse ${variantClasses} ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent" />
    </div>
  );
}

export default GlassSkeleton;
