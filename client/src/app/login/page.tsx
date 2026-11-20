import type { Metadata } from "next";
import { AuthLayout } from "@/features/auth/components/auth-layout";
export const metadata: Metadata = { title: "Login" };
export default function LoginPage() {
  return <AuthLayout mode="login" />;
}
