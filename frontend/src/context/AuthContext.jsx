import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "@/lib/api";


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (location.hash.includes("session_id=")) {
      setLoading(false);
      return;
    }
    if (!document.cookie.split("; ").some((item) => item.startsWith("csrf_token="))) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch (_) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [location.hash]);

  useEffect(() => { loadUser(); }, [loadUser]);
  useEffect(() => {
    const expire = () => setUser(null);
    window.addEventListener("moodbite:session-expired", expire);
    return () => window.removeEventListener("moodbite:session-expired", expire);
  }, []);

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    setUser(data);
    return data;
  };

  const register = async (details) => {
    const { data } = await api.post("/auth/register", details);
    setUser(data);
    return data;
  };

  const completeGoogle = async (sessionId) => {
    const { data } = await api.post("/auth/google/session", { session_id: sessionId });
    setUser(data);
    return data;
  };

  const startGoogle = (next = "/profile") => {
    const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/profile";
    sessionStorage.setItem("moodbite:oauth-next", safeNext);
    const redirect = `${window.location.origin}/auth/callback`;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirect)}`;
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } finally { setUser(null); }
  };

  const value = useMemo(() => ({
    user, loading, authenticated: Boolean(user), login, register, completeGoogle, startGoogle, logout, reloadUser: loadUser,
  }), [user, loading, loadUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
