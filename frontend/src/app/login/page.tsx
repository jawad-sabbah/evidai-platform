"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type LoginForm = {
  email: string;
  password: string;
};

type FormErrors = Partial<Record<keyof LoginForm, string>>;

/* =========================================================
   PAGE
========================================================= */

export default function LoginPage() {
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [loginReady, setLoginReady] =
    useState(false);

  /* =========================================================
     UPDATE FIELD
  ========================================================= */

  function updateField(
    field: keyof LoginForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
    }
  }

  /* =========================================================
     VALIDATION
  ========================================================= */

  function validate() {
    const nextErrors: FormErrors = {};

    if (!form.email.trim()) {
      nextErrors.email =
        "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email,
      )
    ) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password =
        "Password is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  /* =========================================================
     LOGIN
  ========================================================= */

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    /*
      =======================================================
      FRONTEND MOCK ONLY
      =======================================================

      Later backend:

      POST /auth/login

      {
        email: form.email,
        password: form.password
      }

      Backend should eventually:

      1. Find user by email
      2. Compare password against password_hash
      3. Reject invalid credentials
      4. Create authenticated session/token
      5. Return user/session data
      6. Redirect to user.default_landing_page

      DO NOT query by raw password.
      DO NOT store raw passwords.
      DO NOT implement this in the frontend.

      Auth/session handling is intentionally not
      implemented yet.
    */

    setTimeout(() => {
      setIsSubmitting(false);
      setLoginReady(true);
    }, 900);
  }

  /* =========================================================
     MOCK SUCCESS
  ========================================================= */

  if (loginReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F7F3] px-6">
        <div className="w-full max-w-[520px]">
          <div className="rounded-[24px] border border-[#DDE5DF] bg-white p-8 text-center shadow-[0_24px_70px_rgba(25,45,36,0.08)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7F2EC] text-[#19704F]">
              <Check size={24} />
            </div>

            <h1 className="mt-5 text-[27px] font-semibold tracking-[-0.035em] text-[#183128]">
              Login flow ready
            </h1>

            <p className="mx-auto mt-3 max-w-[390px] text-sm leading-6 text-[#748079]">
              The login form passed frontend validation successfully.
              Authentication is not connected yet, so no real user session
              has been created.
            </p>

            <div className="mt-6 rounded-xl border border-[#E2E7E3] bg-[#F7F9F6] p-4 text-left">
              <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8A938E]">
                Future login flow
              </div>

              <div className="mt-3 space-y-2">
                <SuccessStep>
                  Validate email and password
                </SuccessStep>

                <SuccessStep>
                  Check user credentials
                </SuccessStep>

                <SuccessStep>
                  Create authenticated session
                </SuccessStep>

                <SuccessStep>
                  Load user preferences
                </SuccessStep>

                <SuccessStep>
                  Redirect to default landing page
                </SuccessStep>
              </div>
            </div>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setLoginReady(false)
                }
                className="flex h-11 flex-1 items-center justify-center rounded-lg border border-[#DDE2DD] bg-white text-sm font-medium text-[#59645F] transition hover:bg-[#F7F8F5]"
              >
                Back
              </button>

              <Link
                href="/dashboard"
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#0F4C3A] text-sm font-medium text-white transition hover:bg-[#0A382B]"
              >
                Open Dashboard

                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F7F3]">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <section className="relative hidden overflow-hidden bg-[#133E31] lg:flex lg:flex-col">
          {/* DECORATION */}

          <div className="pointer-events-none absolute -left-36 -top-40 h-[440px] w-[440px] rounded-full border-[70px] border-white/[0.04]" />

          <div className="pointer-events-none absolute -bottom-44 -right-32 h-[500px] w-[500px] rounded-full border-[76px] border-white/[0.04]" />

          {/* BRAND */}

          <div className="relative z-10 px-10 pt-9">
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0F4C3A]">
                <ShieldCheck size={18} />
              </div>

              <div>
                <div className="text-lg font-semibold tracking-[-0.03em] text-white">
                  EvidAI
                </div>

                <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#9DB8AC]">
                  Investigation Intelligence
                </div>
              </div>
            </Link>
          </div>

          {/* CONTENT */}

          <div className="relative z-10 my-auto max-w-[650px] px-12 pb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
              <Sparkles
                size={12}
                className="text-[#C6DDD2]"
              />

              <span className="text-[10px] font-semibold uppercase tracking-[0.11em] text-[#B7CEC3]">
                Welcome back
              </span>
            </div>

            <h1 className="mt-6 text-[45px] font-semibold leading-[1.08] tracking-[-0.045em] text-white">
              Continue your investigation
              with evidence at the center.
            </h1>

            <p className="mt-5 max-w-[520px] text-sm leading-7 text-[#B4C9BF]">
              Return to your cases, review extracted intelligence, verify
              findings and continue evidence-grounded analysis with EvidAI.
            </p>

            <div className="mt-9 space-y-4">
              <Benefit
                title="Continue active cases"
                description="Resume recent investigations from the dashboard."
              />

              <Benefit
                title="Review pending intelligence"
                description="Work through entities, claims, flags and findings awaiting review."
              />

              <Benefit
                title="Ask AI Investigator"
                description="Explore case evidence with source-backed answers."
              />
            </div>
          </div>

          <div className="relative z-10 px-12 pb-8 text-[10px] text-[#83A095]">
            EvidAI Investigation Intelligence Platform
          </div>
        </section>

        {/* =================================================
            FORM
        ================================================= */}

        <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-[500px]">
            {/* MOBILE BRAND */}

            <Link
              href="/"
              className="mb-9 flex items-center gap-3 lg:hidden"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F4C3A] text-white">
                <ShieldCheck size={16} />
              </div>

              <div className="text-lg font-semibold text-[#183128]">
                EvidAI
              </div>
            </Link>

            {/* HEADER */}

            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#789087]">
                Sign in
              </div>

              <h2 className="mt-2 text-[32px] font-semibold tracking-[-0.04em] text-[#18201D]">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#7A8580]">
                Sign in to continue working on your investigations.
              </p>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="mt-8"
            >
              <div className="space-y-5">
                {/* EMAIL */}

                <FormField
                  label="Email address"
                  error={errors.email}
                >
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8F9994]"
                    />

                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        updateField(
                          "email",
                          event.target.value,
                        )
                      }
                      placeholder="name@company.com"
                      autoComplete="email"
                      className={inputClass(
                        Boolean(errors.email),
                      )}
                    />
                  </div>
                </FormField>

                {/* PASSWORD */}

                <FormField
                  label="Password"
                  error={errors.password}
                >
                  <div className="relative">
                    <LockKeyhole
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8F9994]"
                    />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={form.password}
                      onChange={(event) =>
                        updateField(
                          "password",
                          event.target.value,
                        )
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className={`${inputClass(
                        Boolean(errors.password),
                      )} pr-11`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) => !current,
                        )
                      }
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#8A938E] transition hover:bg-[#F1F3F0] hover:text-[#4E5A54]"
                    >
                      {showPassword ? (
                        <EyeOff size={15} />
                      ) : (
                        <Eye size={15} />
                      )}
                    </button>
                  </div>
                </FormField>
              </div>

              {/* OPTIONS */}

              <div className="mt-4 flex items-center justify-between gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(
                        event.target.checked,
                      )
                    }
                    className="h-4 w-4 accent-[#0F4C3A]"
                  />

                  <span className="text-xs text-[#67736C]">
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  className="text-xs font-medium text-[#0F4C3A] hover:underline"
                  onClick={() => {
                    /*
                      Add forgot-password flow later
                      when authentication exists.
                    */
                  }}
                >
                  Forgot password?
                </button>
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0F4C3A] text-sm font-semibold text-white shadow-[0_6px_18px_rgba(15,76,58,0.12)] transition hover:bg-[#0A382B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Signing in..."
                  : "Sign in"}

                {!isSubmitting && (
                  <ArrowRight size={15} />
                )}
              </button>
            </form>

            {/* REGISTER */}

            <div className="mt-7 flex items-center justify-center gap-1.5 text-sm text-[#77827C]">
              Don&apos;t have an account?

              <Link
                href="/register"
                className="font-semibold text-[#0F4C3A] hover:underline"
              >
                Create account
              </Link>
            </div>

            {/* INFO */}

            <div className="mt-7 rounded-xl border border-[#E1E6E2] bg-[#FAFAF7] p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={15}
                  className="mt-0.5 shrink-0 text-[#0F4C3A]"
                />

                <div>
                  <div className="text-xs font-semibold text-[#45534C]">
                    Authentication coming next
                  </div>

                  <p className="mt-1 text-[11px] leading-5 text-[#87918C]">
                    This page currently provides the complete login UI and
                    frontend validation. Credential verification and user
                    sessions will be connected when the authentication backend
                    is implemented.
                  </p>
                </div>
              </div>
            </div>

            {/* BACK */}

            <div className="mt-8 border-t border-[#E6E8E4] pt-6 text-center">
              <Link
                href="/"
                className="text-xs font-medium text-[#7C8781] transition hover:text-[#0F4C3A]"
              >
                ← Back to EvidAI
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   FORM FIELD
========================================================= */

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-[#46534C]">
        {label}
      </label>

      {children}

      {error && (
        <div className="mt-1.5 text-[11px] font-medium text-[#B64D42]">
          {error}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   BENEFIT
========================================================= */

function Benefit({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#C8DDD3]">
        <Check size={12} />
      </div>

      <div>
        <div className="text-sm font-semibold text-white">
          {title}
        </div>

        <p className="mt-1 text-xs leading-5 text-[#A7BEB3]">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   SUCCESS STEP
========================================================= */

function SuccessStep({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-[#627169]">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E7F2EC] text-[#19704F]">
        <Check size={11} />
      </div>

      {children}
    </div>
  );
}

/* =========================================================
   INPUT CLASS
========================================================= */

function inputClass(
  error: boolean,
) {
  return `h-11 w-full rounded-lg border bg-white pl-10 pr-4 text-sm text-[#26312C] outline-none transition placeholder:text-[#A0A8A4] ${
    error
      ? "border-[#D8A29C] focus:border-[#C2685E]"
      : "border-[#DDE2DD] focus:border-[#8FA99B] focus:ring-2 focus:ring-[#E9F0EC]"
  }`;
}