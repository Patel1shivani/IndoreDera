/*
 * Shared data server ka client.
 *
 * Site (8080) aur admin panel (5174) alag origin par chalte hain, isliye unka
 * localStorage alag hota hai. Ye client beech wale server (4000) se baat karta
 * hai taaki dono ek hi data dekhein.
 *
 * Server band ho to sab kuch localStorage par chalta rehta hai — app kabhi
 * tootti nahi, bas dono apps ka data alag ho jaata hai.
 */

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "http://localhost:4000";

export interface RemoteState<TSiteData, TUser> {
  siteData: TSiteData | null;
  users: TUser[];
  updatedAt: number;
}

/** Ek hi baar warn karein, har failed request par nahi. */
let warned = false;

function warnOnce(error: unknown) {
  if (warned) return;
  warned = true;
  console.info(
    `[indoredera] Data server (${API_BASE}) nahi mila — localStorage par chal rahe hain. ` +
      `Dono apps ka data share karne ke liye indoredera-api folder me "npm run dev" chalayein.`,
    error,
  );
}

async function request<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { "content-type": "application/json", ...init?.headers },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  } catch (error) {
    warnOnce(error);
    return null;
  }
}

export function fetchRemoteState<TSiteData, TUser>() {
  return request<RemoteState<TSiteData, TUser>>("/api/state");
}

export function pushSiteData(siteData: unknown) {
  return request("/api/site-data", { method: "PUT", body: JSON.stringify(siteData) });
}

export function pushUsers(users: unknown[]) {
  return request("/api/users", { method: "PUT", body: JSON.stringify(users) });
}

export const apiBase = API_BASE;
