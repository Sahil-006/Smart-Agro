import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCompass, FaHome } from "react-icons/fa";
import GlassButton from "../components/ui/GlassButton";
import { springSmooth } from "../constants/motion";

export function NotFound() {
  return (
    <div className="min-h-[calc(100dvh-120px)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={springSmooth}
        className="glass-strong border border-slate-900/10 dark:border-white/10 rounded-[32px] p-8 md:p-12 max-w-lg w-full text-center shadow-2xl relative overflow-hidden"
      >
        {/* Glow halo */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-3xl mb-6 shadow-inner">
          <FaCompass className="animate-spin-slow" />
        </div>

        <span className="glass-pill px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-3 inline-block">
          Error 404
        </span>

        <h1 className="text-2xl md:text-3xl font-black text-slate-950 dark:text-slate-50 tracking-tight mt-1 mb-3">
          Page Not Found
        </h1>

        <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 font-medium leading-relaxed mb-8 max-w-sm mx-auto">
          The agricultural telemetry or insight coordinates you are searching for do not exist or have moved.
        </p>

        <Link to="/">
          <GlassButton variant="primary" size="lg" icon={FaHome} className="w-full sm:w-auto">
            Return to Dashboard / Home
          </GlassButton>
        </Link>
      </motion.div>
    </div>
  );
}

export default NotFound;
