/*
 * Backend API ka client.
 *
 * Poori website isi file se server se baat karti hai — kahin aur `fetch` nahi
 * hona chahiye. Token yahin rehta hai, error yahin normalize hote hain.
 *
 * Session JWT localStorage me rehta hai aur har request par
 * `Authorization: Bearer` header me jaata hai. Server httpOnly cookie bhi set
 * karta hai (same-origin deploy ke liye), par site aur API alag port par hain
 * isliye primary raasta header hi hai.
 */

export const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? "http://localhost:4000";

const TOKEN_KEY = "indoredera:token";

export class ApiError extends Error {
  readonly status: number;
  readonly details?: Record<string, string>;

  constructor(status: number, message: string, details?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }

  /** Server tak pahuncha hi nahi (band hai / network gaya). */
  static offline() {
    return new ApiError(
      0,
      `Server (${API_BASE}) se connect nahi ho paaya. ` +
        `indoredera-api folder me "npm run dev" chala hai kya?`,
    );
  }
}

/* ------------------------------------------------------------------ token */

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

/** Token badalne par jin providers ko dobara load karna hai (site-data), unke liye. */
type Listener = (token: string | null) => void;
const listeners = new Set<Listener>();

/** @returns unsubscribe — useEffect ka cleanup seedha ise return kar sakta hai. */
export function onTokenChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (!isBrowser()) return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
  listeners.forEach((fn) => fn(token));
}

/* ---------------------------------------------------------------- request */

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** 401 par token clear na karein (login attempt ka apna message dikhana hai). */
  keepSessionOn401?: boolean;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, keepSessionOn401 } = options;
  const token = getToken();

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      // cookie wala fallback bhi kaam kare (same-origin deploy)
      credentials: "include",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw ApiError.offline();
  }

  if (res.status === 204) return undefined as T;

  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    // khaali ya non-JSON body — niche status se hi error bana lenge
  }

  if (!res.ok) {
    const error = (payload as { error?: { message?: string; details?: Record<string, string> } })
      ?.error;

    /* Token expire/invalid ho gaya — use rakhna bekaar hai, har agli request
       bhi 401 hi degi. Login attempt is se bacha rehta hai. */
    if (res.status === 401 && !keepSessionOn401) setToken(null);

    throw new ApiError(res.status, error?.message ?? `Server ne ${res.status} bheja.`, error?.details);
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
