import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Mail, ChevronLeft, Send } from "lucide-react";
import GlassButton from "../../components/ui/GlassButton";
import GlassInput from "../../components/ui/GlassInput";
import { springSmooth } from "../../constants/motion";

export function ForgotPassword() {
  const { t } = useTranslation();

  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await forgotPassword(identifier);
      setMessage(t("forgot.success") || "Password reset instructions dispatched to your email.");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch {
      setError(t("forgot.error") || "Failed to deliver reset email. Verify your identifier.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100dvh-7rem)] flex flex-col justify-start md:justify-center items-center px-4 pt-4 pb-24 md:py-8 my-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={springSmooth}
        className="glass-strong border border-slate-900/10 dark:border-white/10 rounded-[32px] p-6 sm:p-9 shadow-2xl w-full max-w-md relative overflow-hidden"
      >
        <div className="text-center mb-6">
          <span className="glass-pill px-3 py-1 text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider inline-block mb-3">
            Account Recovery
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-slate-50 tracking-tight">
            {t("forgot.title")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-1">
            {t("forgot.subtitle")}
          </p>
        </div>

        {message && (
          <div className="mb-5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-700 dark:text-red-400 text-xs sm:text-sm font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput
            icon={Mail}
            name="identifier"
            type="text"
            label="Email or Username"
            placeholder="farmer@smartagro.org"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoComplete="email"
          />

          <GlassButton
            variant="primary"
            size="lg"
            type="submit"
            isLoading={loading}
            icon={Send}
            className="w-full mt-2"
          >
            {loading ? "Transmitting..." : "Send Reset Link"}
          </GlassButton>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
          >
            <ChevronLeft size={14} />
            <span>Return to Login</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;
