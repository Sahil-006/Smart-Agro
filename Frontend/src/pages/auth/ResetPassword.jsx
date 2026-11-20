import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { motion } from "framer-motion";
import { Lock, ChevronLeft, Check, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import GlassButton from "../../components/ui/GlassButton";
import GlassInput from "../../components/ui/GlassInput";
import { springSmooth } from "../../constants/motion";

export function ResetPassword() {
  const { t } = useTranslation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const passwordRules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const isStrong = Object.values(passwordRules).every(Boolean);
    if (!isStrong) {
      setError(t("reset.errors.rules") || "Password does not satisfy complexity criteria.");
      return;
    }

    if (password !== confirmPassword) {
      setError(t("reset.errors.mismatch") || "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({ token, password });
      if (!res.success) throw new Error(res.error);

      setSuccess(t("reset.success") || "Password successfully updated! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.message || t("reset.errors.invalid"));
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
            Security Shield
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-slate-50 tracking-tight">
            {t("reset.title") || "Reset Password"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-1">
            {t("reset.subtitle") || "Enter your new credentials below."}
          </p>
        </div>

        {success && (
          <div className="mb-5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold text-center">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-700 dark:text-red-400 text-xs sm:text-sm font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput
            icon={Lock}
            type="password"
            label="New Password"
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <GlassInput
            icon={Lock}
            type="password"
            label="Confirm New Password"
            name="confirmPassword"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          {password && (
            <div className="grid grid-cols-2 gap-2 glass-subtle p-3 rounded-2xl border border-slate-900/10 dark:border-white/10 text-[11px]">
              <div className={`flex items-center gap-1.5 ${passwordRules.length ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-400 font-medium"}`}>
                <Check size={12} /> <span>Min 8 chars</span>
              </div>
              <div className={`flex items-center gap-1.5 ${passwordRules.upper ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-400 font-medium"}`}>
                <Check size={12} /> <span>Uppercase</span>
              </div>
              <div className={`flex items-center gap-1.5 ${passwordRules.number ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-400 font-medium"}`}>
                <Check size={12} /> <span>Number</span>
              </div>
              <div className={`flex items-center gap-1.5 ${passwordRules.special ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-400 font-medium"}`}>
                <Check size={12} /> <span>Special char</span>
              </div>
            </div>
          )}

          <GlassButton
            variant="primary"
            size="lg"
            type="submit"
            isLoading={loading}
            icon={ShieldCheck}
            className="w-full mt-2"
          >
            {loading ? "Updating..." : "Update Password"}
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

export default ResetPassword;
