import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        try {
          const response = await apiClient.get('/auth/me');
          if (response.data.role === 'admin') {
            setUser(response.data);
          } else {
            localStorage.removeItem('adminToken');
            setUser(null);
          }
        } catch (error) {
          localStorage.removeItem('adminToken');
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { access_token } = response.data;
    
    // Store token temporarily to get user
    localStorage.setItem('adminToken', access_token);
    
    const userRes = await apiClient.get('/auth/me');
    if (userRes.data.role !== 'admin') {
      localStorage.removeItem('adminToken');
      throw new Error('Tài khoản không có quyền truy cập trang quản trị.');
    }

    setUser(userRes.data);
    return userRes.data;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
