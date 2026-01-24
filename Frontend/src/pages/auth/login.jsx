import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from "../../context/authContext";
import axios from 'axios';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, User, LogIn } from 'lucide-react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { isAuthenticated, login, handleOAuthLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login({ username, password });
      if (!result.success) {
        setError(result.error || "Invalid login credentials");
      }
    } catch (err) {
      setError("Connection error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    const success = await handleOAuthLogin(async () => {
      return axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/oauth/google`,
        { credential: credentialResponse.credential },
        { withCredentials: true }
      );
    });
    if (!success) setError("Google login failed");
  };

  // Animation Variants
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
    <div className="min-h-screen py-12 flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 px-4">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white w-full max-w-md"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight italic">Smart Agro</h2>
          <p className="text-gray-500 font-medium mt-2">Welcome back! Please login.</p>
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

        {/* OAuth Section */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4 mb-8">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setError("Google Login Failed")}
              shape="pill"
              theme="outline"
              size="large"
              text="continue_with"
            />
          </div>
          
          <div className="flex items-center">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">Or secure login</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>
        </motion.div>

        {/* Local Login Form */}
        <form className="space-y-5" onSubmit={handleLogin}>
          <motion.div variants={itemVariants} className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
              <User size={18} />
            </div>
            <input
              type="text"
              placeholder="Username"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all bg-gray-50/50"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all bg-gray-50/50"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs text-green-700 font-bold hover:underline"
            >
              Forgot password?
            </Link>
          </motion.div>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-green-200 hover:bg-green-700 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? "Verifying..." : <><LogIn size={20} /> Login</>}
          </motion.button>
        </form>

        <motion.p variants={itemVariants} className="mt-8 text-center text-sm text-gray-500 font-medium">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-green-600 font-black hover:underline"
          >
            Sign Up
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;