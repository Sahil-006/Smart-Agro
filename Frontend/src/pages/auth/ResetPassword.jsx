import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, CheckCircle2, ShieldCheck, ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

const ResetPassword = () => {
  const { t } = useTranslation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      setError(t("reset.errors.rules"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("reset.errors.mismatch"));
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({ token, password });
      if (!res.success) throw new Error(res.error);

      setSuccess(t("reset.success"));
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.message || t("reset.errors.invalid"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 backdrop-blur-md p-8 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-green-100 text-green-600 rounded-full mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {t("reset.title")}
          </h2>
          <p className="text-gray-500 font-medium">
            {t("reset.subtitle")}
          </p>
        </div>

        {success && (
          <motion.div className="mb-6 p-3 bg-green-50 border border-green-100 text-green-700 rounded-xl text-center text-sm font-semibold">
            {success}
          </motion.div>
        )}

        {error && (
          <motion.div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center text-sm font-semibold">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <PasswordField
            value={password}
            setValue={setPassword}
            show={showPassword}
            toggle={() => setShowPassword(!showPassword)}
            placeholder={t("reset.newPassword")}
          />

          <PasswordField
            value={confirmPassword}
            setValue={setConfirmPassword}
            show={showConfirmPassword}
            toggle={() => setShowConfirmPassword(!showConfirmPassword)}
            placeholder={t("reset.confirmPassword")}
          />

          <AnimatePresence>
            {password.length > 0 && (
              <motion.div className="grid grid-cols-2 gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <Rule ok={passwordRules.length} label={t("reset.rules.length")} />
                <Rule ok={passwordRules.upper} label={t("reset.rules.upper")} />
                <Rule ok={passwordRules.number} label={t("reset.rules.number")} />
                <Rule ok={passwordRules.special} label={t("reset.rules.special")} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* PASSWORD RULES (Same as Signup) */}
          <AnimatePresence>
            {password.length > 0 && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                className="grid grid-cols-2 gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100"
              >
                <Rule ok={passwordRules.length} label="8+ Chars" />
                <Rule ok={passwordRules.upper} label="Uppercase" />
                <Rule ok={passwordRules.number} label="Number" />
                <Rule ok={passwordRules.special} label="Symbol" />
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold"
          >
            {loading ? t("reset.loading") : t("reset.submit")}
          </button>
        </form>

        <p className="mt-8 text-center text-sm">
          <Link to="/login" className="text-green-700 font-bold hover:underline flex items-center justify-center gap-1">
            <ChevronLeft size={16} /> {t("reset.back")}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

const PasswordField = ({ value, setValue, show, toggle, placeholder }) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
      <Lock size={18} />
    </div>
    <input
      type={show ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      required
      className="w-full pl-11 pr-12 py-3 rounded-2xl border border-gray-200"
    />
    <button type="button" onClick={toggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
);

const Rule = ({ ok, label }) => (
  <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${ok ? "text-green-600" : "text-gray-300"}`}>
    {ok ? <CheckCircle2 size={14} /> : <div className="h-3 w-3 rounded-full border-2" />}
    {label}
  </div>
);

export default ResetPassword;
