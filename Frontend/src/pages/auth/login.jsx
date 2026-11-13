import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from "../../context/authContext";
import axios from 'axios';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, User, LogIn } from 'lucide-react';
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { isAuthenticated, login, handleOAuthLogin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Local login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
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

  // Google OAuth login
  const handleGoogleLogin = async (credentialResponse) => {
    const success = await handleOAuthLogin(async () => {
      return axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/oauth/google`,
        { credential: credentialResponse.credential },
        { withCredentials: true }
      );
    });

    if (!success) {
      setError(t("login.errors.google"));
    }
  };

  // Animations
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen pt-28 sm:pt-36 pb-12 flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 px-3 sm:px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white w-full max-w-md"
      >
        <motion.div variants={itemVariants} className="text-center mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight italic">
            {t("signup.title")}
          </h2>
          <p className="text-gray-500 font-medium mt-1 sm:mt-2 text-sm sm:text-base">
            {t("login.subtitle")}
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center text-sm font-semibold"
          >
            {error}
          </motion.div>
        )}

        {/* Google OAuth */}
        <motion.div variants={itemVariants} className="flex flex-col gap-6 mb-6 sm:mb-8">
          <div className="flex justify-center w-full max-w-full overflow-hidden">
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
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest shrink-0">
              {t("login.or")}
            </span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>
        </motion.div>

        {/* Local Login */}
        <form className="space-y-4 sm:space-y-5" onSubmit={handleLogin}>
          <motion.div variants={itemVariants} className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors pointer-events-none">
              <User size={18} />
            </div>
            <input
              type="text"
              placeholder={t("login.username")}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all bg-gray-50/50 text-base"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors pointer-events-none">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={t("login.password")}
              className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all bg-gray-50/50 text-base"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors w-10 h-10 flex items-center justify-center cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs text-green-700 font-bold hover:underline py-1"
            >
              {t("login.forgot")}
            </Link>
          </motion.div>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] bg-green-600 text-white py-3.5 sm:py-4 rounded-2xl font-bold shadow-xl shadow-green-200 hover:bg-green-700 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {loading ? t("login.verifying") : (<><LogIn size={18} /> <span>{t("login.submit")}</span></>)}
          </motion.button>
        </form>

        <motion.p
          variants={itemVariants}
          className="mt-6 sm:mt-8 text-center text-sm text-gray-500 font-medium"
        >
          {t("login.noAccount")}{" "}
          <Link to="/signup" className="text-green-600 font-black hover:underline py-1 inline-block">
            {t("login.signup")}
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
