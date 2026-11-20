import type { Metadata } from "next";
import { AuthLayout } from "@/features/auth/components/auth-layout";
export const metadata: Metadata = { title: "Sign up" };
export default function SignupPage() {
  return <AuthLayout mode="signup" />;
}
