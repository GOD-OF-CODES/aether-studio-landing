import type { Metadata } from "next";
import AuthScreen from "@/components/AuthScreen";

export const metadata: Metadata = { title: "Sign in — Aether Studio" };

export default function Page() {
  return <AuthScreen initial="login" />;
}
