import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  ChevronLeft,
  User,
  Mail,
  Phone,
  Lock,
  Check,
} from "lucide-react";
import GlassButton from "../../components/ui/GlassButton";
import GlassInput from "../../components/ui/GlassInput";
import { springSmooth } from "../../constants/motion";

export function Signup() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    state: "",
    district: "",
    village: "",
  });

  const { login, handleOAuthLogin } = useAuth();
  const navigate = useNavigate();

  const locationData = {
    Gujarat: {
      Ahmedabad: ["Village1", "Village2"],
      Surat: ["Village3", "Village4"],
    },
    Maharashtra: {
      Pune: ["Village5", "Village6"],
      Nagpur: ["Village7", "Village8"],
    },
  };

  const states = Object.keys(locationData);
  const districts = formData.state ? Object.keys(locationData[formData.state] || {}) : [];
  const villages = formData.district ? locationData[formData.state]?.[formData.district] || [] : [];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const handleChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const passwordRules = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    lower: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
  };

  const validateStep1 = () => {
    if (!formData.fullName || !formData.username)
      return t("signup.validation.name_username_required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      return t("signup.validation.invalid_email");
    if (!/^\d{10}$/.test(formData.phone)) return t("signup.validation.phone_length");
    if (!passwordRules.length || !passwordRules.upper || !passwordRules.special)
      return t("signup.validation.password_weak");
    if (formData.password !== formData.confirmPassword)
      return t("signup.validation.passwords_mismatch");
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) return setError(err);
    setStep(2);
  };

  const handleGoogleSignup = async (credentialResponse) => {
    setError("");
    setLoading(true);

    try {
      const success = await handleOAuthLogin(async () => {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        return axios.post(
          `${apiUrl}/api/auth/oauth/google`,
          { credential: credentialResponse.credential },
          { withCredentials: true }
        );
      });

      if (success) {
        navigate("/dashboard");
      } else {
        setError(t("signup.validation.google_signup_failed"));
      }
    } catch {
      setError(t("signup.validation.google_signup_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!formData.state || !formData.district || !formData.village)
      return setError(t("signup.validation.location_required"));
    if (!agreeTerms) return setError(t("signup.validation.agree_terms"));

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.post(`${apiUrl}/api/auth/signup`, formData, { withCredentials: true });
      const loginRes = await login({ username: formData.username, password: formData.password });
      if (loginRes.success) navigate("/dashboard");
      else navigate("/login");
    } catch {
      setError(t("signup.validation.signup_failed_generic"));
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
        className="glass-strong border border-slate-900/10 dark:border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl w-full max-w-xl relative overflow-hidden"
      >
        {/* Glow halo */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* STEP PROGRESS INDICATOR */}
        <div className="flex justify-center gap-2 mb-6">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === 1
                ? "bg-emerald-600 w-16"
                : "bg-slate-300 dark:bg-slate-700 w-8"
            }`}
          />
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === 2
                ? "bg-emerald-600 w-16"
                : "bg-slate-300 dark:bg-slate-700 w-8"
            }`}
          />
        </div>

        <div className="text-center mb-6">
          <span className="glass-pill px-3 py-1 text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider inline-block mb-3">
            Step {step} of 2
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-slate-50 tracking-tight">
            {t("signup.title")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-1">
            {step === 1 ? t("signup.steps.personal_details") : t("signup.steps.location_details")}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-700 dark:text-red-400 text-xs sm:text-sm font-semibold text-center">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              className="space-y-4"
            >
              {/* Google Fast Signup */}
              <div className="flex flex-col items-center">
                <div className="flex justify-center w-full overflow-hidden">
                  <GoogleLogin
                    text="signup_with"
                    shape="pill"
                    onSuccess={handleGoogleSignup}
                    onError={() => setError(t("signup.validation.google_signup_failed"))}
                  />
                </div>
                <div className="flex items-center w-full my-5">
                  <div className="flex-grow border-t border-slate-200/80 dark:border-white/10" />
                  <span className="mx-4 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest shrink-0">
                    {t("signup.auth.or_use_email")}
                  </span>
                  <div className="flex-grow border-t border-slate-200/80 dark:border-white/10" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <GlassInput
                  label={t("signup.form.placeholders.full_name")}
                  icon={User}
                  name="fullName"
                  placeholder={t("signup.form.placeholders.full_name")}
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
                <GlassInput
                  label={t("signup.form.placeholders.username")}
                  icon={User}
                  name="username"
                  placeholder={t("signup.form.placeholders.username")}
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <GlassInput
                  label={t("signup.form.placeholders.email")}
                  icon={Mail}
                  name="email"
                  type="email"
                  placeholder={t("signup.form.placeholders.email")}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <GlassInput
                  label={t("signup.form.placeholders.phone")}
                  icon={Phone}
                  name="phone"
                  placeholder={t("signup.form.placeholders.phone")}
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <GlassInput
                  label={t("signup.form.placeholders.password")}
                  icon={Lock}
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <GlassInput
                  label={t("signup.form.placeholders.confirm_password")}
                  icon={Lock}
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              {formData.password && (
                <div className="grid grid-cols-2 gap-2 glass-subtle p-3 rounded-2xl border border-white/60 dark:border-white/10 text-[11px]">
                  <Rule ok={passwordRules.length} label={t("signup.form.password_rules.min_chars")} />
                  <Rule ok={passwordRules.upper} label={t("signup.form.password_rules.uppercase")} />
                  <Rule ok={passwordRules.number} label={t("signup.form.password_rules.number")} />
                  <Rule ok={passwordRules.special} label={t("signup.form.password_rules.special_char")} />
                </div>
              )}

              <GlassButton
                variant="primary"
                size="lg"
                onClick={handleNext}
                icon={ChevronRight}
                className="w-full mt-2"
              >
                {t("signup.buttons.next_step")}
              </GlassButton>

              <p className="text-center text-xs text-slate-700 dark:text-slate-300 font-medium pt-2">
                {t("signup.auth.already_have_account")}{" "}
                <Link
                  to="/login"
                  className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline ml-1"
                >
                  {t("signup.auth.login_link")}
                </Link>
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              className="space-y-4"
            >
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                    State
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="glass-input text-[16px] leading-normal"
                  >
                    <option value="">{t("signup.form.placeholders.select_state")}</option>
                    {states.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                    District
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    disabled={!formData.state}
                    className="glass-input text-[16px] leading-normal disabled:opacity-50"
                  >
                    <option value="">{t("signup.form.placeholders.select_district")}</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                    Village / Locality
                  </label>
                  <select
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    disabled={!formData.district}
                    className="glass-input text-[16px] leading-normal disabled:opacity-50"
                  >
                    <option value="">{t("signup.form.placeholders.select_village")}</option>
                    {villages.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-3 p-3 rounded-2xl glass-subtle cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-normal">
                  {t("signup.form.terms_agreement") || "I agree to the Terms of Service & Privacy Policy"}
                </span>
              </label>

              <div className="flex gap-2.5 pt-2">
                <GlassButton
                  variant="secondary"
                  size="lg"
                  onClick={() => setStep(1)}
                  icon={ChevronLeft}
                  className="w-1/3"
                >
                  Back
                </GlassButton>
                <GlassButton
                  variant="primary"
                  size="lg"
                  onClick={handleSignup}
                  isLoading={loading}
                  className="w-2/3"
                >
                  {t("signup.buttons.create_account")}
                </GlassButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function Rule({ ok, label }) {
  return (
    <div className={`flex items-center gap-1.5 ${ok ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-400 font-medium"}`}>
      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${ok ? "bg-emerald-600 text-white" : "bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400"}`}>
        {ok ? <Check size={10} /> : "•"}
      </span>
      <span>{label}</span>
    </div>
  );
}

export default Signup;
