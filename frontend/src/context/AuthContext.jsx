import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('documind_user');
    return saved ? JSON.parse(saved) : { id: 1, name: 'SME Business Admin', email: 'admin@sme-enterprise.com' };
  });

  const [isDemoMode, setIsDemoMode] = useState(true);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('documind_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('documind_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isDemoMode, setIsDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
