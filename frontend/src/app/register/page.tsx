"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import {getInputClassName} from "@/lib/styles";

import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type RegisterForm = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<
  Record<keyof RegisterForm, string>
>;

/* =========================================================
   PAGE
========================================================= */

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [created, setCreated] =
    useState(false);

  /* =========================================================
     UPDATE FIELD
  ========================================================= */

  function updateField(
    field: keyof RegisterForm,
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

    if (!form.fullName.trim()) {
      nextErrors.fullName =
        "Full name is required.";
    }

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
    } else if (form.password.length < 8) {
      nextErrors.password =
        "Password must contain at least 8 characters.";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword =
        "Please confirm your password.";
    } else if (
      form.confirmPassword !== form.password
    ) {
      nextErrors.confirmPassword =
        "Passwords do not match.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  }

  /* =========================================================
     REGISTER
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

      DO NOT STORE THE RAW PASSWORD IN THE DATABASE.

      Later backend:

      POST /users/register

      {
        name: form.fullName,
        email: form.email,
        password: form.password
      }

      The backend should:

      1. validate email
      2. check that email is unique
      3. hash password
      4. INSERT INTO users
      5. INSERT default user_preferences
      6. INSERT default notification_preferences


      Example backend database flow:

      BEGIN;

      INSERT INTO users (
        name,
        email,
        password_hash
      )
      VALUES (...)
      RETURNING id;


      INSERT INTO user_preferences (
        user_id
      )
      VALUES (
        new_user_id
      );


      INSERT INTO notification_preferences (
        user_id
      )
      VALUES (
        new_user_id
      );

      COMMIT;


      Authentication/session creation is NOT
      being implemented yet.
    */

    setTimeout(() => {
      setIsSubmitting(false);
      setCreated(true);
    }, 900);
  }

  /* =========================================================
     SUCCESS STATE
  ========================================================= */

  if (created) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F7F3] px-6">
        <div className="w-full max-w-[520px]">
          <div className="rounded-[24px] border border-[#DDE5DF] bg-white p-8 text-center shadow-[0_24px_70px_rgba(25,45,36,0.08)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7F2EC] text-[#19704F]">
              <Check size={24} />
            </div>

            <h1 className="mt-5 text-[27px] font-semibold tracking-[-0.035em] text-[#183128]">
              Registration ready
            </h1>

            <p className="mx-auto mt-3 max-w-[390px] text-sm leading-6 text-[#748079]">
              The registration form passed
              validation successfully. Because
              authentication and the registration
              API are not connected yet, no user
              has been written to the database.
            </p>

            <div className="mt-6 rounded-xl border border-[#E2E7E3] bg-[#F7F9F6] p-4 text-left">
              <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8A938E]">
                Future database flow
              </div>

              <div className="mt-3 space-y-2">
                <SuccessStep>
                  Create users record
                </SuccessStep>

                <SuccessStep>
                  Create user_preferences
                </SuccessStep>

                <SuccessStep>
                  Create notification_preferences
                </SuccessStep>
              </div>
            </div>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setCreated(false)
                }
                className="flex h-11 flex-1 items-center justify-center rounded-lg border border-[#DDE2DD] bg-white text-sm font-medium text-[#59645F] transition hover:bg-[#F7F8F5]"
              >
                Back
              </button>

              <Link
                href="/login"
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#0F4C3A] text-sm font-medium text-white transition hover:bg-[#0A382B]"
              >
                Go to login

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
                Evidence-grounded investigations
              </span>
            </div>

            <h1 className="mt-6 text-[45px] font-semibold leading-[1.08] tracking-[-0.045em] text-white">
              Build investigations
              around evidence,
              not assumptions.
            </h1>

            <p className="mt-5 max-w-[520px] text-sm leading-7 text-[#B4C9BF]">
              EvidAI combines evidence
              management, structured
              intelligence, investigator
              review and reporting in one
              traceable investigation
              workspace.
            </p>

            <div className="mt-9 space-y-4">
              <Benefit
                title="Evidence traceability"
                description="Keep intelligence connected to its original documents and pages."
              />

              <Benefit
                title="Human-reviewed intelligence"
                description="Separate AI extraction from investigator-approved conclusions."
              />

              <Benefit
                title="AI Investigator"
                description="Ask case-scoped questions with evidence-backed answers."
              />
            </div>
          </div>

          {/* FOOTER */}

          <div className="relative z-10 px-12 pb-8 text-[10px] text-[#83A095]">
            EvidAI Investigation Intelligence
            Platform
          </div>
        </section>

        {/* =================================================
            FORM SIDE
        ================================================= */}

        <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-[520px]">
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
                Create account
              </div>

              <h2 className="mt-2 text-[32px] font-semibold tracking-[-0.04em] text-[#18201D]">
                Get started with EvidAI
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#7A8580]">
                Create your account to access
                the investigation workspace.
              </p>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="mt-8"
            >
              <div className="space-y-5">
                {/* FULL NAME */}

                <FormField
                  label="Full name"
                  error={
                    errors.fullName
                  }
                >
                  <div className="relative">
                    <User
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8F9994]"
                    />

                    <input
                      value={
                        form.fullName
                      }
                      onChange={(event) =>
                        updateField(
                          "fullName",
                          event.target
                            .value,
                        )
                      }
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className={getInputClassName(
                        Boolean(
                          errors.fullName,
                        ),
                      )}
                    />
                  </div>
                </FormField>

                {/* EMAIL */}

                <FormField
                  label="Email address"
                  error={
                    errors.email
                  }
                >
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8F9994]"
                    />

                    <input
                      type="email"
                      value={
                        form.email
                      }
                      onChange={(event) =>
                        updateField(
                          "email",
                          event.target
                            .value,
                        )
                      }
                      placeholder="name@company.com"
                      autoComplete="email"
                      className={getInputClassName(
                        Boolean(
                          errors.email,
                        ),
                      )}
                    />
                  </div>
                </FormField>

                {/* PASSWORD */}

                <FormField
                  label="Password"
                  error={
                    errors.password
                  }
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
                      value={
                        form.password
                      }
                      onChange={(event) =>
                        updateField(
                          "password",
                          event.target
                            .value,
                        )
                      }
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      className={`${getInputClassName(
                        Boolean(
                          errors.password,
                        ),
                      )} pr-11`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) =>
                            !current,
                        )
                      }
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#8A938E] transition hover:bg-[#F1F3F0] hover:text-[#4E5A54]"
                    >
                      {showPassword ? (
                        <EyeOff
                          size={15}
                        />
                      ) : (
                        <Eye
                          size={15}
                        />
                      )}
                    </button>
                  </div>
                </FormField>

                {/* CONFIRM PASSWORD */}

                <FormField
                  label="Confirm password"
                  error={
                    errors.confirmPassword
                  }
                >
                  <div className="relative">
                    <LockKeyhole
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8F9994]"
                    />

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        form.confirmPassword
                      }
                      onChange={(event) =>
                        updateField(
                          "confirmPassword",
                          event.target
                            .value,
                        )
                      }
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      className={`${getInputClassName(
                        Boolean(
                          errors.confirmPassword,
                        ),
                      )} pr-11`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) =>
                            !current,
                        )
                      }
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#8A938E] transition hover:bg-[#F1F3F0] hover:text-[#4E5A54]"
                    >
                      {showConfirmPassword ? (
                        <EyeOff
                          size={15}
                        />
                      ) : (
                        <Eye
                          size={15}
                        />
                      )}
                    </button>
                  </div>
                </FormField>
              </div>

              {/* PASSWORD INFO */}

              <div className="mt-5 rounded-xl border border-[#E1E6E2] bg-[#FAFAF7] p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8A938E]">
                  Password requirements
                </div>

                <div className="mt-3 space-y-2">
                  <PasswordRule
                    valid={
                      form.password.length >=
                      8
                    }
                  >
                    At least 8 characters
                  </PasswordRule>

                  <PasswordRule
                    valid={
                      form.password.length >
                        0 &&
                      form.password ===
                        form.confirmPassword
                    }
                  >
                    Passwords match
                  </PasswordRule>
                </div>
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={
                  isSubmitting
                }
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0F4C3A] text-sm font-semibold text-white shadow-[0_6px_18px_rgba(15,76,58,0.12)] transition hover:bg-[#0A382B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Creating account..."
                  : "Create account"}

                {!isSubmitting && (
                  <ArrowRight
                    size={15}
                  />
                )}
              </button>
            </form>

            {/* LOGIN */}

            <div className="mt-7 flex items-center justify-center gap-1.5 text-sm text-[#77827C]">
              Already have an account?

              <Link
                href="/login"
                className="font-semibold text-[#0F4C3A] hover:underline"
              >
                Log in
              </Link>
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
   PASSWORD RULE
========================================================= */

function PasswordRule({
  valid,
  children,
}: {
  valid: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-4 w-4 items-center justify-center rounded-full ${
          valid
            ? "bg-[#E1EEE6] text-[#19704F]"
            : "bg-[#ECEFEB] text-[#98A19C]"
        }`}
      >
        <Check size={10} />
      </div>

      <span
        className={`text-[11px] ${
          valid
            ? "text-[#537064]"
            : "text-[#8D9691]"
        }`}
      >
        {children}
      </span>
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

