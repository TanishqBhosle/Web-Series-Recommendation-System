import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [ratingCount, setRatingCount] = useState(0);

  const fetchUser = async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const userData = await api.getMe();
      setUser(userData);
      const countRes = await api.getMyRatingCount().catch(() => ({ rating_count: 0 }));
      setRatingCount(countRes.rating_count || 0);
    } catch (err) {
      console.warn("Session expired or invalid token:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    const countRes = await api.getMyRatingCount().catch(() => ({ rating_count: 0 }));
    setRatingCount(countRes.rating_count || 0);
    return data;
  };

  const register = async (name, email, password, confirmPassword) => {
    const data = await api.register({
      name,
      email,
      password,
      confirm_password: confirmPassword
    });
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    setRatingCount(0);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setRatingCount(0);
  };

  const incrementRatingCount = () => {
    setRatingCount((prev) => prev + 1);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        ratingCount,
        login,
        register,
        logout,
        incrementRatingCount,
        refreshRatingCount: fetchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
