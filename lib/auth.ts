// Sign in / sign up against the same Supabase project the Aether Studio app uses.
// Set both values in .env.local (see .env.example). Without them the screens still work as
// a front door: they validate, then hand the visitor to the app to finish.

import { APP_URL } from "./content";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const authConnected = Boolean(URL_ && KEY);

export type AuthResult =
  | { status: "signed-in" }
  | { status: "confirm-email" }
  | { status: "handoff" }
  | { status: "error"; message: string };

const friendly = (raw: string) => {
  const m = raw.toLowerCase();
  if (m.includes("invalid login")) return "That email and password don't match. Check them and try again.";
  if (m.includes("already registered") || m.includes("already exists")) return "There's already an account with that email. Sign in instead.";
  if (m.includes("rate") || m.includes("too many")) return "Too many requests. Please wait and try again.";
  if (m.includes("not confirmed")) return "Confirm your email first: we sent you a link.";
  return raw || "Something went wrong. Please try again.";
};

async function call(path: string, body: unknown): Promise<AuthResult> {
  if (!authConnected) return { status: "handoff" };
  try {
    const res = await fetch(`${URL_}/auth/v1/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: KEY! },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { status: "error", message: friendly(data.error_description || data.msg || data.message || "") };
    if (data.access_token) {
      // same storage key supabase-js uses, so an app on this origin picks the session up
      const ref = new URL(URL_!).hostname.split(".")[0];
      try {
        localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify(data));
      } catch {}
      return { status: "signed-in" };
    }
    return { status: "confirm-email" };
  } catch {
    return { status: "error", message: "Can't reach the server. Check your connection and try again." };
  }
}

export const signIn = (email: string, password: string) => call("token?grant_type=password", { email, password });
export const signUp = (name: string, email: string, password: string) =>
  call("signup", { email, password, data: { full_name: name } });

export const AFTER_AUTH = APP_URL;
