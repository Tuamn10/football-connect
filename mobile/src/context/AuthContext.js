import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import apiClient from "../services/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const loadCurrentUser = async () => {
    try {
      setLoadingAuth(true);

      const token = await AsyncStorage.getItem("access_token");

      if (!token) {
        setUser(null);
        return;
      }

      const response = await apiClient.get("/api/v1/auth/me");
      setUser(response.data);
    } catch (error) {
      await AsyncStorage.removeItem("access_token");
      setUser(null);
    } finally {
      setLoadingAuth(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post("/api/v1/auth/login", {
        email,
        password,
      });

      const accessToken = response.data?.access_token;

      if (!accessToken) {
        throw new Error("Máy chủ không trả về access token.");
      }

      await AsyncStorage.setItem("access_token", accessToken);

      const meResponse = await apiClient.get("/api/v1/auth/me");
      setUser(meResponse.data);

      return meResponse.data;
    } catch (error) {
      await AsyncStorage.removeItem("access_token");
      setUser(null);
      throw error;
    }
  };

  const register = async ({
    name,
    email,
    phone,
    password,
  }) => {
    const response = await apiClient.post("/api/v1/auth/register", {
      name,
      email,
      phone,
      password,
    });

    const accessToken = response.data?.access_token;

    if (!accessToken) {
      throw new Error("Máy chủ không trả về access token.");
    }

    await AsyncStorage.setItem("access_token", accessToken);

    const meResponse = await apiClient.get("/api/v1/auth/me");
    setUser(meResponse.data);

    return meResponse.data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem("access_token");
    setUser(null);
  };

  const contextValue = useMemo(
    () => ({
      user,
      loadingAuth,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      reloadUser: loadCurrentUser,
      setUser,
    }),
    [user, loadingAuth]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth phải được sử dụng bên trong AuthProvider."
    );
  }

  return context;
}