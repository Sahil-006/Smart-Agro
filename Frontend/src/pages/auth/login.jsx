import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/authContext";
import { API_BASE_URL as apiUrl } from "../../components/api";
import axios from "axios";
import { motion } from "framer-motion";
import { User, Lock, LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";
import GlassButton from "../../components/ui/GlassButton";
import GlassInput from "../../components/ui/GlassInput";
import { springSmooth } from "../../constants/motion";

export function Login() {
  const { t } = useTranslation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { isAuthenticated, login, handleOAuthLogin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login({ username, password });
      if (!result.success) {
        setError(result.error || t("login.errors.invalid"));
      }
    } catch {
      setError(t("login.errors.connection"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    const success = await handleOAuthLogin(async () => {
      return axios.post(
        `${apiUrl}/api/auth/oauth/google`,
        { credential: credentialResponse.credential },
        { withCredentials: true }
      );
    });

    if (!success) {
      setError(t("login.errors.google"));
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
        {/* Glow halo */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <span className="glass-pill px-3 py-1 text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider inline-block mb-3">
            Secure Access
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-slate-50 tracking-tight">
            {t("login.title") || "Welcome Back"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-1">
            {t("login.subtitle")}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-700 dark:text-red-400 text-xs sm:text-sm font-semibold text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Google OAuth Section */}
        <div className="flex flex-col gap-5 mb-6">
          <div className="flex justify-center w-full overflow-hidden">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setError(t("login.errors.google"))}
              shape="pill"
              theme="outline"
              size="large"
              text="continue_with"
            />
          </div>

          <div className="flex items-center">
            <div className="flex-grow border-t border-slate-200/80 dark:border-white/10" />
            <span className="mx-4 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest shrink-0">
              {t("login.or")}
            </span>
            <div className="flex-grow border-t border-slate-200/80 dark:border-white/10" />
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <GlassInput
            label={t("login.username")}
            icon={User}
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            autoComplete="username"
          />

          <GlassInput
            label={t("login.password")}
            icon={Lock}
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          <div className="flex justify-end pt-1">
            <Link
              to="/forgot-password"
              className="text-xs text-emerald-700 dark:text-emerald-400 font-bold hover:underline py-1"
            >
              {t("login.forgot")}
            </Link>
          </div>

          <div className="pt-2">
            <GlassButton
              variant="primary"
              size="lg"
              type="submit"
              isLoading={loading}
              icon={LogIn}
              className="w-full"
            >
              {loading ? t("login.verifying") : t("login.submit")}
            </GlassButton>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-slate-700 dark:text-slate-300 font-medium">
          {t("login.noAccount")}{" "}
          <Link
            to="/signup"
            className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline ml-1"
          >
            {t("login.signup")}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;
