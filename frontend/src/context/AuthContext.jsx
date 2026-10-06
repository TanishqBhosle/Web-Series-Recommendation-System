import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ id: 1, name: "Explorer" });
  const [ratingCount, setRatingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchRatingCount = async () => {
    try {
      const countRes = await api.getMyRatingCount().catch(() => ({ rating_count: 0 }));
      setRatingCount(countRes.rating_count || 0);
    } catch (err) {
      console.warn("Error fetching rating count:", err);
    }
  };

  useEffect(() => {
    fetchRatingCount();
  }, []);

  const incrementRatingCount = () => {
    setRatingCount((prev) => prev + 1);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        ratingCount,
        incrementRatingCount,
        refreshRatingCount: fetchRatingCount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
