import { memo } from "react";

/**
 * AuroraBackground
 * High-performance liquid glass canvas with ambient light blobs.
 * GPU-accelerated with translate3d and hardware blur.
 * Automatically halts drifting animations under prefers-reduced-motion.
 */
function AuroraBackgroundComponent() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
    >
      {/* Base radial gradient background - High contrast pastel foundation */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/40 via-slate-100/60 to-teal-100/40 dark:from-slate-950 dark:via-slate-900/95 dark:to-emerald-950/40 transition-colors duration-700" />

      {/* Blob 1: Emerald Primary Glow (Top Left) */}
      <div
        className="aurora-blob aurora-blob-1 absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] max-w-[750px] max-h-[750px] rounded-full
                   bg-gradient-to-tr from-emerald-400/20 via-green-300/15 to-teal-200/10
                   dark:from-emerald-600/18 dark:via-emerald-700/12 dark:to-teal-800/8
                   blur-[80px] md:blur-[110px] transform-gpu will-change-transform"
      />

      {/* Blob 2: Vibrant Teal / Cyan (Top Right & Center) */}
      <div
        className="aurora-blob aurora-blob-2 absolute top-[10%] -right-[15%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full
                   bg-gradient-to-bl from-teal-400/18 via-emerald-300/14 to-cyan-300/10
                   dark:from-teal-600/15 dark:via-cyan-700/10 dark:to-emerald-900/8
                   blur-[85px] md:blur-[120px] transform-gpu will-change-transform"
      />

      {/* Blob 3: Amber / Sunlight Warmth (Mid Left - Agricultural Sun) */}
      <div
        className="aurora-blob aurora-blob-3 absolute top-[45%] -left-[12%] w-[42vw] h-[42vw] max-w-[600px] max-h-[600px] rounded-full
                   bg-gradient-to-r from-amber-300/16 via-yellow-200/12 to-emerald-200/10
                   dark:from-amber-600/10 dark:via-yellow-700/8 dark:to-transparent
                   blur-[90px] md:blur-[115px] transform-gpu will-change-transform"
      />

      {/* Blob 4: Mint / Deep Emerald (Bottom Right) */}
      <div
        className="aurora-blob aurora-blob-4 absolute bottom-[-10%] right-[5%] w-[48vw] h-[48vw] max-w-[650px] max-h-[650px] rounded-full
                   bg-gradient-to-tl from-emerald-400/18 via-teal-300/12 to-lime-200/10
                   dark:from-emerald-700/15 dark:via-teal-800/10 dark:to-transparent
                   blur-[80px] md:blur-[110px] transform-gpu will-change-transform"
      />

      {/* Subtle Specular Noise / Grid Mesh Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.04)_1px,transparent_1px)] [background-size:24px_24px] dark:bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)]" />
    </div>
  );
}

export const AuroraBackground = memo(AuroraBackgroundComponent);
export default AuroraBackground;
