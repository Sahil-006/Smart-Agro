import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL as API_BASE } from '../components/api';

// Attach JWT token automatically to all axios requests if available
axios.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('smart_agro_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Ignore localStorage access errors
  }
  return config;
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('smart_agro_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return Boolean(localStorage.getItem('smart_agro_token'));
    } catch {
      return false;
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      // If we already have a cached token, don't show blank loading screen
      return !Boolean(localStorage.getItem('smart_agro_token'));
    } catch {
      return true;
    }
  });

  const navigate = useNavigate();

  // =========================
  // Initialize auth state
  // =========================
  const initializeAuth = async () => {
    const token = localStorage.getItem('smart_agro_token');
    try {
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await axios.get(
        `${API_BASE}/api/auth/check`,
        { withCredentials: true, headers }
      );

      if (res.data?.authenticated) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        localStorage.setItem('smart_agro_user', JSON.stringify(res.data.user));
        return true;
      }

      // Backend confirmed session/token is invalid
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('smart_agro_token');
      localStorage.removeItem('smart_agro_user');
      return false;
    } catch (err) {
      console.error('Auth check failed:', err);
      // In case of transient network error or sleeping Render instance,
      // retain user state if token was already present in storage
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
      }
      return Boolean(token);
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
      const res = await axios.post(
        `${API_BASE}/api/auth/login`,
        credentials,
        { withCredentials: true }
      );

      if (res.data?.token) {
        localStorage.setItem('smart_agro_token', res.data.token);
      }
      if (res.data?.user) {
        localStorage.setItem('smart_agro_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setIsAuthenticated(true);
      }

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
      const res = await authRequest();
      if (res?.data?.token) {
        localStorage.setItem('smart_agro_token', res.data.token);
      }
      if (res?.data?.user) {
        localStorage.setItem('smart_agro_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('OAuth login failed:', err);
      return false;
    }
  };

  // =========================
  // Forgot Password
  // =========================
  const forgotPassword = async (identifier) => {
    try {
      await axios.post(
        `${API_BASE}/api/auth/forgot-password`,
        { identifier },
        { withCredentials: true }
      );
      return { success: true };
    } catch {
      return { success: true };
    }
  };

  // =========================
  // Reset Password
  // =========================
  const resetPassword = async ({ token, password }) => {
    try {
      await axios.post(
        `${API_BASE}/api/auth/reset-password`,
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
      const token = localStorage.getItem('smart_agro_token');
      await axios.post(
        `${API_BASE}/api/auth/logout`,
        {},
        {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      localStorage.removeItem('smart_agro_token');
      localStorage.removeItem('smart_agro_user');
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        loading,
        login,
        logout,
        handleOAuthLogin,
        initializeAuth,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
