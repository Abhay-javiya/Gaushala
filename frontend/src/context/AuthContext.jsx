
import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("token");
    const expireSession = () => { setAdmin(null); setAuthReady(true); };
    window.addEventListener("auth:expired", expireSession);
    if (!token) {
      localStorage.removeItem("admin");
      setAuthReady(true);
    } else {
      api.get("/auth/me").then(({ data }) => {
        if (!active) return;
        localStorage.setItem("admin", JSON.stringify(data.admin));
        setAdmin(data.admin);
      }).catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("admin");
        if (active) setAdmin(null);
      }).finally(() => active && setAuthReady(true));
    }
    return () => { active = false; window.removeEventListener("auth:expired", expireSession); };
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password
    });

    const { token, admin } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("admin", JSON.stringify(admin));

    setAdmin(admin);
    setAuthReady(true);

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    setAdmin(null);
    setAuthReady(true);
  };

  const isAuthenticated = Boolean(authReady && admin?.role === "admin" && localStorage.getItem("token"));

  return (
    <AuthContext.Provider
      value={{ admin: isAuthenticated ? admin : null, login, logout, isAuthenticated, authReady }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
