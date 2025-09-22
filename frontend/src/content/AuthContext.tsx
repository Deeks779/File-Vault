import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {jwtDecode} from "jwt-decode";

interface JWTPayload {
  user_id: number;
  role: string; 
  exp: number;
}

interface AuthContextType {
  isLoggedIn: boolean;
  role: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        setRole(decoded.role);
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
        setRole(null);
        setIsLoggedIn(false);
      }
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
      if (token) {
        try {
          const decoded = jwtDecode<JWTPayload>(token);
          setRole(decoded.role);
        } catch {
          setRole(null);
        }
      } else {
        setRole(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true);
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      setRole(decoded.role);
    } catch {
      setRole(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setRole(null);
  };

  const value = { isLoggedIn, role, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
