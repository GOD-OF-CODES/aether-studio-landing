import type { Metadata } from "next";
import AuthScreen from "@/components/AuthScreen";

export const metadata: Metadata = { title: "Create your account — Aether Studio" };

export default function Page() {
  return <AuthScreen initial="signup" />;
}
