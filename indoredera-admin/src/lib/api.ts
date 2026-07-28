import type { ServerState, SiteData, User } from "./types";

/**
 * Shared data server ka client.
 *
 * Website (8080) aur ye admin app (5174) alag origin par hain, isliye unka
 * localStorage share nahi hota. Saara data isi server (4000) se aata-jaata hai.
 */

export const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? "http://localhost:4000";

export class ApiError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { "content-type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError(
      `Data server (${API_BASE}) se connect nahi ho paaya. ` +
        `indoredera-api folder me "npm run dev" chala hai kya?`,
    );
  }
  if (!res.ok) throw new ApiError(`Server ne ${res.status} ${res.statusText} bheja`);
  return (await res.json()) as T;
}

export const api = {
  getState: () => request<ServerState>("/api/state"),

  putSiteData: (siteData: SiteData) =>
    request<{ ok: boolean }>("/api/site-data", {
      method: "PUT",
      body: JSON.stringify(siteData),
    }),

  putUsers: (users: User[]) =>
    request<{ ok: boolean }>("/api/users", {
      method: "PUT",
      body: JSON.stringify(users),
    }),
};

/** Passwords website me isi tarah hash hote hain — dono ka match zaroori hai. */
export async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(`indoredera:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
