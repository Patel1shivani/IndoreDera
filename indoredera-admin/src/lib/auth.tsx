import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError, getToken, setToken } from "./api";
import type { User } from "./types";

/*
 * Admin session.
 *
 * Password compare server par hota hai (bcrypt) aur "kya ye admin hai" bhi
 * server hi decide karta hai — yahan sirf JWT rakha jaata hai. Pehle users ki
 * poori list client par aati thi aur hash yahin compare hota tha; ab wo list
 * login se pehle milti hi nahi.
 */

type AuthValue = {
  admin: User | null;
  /** Purana token verify hone tak false — tab tak login screen mat dikhao. */
  ready: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export class LoginError extends Error {}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  // reload par purana token abhi bhi valid ho sakta hai
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!getToken()) {
        setReady(true);
        return;
      }
      try {
        const { user } = await api.me();
        if (!cancelled && user.role === "admin") setAdmin(user);
      } catch {
        /* expire/invalid token ya server band — dono me logged-out maan lete hain */
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    let session: { token: string; user: User };
    try {
      session = await api.login(identifier, password);
    } catch (err) {
      throw new LoginError(err instanceof ApiError ? err.message : "Login nahi ho paaya.");
    }

    /* Non-admin ka token save nahi karte. Server waise bhi har admin route par
       role check karta hai, par panel me ghusne dena confusing hoga. */
    if (session.user.role !== "admin") {
      throw new LoginError(`Ye account "${session.user.role}" hai — admin access nahi hai.`);
    }

    setToken(session.token);
    setAdmin(session.user);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setAdmin(null);
    void api.logout().catch(() => {});
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ admin, ready, login, logout }),
    [admin, ready, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAdminAuth ko <AuthProvider> ke andar hi use karein");
  return ctx;
}

/* Demo shortcut — production me hata dena hai. Ye credentials backend ke .env
   (ADMIN_EMAIL / ADMIN_PASSWORD) se aate hain. */
export const demoCredentials = { email: "admin@indoredera.in", password: "admin123" };
