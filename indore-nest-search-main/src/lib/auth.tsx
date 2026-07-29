import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError as ClientApiError, getToken, setToken } from "./api-client";
import { sendMail } from "./mailer";

/*
 * Auth — poora backend par.
 *
 * Password kabhi browser me hash nahi hota, users ki list client par nahi aati,
 * aur role/plan wahi hai jo server kehta hai. Yahan sirf session JWT aur
 * current user ka snapshot rehta hai.
 *
 * Component ke liye ye file waisi hi dikhti hai jaisi pehle thi — `useAuth()`
 * ke methods same hain, bas ab sab `Promise` return karte hain.
 */

export type Role = "tenant" | "owner" | "admin";

/** Har owner ko itni listings free milti hain, uske baad plan lena padta hai.
 *  Asli enforcement server par hai — ye sirf UI ka message banane ke liye hai. */
export const FREE_LISTINGS_PER_OWNER = 1;

export interface UserPlan {
  id: string;
  label: string;
  /** null = unlimited listings jab tak plan valid hai */
  credits: number | null;
  /** null = kabhi expire nahi hota (one-time plan) */
  expiresAt: number | null;
}

export type User = {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: Role;
  plan: UserPlan | null;
};

/** UI purane `AuthError` ko catch karta hai — API errors bhi isi ke through aate hain. */
export class AuthError extends Error {}

/** ApiError ko AuthError me badalta hai taaki call sites ka catch same rahe. */
function toAuthError(error: unknown): AuthError {
  if (error instanceof ClientApiError) return new AuthError(error.message);
  if (error instanceof Error) return new AuthError(error.message);
  return new AuthError("Kuch galat ho gaya. Dobara try karein.");
}

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

/** Plan abhi valid hai ya expire ho gaya. */
export function isPlanActive(plan: UserPlan | null): plan is UserPlan {
  if (!plan) return false;
  if (plan.expiresAt !== null && plan.expiresAt < Date.now()) return false;
  return plan.credits === null || plan.credits > 0;
}

/**
 * Owner nayi listing daal sakta hai ya nahi.
 * Pehli listing free — uske baad active plan chahiye.
 *
 * Server bhi bilkul yahi check karta hai (POST /api/properties → 402); ye copy
 * sirf isliye hai taaki form kholne se pehle hi sahi screen dikhe.
 */
export function canPostListing(user: User | null, listingsPosted: number) {
  if (!user) return { allowed: false, reason: "login" as const };
  if (listingsPosted < FREE_LISTINGS_PER_OWNER) return { allowed: true, reason: "free" as const };
  if (isPlanActive(user.plan)) return { allowed: true, reason: "plan" as const };
  return { allowed: false, reason: "plan-required" as const };
}

type SessionResponse = { token: string; user: User };

type AuthContextValue = {
  user: User | null;
  /** Session check hone ke baad hi true. */
  ready: boolean;
  login: (input: { identifier: string; password: string }) => Promise<User>;
  register: (input: {
    name: string;
    phone: string;
    email: string;
    password: string;
    role: Exclude<Role, "admin">;
  }) => Promise<User>;
  logout: () => void;
  /** Profile page se naam/phone/email update karta hai. */
  updateProfile: (input: { name: string; phone: string; email: string }) => Promise<User>;
  /** Purana password verify karke naya set karta hai. */
  changePassword: (input: { current: string; next: string }) => Promise<void>;
  /** Plan kharidta hai — server plan ka snapshot user par chipka deta hai. */
  activatePlan: (planId: string) => Promise<User>;
  /** Server se taaza user leta hai (listing post karne ke baad credits update). */
  refreshUser: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  // page load par: token ho to server se verify karke user le aao
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!getToken()) {
        setReady(true);
        return;
      }
      try {
        const { user: me } = await api.get<{ user: User }>("/api/auth/me");
        if (!cancelled) setUser(me);
      } catch {
        /* Token purana/invalid hai (api-client ne use clear bhi kar diya) ya
           server band hai — dono me logged-out maan lete hain. */
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const startSession = useCallback(({ token, user: next }: SessionResponse) => {
    setToken(token);
    setUser(next);
    return next;
  }, []);

  const register = useCallback<AuthContextValue["register"]>(
    async ({ name, phone, email, password, role }) => {
      try {
        const session = await api.post<SessionResponse>("/api/auth/register", {
          name,
          phone,
          email,
          password,
          role,
        });
        const next = startSession(session);
        await sendMail({ to: next.email, template: "welcome", data: { name: next.name } });
        return next;
      } catch (error) {
        throw toAuthError(error);
      }
    },
    [startSession],
  );

  const login = useCallback<AuthContextValue["login"]>(
    async ({ identifier, password }) => {
      try {
        const session = await api.post<SessionResponse>(
          "/api/auth/login",
          { identifier, password },
          // galat password par purana session mat udaao
          { keepSessionOn401: true },
        );
        const next = startSession(session);
        await sendMail({ to: next.email, template: "login-alert", data: { name: next.name } });
        return next;
      } catch (error) {
        throw toAuthError(error);
      }
    },
    [startSession],
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    // cookie bhi hataani hai; fail ho to bhi client-side logout ho chuka hai
    void api.post("/api/auth/logout").catch(() => {});
  }, []);

  const updateProfile = useCallback<AuthContextValue["updateProfile"]>(
    async ({ name, phone, email }) => {
      try {
        const { user: next } = await api.patch<{ user: User }>("/api/auth/profile", {
          name,
          phone,
          email,
        });
        setUser(next);
        return next;
      } catch (error) {
        throw toAuthError(error);
      }
    },
    [],
  );

  const changePassword = useCallback<AuthContextValue["changePassword"]>(async ({ current, next }) => {
    try {
      await api.post("/api/auth/change-password", { current, next });
    } catch (error) {
      throw toAuthError(error);
    }
  }, []);

  const activatePlan = useCallback<AuthContextValue["activatePlan"]>(async (planId) => {
    try {
      const { user: next } = await api.post<{ user: User }>(`/api/plans/${planId}/purchase`);
      setUser(next);
      return next;
    } catch (error) {
      throw toAuthError(error);
    }
  }, []);

  const refreshUser = useCallback<AuthContextValue["refreshUser"]>(async () => {
    if (!getToken()) return null;
    try {
      const { user: next } = await api.get<{ user: User }>("/api/auth/me");
      setUser(next);
      return next;
    } catch {
      return null; // network hichki se logged-in user ko bahar mat karo
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      activatePlan,
      refreshUser,
    }),
    [user, ready, login, register, logout, updateProfile, changePassword, activatePlan, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth ko <AuthProvider> ke andar hi use karein");
  return ctx;
}
