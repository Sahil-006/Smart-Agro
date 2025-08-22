import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from session
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
      return false;
    } catch (err) {
      console.error('Auth check failed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check auth on mount and when navigating
  useEffect(() => {
    initializeAuth();
  }, []);

  // Regular login
  const login = async (credentials) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        credentials,
        { withCredentials: true }
      );
      
      // Verify the session was actually created
      const isAuth = await initializeAuth();
      if (!isAuth) throw new Error('Session not created');
      
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Login failed'
      };
    }
  };

  // OAuth login handler
  const handleOAuthLogin = async (authRequest) => {
    try {
      const res = await authRequest();
      
      // Verify session
      const isAuth = await initializeAuth();
      if (!isAuth) throw new Error('OAuth session not created');
      
      return true;
    } catch (err) {
      console.error('OAuth login failed:', err);
      return false;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        handleOAuthLogin,
        initializeAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);