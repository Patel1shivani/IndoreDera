import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { sendMail } from "./mailer";
import { fetchRemoteState, pushUsers } from "./remote-store";

/*
 * Client-side demo auth. Users aur session browser ke localStorage me rehte hain —
 * jab asli backend aa jaaye to sirf yeh file badalni padegi, UI waisa hi rahega.
 *
 * TODO(backend): login/register ko POST /api/auth/* se replace karein aur
 * session ko httpOnly JWT cookie me rakhein. Field names backend se match karte hain.
 */

export type Role = "tenant" | "owner" | "admin";

/** Har owner ko itni listings free milti hain, uske baad plan lena padta hai. */
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

type StoredUser = User & { passwordHash: string };

const USERS_KEY = "indoredera:users";
const SESSION_KEY = "indoredera:session";

export class AuthError extends Error {}

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readUsers(): StoredUser[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as StoredUser[]) : [];
  } catch {
    return [];
  }
}

/** localStorage sync rehta hai (baaki code sync padhta hai) aur shared server
 *  ko background me bhej dete hain, taaki admin app bhi wahi users dekhe. */
function writeUsers(users: StoredUser[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  void pushUsers(users);
}

function toPublicUser({ id, name, phone, email, role, plan }: StoredUser): User {
  return { id, name, phone, email, role, plan };
}

async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(`indoredera:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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
 */
export function canPostListing(user: User | null, listingsPosted: number) {
  if (!user) return { allowed: false, reason: "login" as const };
  if (listingsPosted < FREE_LISTINGS_PER_OWNER) return { allowed: true, reason: "free" as const };
  if (isPlanActive(user.plan)) return { allowed: true, reason: "plan" as const };
  return { allowed: false, reason: "plan-required" as const };
}

type AuthContextValue = {
  user: User | null;
  /** SSR/hydration ke baad hi localStorage padha jaata hai. */
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
  /** Plan kharidne ke baad user par save karta hai. */
  activatePlan: (plan: UserPlan) => void;
  /** One-time plan se ek listing credit kam karta hai. */
  consumeListingCredit: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      // shared server par users hain to unhe localStorage me le aayein, taaki
      // site aur admin panel dono ek hi user list dekhein
      const remote = await fetchRemoteState<unknown, StoredUser>();
      if (remote?.users?.length) {
        window.localStorage.setItem(USERS_KEY, JSON.stringify(remote.users));
      }

      const users = readUsers();

      try {
        const raw = window.localStorage.getItem(SESSION_KEY);
        const sessionId = raw ? (JSON.parse(raw) as { userId?: string }).userId : undefined;
        const found = sessionId ? users.find((u) => u.id === sessionId) : undefined;
        if (found && !cancelled) setUser(toPublicUser(found));
      } catch {
        // corrupt session — ignore aur logged-out maan lo
      }
      if (!cancelled) setReady(true);
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const startSession = useCallback((stored: StoredUser) => {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: stored.id }));
    const publicUser = toPublicUser(stored);
    setUser(publicUser);
    return publicUser;
  }, []);

  /** User record ko localStorage aur state dono me update karta hai. */
  const patchUser = useCallback((patch: Partial<StoredUser>) => {
    setUser((current) => {
      if (!current) return current;
      const users = readUsers();
      const index = users.findIndex((u) => u.id === current.id);
      if (index === -1) return current;
      users[index] = { ...users[index], ...patch };
      writeUsers(users);
      return toPublicUser(users[index]);
    });
  }, []);

  const register = useCallback<AuthContextValue["register"]>(
    async ({ name, phone, email, password, role }) => {
      const users = readUsers();
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPhone = normalizePhone(phone);

      if (normalizedPhone.length !== 10) {
        throw new AuthError("Mobile number 10 digit ka hona chahiye.");
      }
      if (password.length < 6) {
        throw new AuthError("Password kam se kam 6 character ka rakhein.");
      }
      if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
        throw new AuthError("Yeh email pehle se registered hai. Login karein.");
      }
      if (users.some((u) => normalizePhone(u.phone) === normalizedPhone)) {
        throw new AuthError("Yeh mobile number pehle se registered hai. Login karein.");
      }

      const stored: StoredUser = {
        id: crypto.randomUUID(),
        name: name.trim(),
        phone: normalizedPhone,
        email: normalizedEmail,
        role,
        plan: null,
        passwordHash: await hashPassword(password),
      };
      writeUsers([...users, stored]);
      const publicUser = startSession(stored);
      await sendMail({
        to: publicUser.email,
        template: "welcome",
        data: { name: publicUser.name },
      });
      return publicUser;
    },
    [startSession],
  );

  const login = useCallback<AuthContextValue["login"]>(
    async ({ identifier, password }) => {
      const trimmed = identifier.trim().toLowerCase();
      const asPhone = normalizePhone(identifier);
      const found = readUsers().find(
        (u) =>
          u.email.toLowerCase() === trimmed ||
          (asPhone.length === 10 && normalizePhone(u.phone) === asPhone),
      );

      if (!found || found.passwordHash !== (await hashPassword(password))) {
        throw new AuthError("Email/mobile ya password galat hai.");
      }
      const publicUser = startSession(found);
      await sendMail({
        to: publicUser.email,
        template: "welcome",
        data: { name: publicUser.name },
      });
      return publicUser;
    },
    [startSession],
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const activatePlan = useCallback(
    (plan: UserPlan) => {
      patchUser({ plan });
    },
    [patchUser],
  );

  const consumeListingCredit = useCallback(() => {
    setUser((current) => {
      if (!current?.plan || current.plan.credits === null) return current;
      const users = readUsers();
      const index = users.findIndex((u) => u.id === current.id);
      if (index === -1) return current;
      const plan = users[index].plan;
      if (!plan || plan.credits === null) return current;
      users[index] = { ...users[index], plan: { ...plan, credits: Math.max(0, plan.credits - 1) } };
      writeUsers(users);
      return toPublicUser(users[index]);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      login,
      register,
      logout,
      activatePlan,
      consumeListingCredit,
    }),
    [user, ready, login, register, logout, activatePlan, consumeListingCredit],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth ko <AuthProvider> ke andar hi use karein");
  return ctx;
}
