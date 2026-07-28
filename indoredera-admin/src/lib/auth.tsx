import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { hashPassword } from "./api";
import { useStore } from "./store";
import type { User } from "./types";

/**
 * Admin app ka apna auth. Users shared server se aate hain (wahi list jo
 * website use karti hai), session sirf is tab me rehta hai.
 *
 * TODO(backend): asli backend par ye POST /api/auth/login banega aur session
 * httpOnly JWT cookie me jaayega. Password compare server par hoga, yahan nahi.
 */

const SESSION_KEY = "indoredera-admin:session";

type AuthValue = {
  admin: User | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

export class LoginError extends Error {}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { users } = useStore();
  const [adminId, setAdminId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : window.sessionStorage.getItem(SESSION_KEY),
  );

  // users server se aate hain, isliye session id se har render par resolve karte hain
  const admin = useMemo(() => {
    const found = users.find((u) => u.id === adminId);
    return found?.role === "admin" ? found : null;
  }, [users, adminId]);

  const login = useCallback(
    async (identifier: string, password: string) => {
      const trimmed = identifier.trim().toLowerCase();
      const asPhone = normalizePhone(identifier);

      const found = users.find(
        (u) =>
          u.email.toLowerCase() === trimmed ||
          (asPhone.length === 10 && normalizePhone(u.phone) === asPhone),
      );

      if (!found || found.passwordHash !== (await hashPassword(password))) {
        throw new LoginError("Email/mobile ya password galat hai.");
      }
      if (found.role !== "admin") {
        throw new LoginError(`Ye account "${found.role}" hai — admin access nahi hai.`);
      }

      window.sessionStorage.setItem(SESSION_KEY, found.id);
      setAdminId(found.id);
    },
    [users],
  );

  const logout = useCallback(() => {
    window.sessionStorage.removeItem(SESSION_KEY);
    setAdminId(null);
  }, []);

  const value = useMemo<AuthValue>(() => ({ admin, login, logout }), [admin, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAdminAuth ko <AuthProvider> ke andar hi use karein");
  return ctx;
}

export const demoCredentials = { email: "admin@indoredera.in", password: "admin123" };
