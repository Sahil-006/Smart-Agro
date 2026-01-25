import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import api from "../components/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // =========================
  // Initialize auth state
  // =========================
  const initializeAuth = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/auth/check`,
        { withCredentials: true }
      );

      if (res.data.authenticated) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        return true;
      }

      setUser(null);
      setIsAuthenticated(false);
      return false;
    } catch (err) {
      console.error('Auth check failed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  // =========================
  // Local login
  // =========================
  const login = async (credentials) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        credentials,
        { withCredentials: true }
      );

      const isAuth = await initializeAuth();
      if (!isAuth) throw new Error('Session not created');

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Login failed',
      };
    }
  };

  // =========================
  // OAuth login (Google/GitHub)
  // =========================
  const handleOAuthLogin = async (authRequest) => {
    try {
      await authRequest();

      const isAuth = await initializeAuth();
      if (!isAuth) throw new Error('OAuth session not created');

      return true;
    } catch (err) {
      console.error('OAuth login failed:', err);
      return false;
    }
  };

  // =========================
  // Forgot Password (NEW)
  // =========================
  const forgotPassword = async (identifier) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
        { identifier },
        { withCredentials: true        }
      );

      // Always return success (security-safe)
      return { success: true };
    } catch (err) {
      // Do NOT expose backend errors
      return { success: true };
    }
  };

  // =========================
  // Reset Password (NEW)
  // =========================
  const resetPassword = async ({ token, password }) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password`,
        { token, password },
        { withCredentials: true }
      );

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.message ||
          'Reset link is invalid or expired',
      };
    }
  };

  // =========================
  // Logout
  // =========================
  const logout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        loading,
        login,
        logout,
        handleOAuthLogin,
        // initializeAuth,
        forgotPassword,   // ✅ added
        resetPassword,    // ✅ added
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
