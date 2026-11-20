"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useLazyProfileQuery,
} from "@/store/api/enhanced-api";
import type { LoginDto, RegisterDto } from "@/store/api/generated/api";
import { apiErrorCode, apiErrorMessage, notifyUnexpectedRequestError } from "../api-error";
import { routes, accountHome } from "@/lib/routes";

export function useAccountForm(mode: "login" | "signup") {
  const router = useRouter();
  const [step, setStep] = useState<
    "credentials" | "verification" | "login-required"
  >("credentials");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const pendingCredentials = useRef<LoginDto | null>(null);
  const lock = useRef(false);
  const mounted = useRef(true);
  const [login, loginState] = useLoginMutation();
  const [register, registerState] = useRegisterMutation();
  const [verify, verifyState] = useVerifyOtpMutation();
  const [resend, resendState] = useResendOtpMutation();
  const [loadProfile] = useLazyProfileQuery();
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pendingCredentials.current = null;
    };
  }, []);

  async function finishLogin(credentials: LoginDto) {
    let destination: string = routes.profile;
    try {
      const response = await login({ loginDto: credentials }).unwrap();
      const role = response.data.user.global_role;
      destination = accountHome(role);
    } finally {
      loginState.reset();
    }
    pendingCredentials.current = null;
    if (mounted.current) router.replace(destination);
    void loadProfile(undefined, false)
      .unwrap()
      .catch(() => undefined);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    setErrorMessage("");
    lock.current = true;
    setBusy(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    const text = (name: string) => String(data.get(name) ?? "");
    try {
      if (mode === "signup") {
        const role = text("role");
        if (role !== "Passenger" && role !== "Driver")
          throw new Error("Choose an account role.");
        const dto: RegisterDto = {
          first_name: text("first_name").trim(),
          ...(text("last_name").trim()
            ? { last_name: text("last_name").trim() }
            : {}),
          email: text("email").trim().toLowerCase(),
          phone_number: text("phone_number").replace(/\s/g, ""),
          password: text("password"),
          role,
        };
        pendingCredentials.current = {
          email: dto.email,
          password: dto.password,
        };
        try {
          await register({ registerDto: dto }).unwrap();
        } finally {
          registerState.reset();
        }
        if (!mounted.current) return;
        setVerificationEmail(dto.email);
        setStep("verification");
      } else {
        const dto: LoginDto = {
          ...(text("login_method") === "phone"
            ? { phone_number: text("phone_number").replace(/\s/g, "") }
            : { email: text("email").trim().toLowerCase() }),
          password: text("password"),
        };
        try {
          await finishLogin(dto);
        } catch (error) {
          if (apiErrorCode(error) === "EMAIL_NOT_VERIFIED") {
            pendingCredentials.current = dto;
            setVerificationEmail(dto.email ?? "");
            setStep("verification");
          } else throw error;
        }
      }
    } catch (error) {
      pendingCredentials.current = null;
      if (mounted.current) {
        setErrorMessage(apiErrorMessage(error));
        notifyUnexpectedRequestError(error);
      }
    } finally {
      const password = form.elements.namedItem("password");
      if (password instanceof HTMLInputElement) password.value = "";
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    setErrorMessage("");
    lock.current = true;
    setBusy(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    const address = String(data.get("verification_email") ?? verificationEmail)
      .trim()
      .toLowerCase();
    try {
      try {
        await verify({
          verifyOtpDto: {
            email: address,
            otp: String(data.get("otp") ?? "").trim(),
          },
        }).unwrap();
      } finally {
        verifyState.reset();
      }
      if (!mounted.current) return;
      const credentials = pendingCredentials.current;
      pendingCredentials.current = null;
      if (!credentials) {
        setStep("login-required");
        return;
      }
      try {
        await finishLogin(credentials);
      } catch (error) {
        if (mounted.current) {
          setStep("login-required");
          setErrorMessage(apiErrorMessage(error));
          notifyUnexpectedRequestError(error);
        }
      }
    } catch (error) {
      if (mounted.current) {
        setErrorMessage(apiErrorMessage(error));
        notifyUnexpectedRequestError(error);
      }
    } finally {
      const otp = form.elements.namedItem("otp");
      if (otp instanceof HTMLInputElement) otp.value = "";
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  async function resendCode() {
    if (lock.current || !verificationEmail.trim()) return;
    setErrorMessage("");
    lock.current = true;
    setResending(true);
    try {
      await resend({
        resendOtpDto: { email: verificationEmail.trim().toLowerCase() },
      }).unwrap();
    } catch (error) {
      if (mounted.current) {
        setErrorMessage(apiErrorMessage(error));
        notifyUnexpectedRequestError(error);
      }
    } finally {
      resendState.reset();
      lock.current = false;
      if (mounted.current) setResending(false);
    }
  }
  function returnToLogin() {
    pendingCredentials.current = null;
    setErrorMessage("");
    setStep("credentials");
    if (mode === "signup") router.replace(routes.login);
  }
  return {
    errorMessage,
    returnToLogin,
    step,
    verificationEmail,
    setVerificationEmail,
    busy: busy || resending,
    resending,
    submit,
    verifyCode,
    resendCode,
  };
}
