import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = "auth_session";

function readInitialAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return { token: "", user: null };
    }
    const parsed = JSON.parse(raw);
    return {
      token: parsed.token || "",
      user: parsed.user || null,
    };
  } catch {
    return { token: "", user: null };
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readInitialAuth);

  const login = (payload) => {
    const next = {
      token: payload.token,
      user: payload.user,
    };
    setSession(next);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
  };

  const logout = () => {
    setSession({ token: "", user: null });
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      token: session.token,
      user: session.user,
      isAuthenticated: Boolean(session.token),
      login,
      logout,
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
