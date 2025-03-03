"use client";

import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores the authenticated user's data
  const [token, setToken] = useState(null); // Stores the token
  const [loading, setLoading] = useState(true); // Indicates if the auth check is in progress

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  // Check if the user is logged in when the app loads
  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem("authToken");
      if (storedToken) {
        try {
          const res = await axios.post(
            `${API_BASE}/phone/verify`,
            {},
            {
              headers: { Authorization: `Bearer ${storedToken}` },
            }
          );
          setUser(res.data.user);
          setToken(storedToken); // Set the token in state
        } catch {
          localStorage.removeItem("authToken");
          setUser(null);
          setToken(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false); // No token, stop loading
      }
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE}/phone/login`, {
        email,
        password,
      });
      localStorage.setItem("authToken", res.data.accessToken);
      setUser(res.data.user);
      setToken(res.data.accessToken); // Save token in state
    } catch (error) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const register = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE}/phone/register`, {
        email,
        password,
      });
      localStorage.setItem("authToken", res.data.accessToken);
      setUser(res.data.user);
      setToken(res.data.accessToken); // Save token in state
    } catch (error) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };

  const logout = () => {
    setLoading(true); // Set loading to true
    setTimeout(() => {
      localStorage.removeItem("authToken");
      setUser(null);
      setToken(null);
      setLoading(false); // Set loading to false after delay
      window.location.href = "/";
    }, 1500); // 1.5s delay
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
