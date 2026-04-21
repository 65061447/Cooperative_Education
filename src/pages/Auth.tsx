import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const isAuthenticated = !!token;

  // INIT ON LOAD
  useEffect(() => {
    const saved = sessionStorage.getItem("token");
    if (saved) setToken(saved);
  }, []);

  // FETCH ROLE WHEN TOKEN CHANGES (IMPORTANT FIX)
  useEffect(() => {
    const fetchRole = async () => {
      if (!token) {
        setRole(null);
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Invalid token");

        const data = await res.json();
        setRole(data.role);
      } catch {
        setToken(null);
        setRole(null);
        sessionStorage.removeItem("token");
      }
    };

    fetchRole();
  }, [token]);

  const login = (newToken: string) => {
    sessionStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setToken(null);
    setRole(null);
    window.dispatchEvent(new Event("userLogout"));
  };

  return (
    <AuthContext.Provider value={{ token, role, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};