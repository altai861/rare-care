"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogOut, UserCircle2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import type { AuthUser } from "@/lib/data/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import {
  loginSchema,
  registerSchema,
  type LoginFormValues,
  type RegisterFormValues
} from "@/lib/validation/forms";

export function AuthControls({
  currentUser,
  dictionary
}: {
  currentUser: AuthUser | null;
  dictionary: Dictionary;
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [feedback, setFeedback] = useState<{
    type: "idle" | "error" | "success";
    message?: string;
  }>({ type: "idle" });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  useEffect(() => {
    if (!modalOpen) {
      setFeedback({ type: "idle" });
      loginForm.reset();
      registerForm.reset();
      setMode("login");
    }
  }, [loginForm, modalOpen, registerForm]);

  async function submitTo(endpoint: string, values: LoginFormValues | RegisterFormValues) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setFeedback({
        type: "error",
        message: payload.message || dictionary.common.submitError
      });
      return false;
    }

    setFeedback({
      type: "success",
      message:
        endpoint.includes("/register")
          ? dictionary.auth.registerSuccess
          : dictionary.auth.loginSuccess
    });
    setModalOpen(false);
    router.refresh();
    return true;
  }

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST"
      });

      if (!response.ok) {
        setFeedback({
          type: "error",
          message: dictionary.auth.logoutError
        });
        return;
      }

      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      {currentUser ? (
        <div className="auth-inline">
          <div className="auth-user-pill">
            <UserCircle2 size={20} />
            <span>{currentUser.name}</span>
          </div>
          <button
            className="auth-logout-button"
            disabled={isLoggingOut}
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={18} />
            {dictionary.auth.logout}
          </button>
        </div>
      ) : (
        <button
          aria-label={dictionary.auth.open}
          className="profile-badge"
          onClick={() => setModalOpen(true)}
          type="button"
        >
          <UserCircle2 size={22} />
        </button>
      )}
      {modalOpen ? (
        <div
          className="auth-modal-backdrop"
          onClick={() => setModalOpen(false)}
          role="presentation"
        >
          <div
            aria-modal="true"
            className="auth-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button
              aria-label={dictionary.auth.close}
              className="auth-close"
              onClick={() => setModalOpen(false)}
              type="button"
            >
              <X size={20} />
            </button>
            <div className="auth-tabs">
              <button
                className={mode === "login" ? "is-active" : undefined}
                onClick={() => setMode("login")}
                type="button"
              >
                {dictionary.auth.loginTab}
              </button>
              <button
                className={mode === "register" ? "is-active" : undefined}
                onClick={() => setMode("register")}
                type="button"
              >
                {dictionary.auth.registerTab}
              </button>
            </div>
            {mode === "login" ? (
              <form
                className="auth-form"
                onSubmit={loginForm.handleSubmit(async (values) => {
                  await submitTo("/api/auth/login", values);
                })}
              >
                <h2>{dictionary.auth.loginTitle}</h2>
                <p>{dictionary.auth.loginBody}</p>
                <div className="field-group">
                  <label htmlFor="login-email">{dictionary.auth.email}</label>
                  <input
                    id="login-email"
                    type="email"
                    {...loginForm.register("email")}
                  />
                  {loginForm.formState.errors.email ? (
                    <p className="field-error">
                      {loginForm.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>
                <div className="field-group">
                  <label htmlFor="login-password">{dictionary.auth.password}</label>
                  <input
                    id="login-password"
                    type="password"
                    {...loginForm.register("password")}
                  />
                  {loginForm.formState.errors.password ? (
                    <p className="field-error">
                      {loginForm.formState.errors.password.message}
                    </p>
                  ) : null}
                </div>
                {feedback.type !== "idle" ? (
                  <div
                    className={`form-feedback ${
                      feedback.type === "success" ? "is-success" : "is-error"
                    }`}
                  >
                    <p>{feedback.message}</p>
                  </div>
                ) : null}
                <button
                  className="primary-button submit-button"
                  disabled={
                    !loginForm.formState.isValid || loginForm.formState.isSubmitting
                  }
                  type="submit"
                >
                  {loginForm.formState.isSubmitting
                    ? dictionary.common.sending
                    : dictionary.auth.loginAction}
                </button>
              </form>
            ) : (
              <form
                className="auth-form"
                onSubmit={registerForm.handleSubmit(async (values) => {
                  await submitTo("/api/auth/register", values);
                })}
              >
                <h2>{dictionary.auth.registerTitle}</h2>
                <p>{dictionary.auth.registerBody}</p>
                <div className="field-group">
                  <label htmlFor="register-name">{dictionary.auth.name}</label>
                  <input
                    id="register-name"
                    type="text"
                    {...registerForm.register("name")}
                  />
                  {registerForm.formState.errors.name ? (
                    <p className="field-error">
                      {registerForm.formState.errors.name.message}
                    </p>
                  ) : null}
                </div>
                <div className="field-group">
                  <label htmlFor="register-email">{dictionary.auth.email}</label>
                  <input
                    id="register-email"
                    type="email"
                    {...registerForm.register("email")}
                  />
                  {registerForm.formState.errors.email ? (
                    <p className="field-error">
                      {registerForm.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>
                <div className="field-group">
                  <label htmlFor="register-password">
                    {dictionary.auth.password}
                  </label>
                  <input
                    id="register-password"
                    type="password"
                    {...registerForm.register("password")}
                  />
                  {registerForm.formState.errors.password ? (
                    <p className="field-error">
                      {registerForm.formState.errors.password.message}
                    </p>
                  ) : null}
                </div>
                <div className="field-group">
                  <label htmlFor="register-confirm-password">
                    {dictionary.auth.confirmPassword}
                  </label>
                  <input
                    id="register-confirm-password"
                    type="password"
                    {...registerForm.register("confirmPassword")}
                  />
                  {registerForm.formState.errors.confirmPassword ? (
                    <p className="field-error">
                      {registerForm.formState.errors.confirmPassword.message}
                    </p>
                  ) : null}
                </div>
                {feedback.type !== "idle" ? (
                  <div
                    className={`form-feedback ${
                      feedback.type === "success" ? "is-success" : "is-error"
                    }`}
                  >
                    <p>{feedback.message}</p>
                  </div>
                ) : null}
                <button
                  className="primary-button submit-button"
                  disabled={
                    !registerForm.formState.isValid ||
                    registerForm.formState.isSubmitting
                  }
                  type="submit"
                >
                  {registerForm.formState.isSubmitting
                    ? dictionary.common.sending
                    : dictionary.auth.registerAction}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
