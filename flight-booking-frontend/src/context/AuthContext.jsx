import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on first render
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('skywings_token');
      const storedUser = localStorage.getItem('skywings_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        try {
          // Verify token validity with backend
          const res = await API.get('/auth/profile');
          if (res.data?.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('skywings_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Stored session invalid or expired:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for 401 unauthenticated signals from axios interceptor
    const handleForceLogout = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('skywings_auth_logout', handleForceLogout);

    return () => {
      window.removeEventListener('skywings_auth_logout', handleForceLogout);
    };
  }, []);

  // Login handler
  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    if (res.data?.success) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('skywings_token', newToken);
      localStorage.setItem('skywings_user', JSON.stringify(newUser));
      return { success: true, user: newUser };
    }
    return { success: false, message: res.data?.message || 'Login failed' };
  };

  // Register handler
  const register = async (name, email, password) => {
    const res = await API.post('/auth/register', { name, email, password });
    if (res.data?.success) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('skywings_token', newToken);
      localStorage.setItem('skywings_user', JSON.stringify(newUser));
      return { success: true, user: newUser };
    }
    return { success: false, message: res.data?.message || 'Registration failed' };
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('skywings_token');
    localStorage.removeItem('skywings_user');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
