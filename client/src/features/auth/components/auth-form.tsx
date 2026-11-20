"use client";
import { useId, useState, useEffect } from "react";
import Link from "next/link";
import {
  Button,
  Form,
  TextField,
  Label,
  Input,
  FieldError,
  Radio,
  RadioGroup,
} from "@heroui/react";
import { Icon } from "@/components/ui/icon";
import { routes, accountHome } from "@/lib/routes";
import { useRouter } from "next/navigation";
import { useSession } from "../hooks/use-session";
import { useAccountForm } from "../hooks/use-account-form";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const formId = useId();
  const [visible, setVisible] = useState(false);
  const account = useAccountForm(mode);
  const router = useRouter();
  const session = useSession();
  useEffect(() => {
    if (session.status === "authenticated" && session.user && !account.busy)
      router.replace(accountHome(session.user.global_role));
  }, [session.status, session.user, account.busy, router]);
  const [role, setRole] = useState<"Passenger" | "Driver">("Passenger");
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91");
  const signup = mode === "signup";
  if (account.step !== "credentials")
    return (
      <Form
        className="auth-form"
        validationBehavior="native"
        onSubmit={account.verifyCode}
        aria-busy={account.busy}
      >
        {account.errorMessage && <p role="alert" className="form-status form-error">{account.errorMessage}</p>}
        <div className="verification-heading">
          <Icon name="mail" width={28} height={28} />
          <h2>
            {account.step === "login-required"
              ? "You’re verified."
              : "Check your inbox."}
          </h2>
          <p>
            {account.step === "login-required"
              ? "Your email is ready. Log in to begin your journey."
              : "Enter the six-digit code for your account’s email address."}
          </p>
        </div>
        {account.step === "verification" && (
          <>
            <TextField
              id={`${formId}-verification-email`}
              aria-labelledby={`${formId}-verification-email-label`}
              name="verification_email"
              type="email"
              isRequired
              value={account.verificationEmail}
              onChange={account.setVerificationEmail}
              isReadOnly={signup || loginMethod === "email"}
              isDisabled={account.busy}
              className="safar-field"
            >
              <Label
                id={`${formId}-verification-email-label`}
                htmlFor={`${formId}-verification-email`}
              >
                Account email
              </Label>
              <Input autoComplete="email" placeholder="you@example.com" />
              <FieldError />
            </TextField>
            <TextField
              id={`${formId}-otp`}
              aria-labelledby={`${formId}-otp-label`}
              name="otp"
              isRequired
              minLength={6}
              maxLength={6}
              pattern="[0-9]{6}"
              isDisabled={account.busy}
              className="safar-field"
            >
              <Label id={`${formId}-otp-label`} htmlFor={`${formId}-otp`}>
                Verification code
              </Label>
              <Input
                autoComplete="one-time-code"
                inputMode="numeric"
                placeholder="000000"
                className="otp-input"
              />
              <FieldError />
            </TextField>
            <Button
              type="submit"
              className="form-submit"
              fullWidth
              isDisabled={account.busy}
            >
              {account.busy && !account.resending
                ? "Verifying…"
                : "Verify & continue"}
              <Icon name="arrow" width={18} height={18} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onPress={account.resendCode}
              isDisabled={account.busy || !account.verificationEmail.trim()}
            >
              {account.resending
                ? "Requesting a code…"
                : "Resend verification code"}
            </Button>
          </>
        )}
        <Button
          type="button"
          variant="ghost"
          onPress={account.returnToLogin}
          isDisabled={account.busy}
        >
          Return to login
        </Button>
      </Form>
    );
  return (
    <Form
      className={`auth-form auth-form--${mode}`}
      validationBehavior="native"
      onSubmit={account.submit}
      aria-busy={account.busy}
    >
      {account.errorMessage && <p role="alert" className="form-status form-error">{account.errorMessage}</p>}
      {signup && (
        <RadioGroup
          name="role"
          isDisabled={account.busy}
          value={role}
          onChange={(value) => {
            if (value === "Passenger" || value === "Driver") setRole(value);
          }}
          isRequired
          orientation="horizontal"
          aria-labelledby={`${formId}-role-label`}
          className="auth-choice-group"
        >
          <Label id={`${formId}-role-label`}>I’m joining as</Label>
          <div className="role-options">
            <Radio
              value="Passenger"
              className="role-option"
              aria-labelledby={`${formId}-passenger-label`}
            >
              <Radio.Content>
                <span className="role-icon">
                  <Icon name="user" width={21} height={21} />
                </span>
                <span className="role-copy">
                  <Label id={`${formId}-passenger-label`}>Passenger</Label>
                  <span className="role-description">Sit back & explore</span>
                </span>
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
              </Radio.Content>
            </Radio>
            <Radio
              value="Driver"
              className="role-option"
              aria-labelledby={`${formId}-rider-label`}
            >
              <Radio.Content>
                <span className="role-icon">
                  <Icon name="car" width={21} height={21} />
                </span>
                <span className="role-copy">
                  <Label id={`${formId}-rider-label`}>Driver</Label>
                  <span className="role-description">Take the wheel</span>
                </span>
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
              </Radio.Content>
            </Radio>
          </div>
        </RadioGroup>
      )}
      {!signup && (
        <RadioGroup
          name="login_method"
          isDisabled={account.busy}
          value={loginMethod}
          onChange={(value) => {
            if (value === "email" || value === "phone") {
              setLoginMethod(value);
            }
          }}
          isRequired
          orientation="horizontal"
          aria-labelledby={`${formId}-login-method-label`}
          className="auth-choice-group login-method-group"
        >
          <Label id={`${formId}-login-method-label`}>Log in with</Label>
          <div className="role-options">
            <Radio
              value="email"
              className="role-option"
              aria-labelledby={`${formId}-email-method-label`}
            >
              <Radio.Content>
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                <Icon name="mail" width={17} height={17} />
                <Label id={`${formId}-email-method-label`}>Email address</Label>
              </Radio.Content>
            </Radio>
            <Radio
              value="phone"
              className="role-option"
              aria-labelledby={`${formId}-phone-method-label`}
            >
              <Radio.Content>
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                <Icon name="phone" width={17} height={17} />
                <Label id={`${formId}-phone-method-label`}>Phone number</Label>
              </Radio.Content>
            </Radio>
          </div>
        </RadioGroup>
      )}
      {session.reason === "expired" && !signup && (
        <p className="form-status" role="status">
          Your session has expired. Please log in again.
        </p>
      )}
      {signup && (
        <div className="name-fields">
          <TextField
            id={`${formId}-first_name`}
            aria-labelledby={`${formId}-first_name-label`}
            name="first_name"
            isRequired
            isDisabled={account.busy}
            className="safar-field"
            validate={(value) =>
              value.trim() ? null : "Enter your first name."
            }
          >
            <Label
              id={`${formId}-first_name-label`}
              htmlFor={`${formId}-first_name`}
            >
              First name
            </Label>
            <Input
              autoComplete="given-name"
              placeholder="Your first name"
              maxLength={100}
            />
            <FieldError />
          </TextField>
          <TextField
            id={`${formId}-last_name`}
            aria-labelledby={`${formId}-last_name-label`}
            name="last_name"
            isDisabled={account.busy}
            className="safar-field"
          >
            <Label
              id={`${formId}-last_name-label`}
              htmlFor={`${formId}-last_name`}
            >
              Last name <span className="optional">(optional)</span>
            </Label>
            <Input
              autoComplete="family-name"
              placeholder="Your last name"
              maxLength={100}
            />
            <FieldError />
          </TextField>
        </div>
      )}
      {(signup || loginMethod === "email") && (
        <TextField
          id={`${formId}-email`}
          aria-labelledby={`${formId}-email-label`}
          name="email"
          value={email}
          onChange={setEmail}
          type="email"
          isRequired
          isDisabled={account.busy}
          className="safar-field"
        >
          <Label id={`${formId}-email-label`} htmlFor={`${formId}-email`}>
            Email address
          </Label>
          <div className="input-with-icon">
            <Icon name="mail" width={18} height={18} />
            <Input
              autoComplete={signup ? "email" : "username"}
              placeholder="you@example.com"
              maxLength={254}
            />
          </div>
          <FieldError />
        </TextField>
      )}
      {(signup || loginMethod === "phone") && (
        <TextField
          id={`${formId}-phone_number`}
          aria-labelledby={`${formId}-phone_number-label`}
          name="phone_number"
          value={phone}
          onChange={setPhone}
          type="tel"
          isRequired
          isDisabled={account.busy}
          className="safar-field"
          validate={(value) =>
            /^\+?[1-9]\d{7,14}$/.test(value)
              ? null
              : "Enter a valid international phone number, such as +919876543210."
          }
        >
          <Label
            id={`${formId}-phone_number-label`}
            htmlFor={`${formId}-phone_number`}
          >
            Phone number
          </Label>
          <div className="input-with-icon">
            <Icon name="phone" width={18} height={18} />
            <Input
              autoComplete={signup ? "tel" : "username"}
              inputMode="tel"
              placeholder="+919876543210"
            />
          </div>
          <FieldError />
        </TextField>
      )}
      <TextField
        id={`${formId}-password`}
        aria-labelledby={`${formId}-password-label`}
        name="password"
        type={visible ? "text" : "password"}
        isRequired
        minLength={8}
        isDisabled={account.busy}
        className="safar-field"
      >
        <Label id={`${formId}-password-label`} htmlFor={`${formId}-password`}>
          Password
        </Label>
        <div className="password-control input-with-icon">
          <Icon name="lock" width={18} height={18} />
          <Input
            autoComplete={signup ? "new-password" : "current-password"}
            placeholder={signup ? "Create a password" : "Enter your password"}
          />
          <Button
            type="button"
            isIconOnly
            variant="ghost"
            className="password-toggle"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            onPress={() => setVisible(!visible)}
          >
            <Icon name={visible ? "eyeOff" : "eye"} width={19} height={19} />
          </Button>
        </div>
        <FieldError />
        {signup && (
          <p className="field-hint">
            At least 8 characters. A little harder to guess.
          </p>
        )}
      </TextField>
      {signup && (
        <p className="account-role-note">
          <Icon name="user" width={16} height={16} />
          {role === "Passenger"
            ? "Find your next destination as a passenger."
            : "Take the wheel and begin your Safar as a driver."}
        </p>
      )}
      <Button
        type="submit"
        className="form-submit"
        fullWidth
        isDisabled={account.busy}
      >
        {account.busy
          ? signup
            ? "Creating your account…"
            : "Logging in…"
          : signup
            ? "Create my account"
            : "Log in to Safar"}
        <Icon name="arrow" width={18} height={18} />
      </Button>
      <p className="auth-switch">
        {signup ? "Already part of the journey?" : "New roads ahead?"}{" "}
        <Link href={signup ? routes.login : routes.signup}>
          {signup ? "Log in" : "Create an account"}
          <Icon name="diagonal" width={13} height={13} />
        </Link>
      </p>
    </Form>
  );
}
