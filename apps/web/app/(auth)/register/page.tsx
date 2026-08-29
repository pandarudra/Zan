"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  ArrowRight,
  Cpu,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type SignupRole = "CLIENT" | "PROVIDER";

const signupRoles = [
  { value: "CLIENT" as const, label: "Client", Icon: User },
  { value: "PROVIDER" as const, label: "Provider", Icon: Cpu },
];

export default function RegisterPage(): React.JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<SignupRole>("CLIENT");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      const signInResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInResult?.error) {
        setError(
          "Account created, but sign in failed. Please sign in manually.",
        );
        return;
      }

      router.push(role === "PROVIDER" ? "/provider" : "/client");
    } catch {
      setError("Unable to create your account right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-labelledby="register-title" className="w-full">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
          Join the network
        </p>
        <h1
          id="register-title"
          className="mt-4 text-3xl font-normal tracking-[-0.03em] text-ink sm:text-4xl"
        >
          Create your account
        </h1>
        <p className="mt-3 text-base leading-7 text-graphite">
          Run workloads or earn with your available hardware.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        aria-describedby={error ? "register-error" : undefined}
        className="space-y-5"
      >
        {error && (
          <div
            id="register-error"
            role="alert"
            className="rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-sm text-error"
          >
            {error}
          </div>
        )}

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink">
            I want to join as
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {signupRoles.map(({ value, label, Icon }) => {
              const isSelected = role === value;

              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setRole(value)}
                  className={`flex h-12 items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition-colors ${
                    isSelected
                      ? "border-ink bg-ink text-canvas"
                      : "border-hairline bg-surface-cool text-graphite hover:border-ink hover:text-ink"
                  }`}
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-ink"
          >
            Full name
          </label>
          <div className="relative">
            <User
              aria-hidden="true"
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone"
            />
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Your name"
              className="h-14 w-full rounded-lg border border-hairline bg-surface-cool pl-12 pr-4 text-base text-ink outline-none transition-colors placeholder:text-stone focus:border-ink"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-ink"
          >
            Email address
          </label>
          <div className="relative">
            <Mail
              aria-hidden="true"
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone"
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-invalid={Boolean(error)}
              placeholder="name@example.com"
              className="h-14 w-full rounded-lg border border-hairline bg-surface-cool pl-12 pr-4 text-base text-ink outline-none transition-colors placeholder:text-stone focus:border-ink"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-ink"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              aria-hidden="true"
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone"
            />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={6}
              aria-invalid={Boolean(error)}
              placeholder="At least 6 characters"
              className="h-14 w-full rounded-lg border border-hairline bg-surface-cool pl-12 pr-12 text-base text-ink outline-none transition-colors placeholder:text-stone focus:border-ink"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-graphite transition-colors hover:text-ink"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="h-5 w-5" />
              ) : (
                <Eye aria-hidden="true" className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="mt-2 h-12 w-full rounded-lg text-base"
        >
          {loading ? (
            <>
              <Loader2
                aria-hidden="true"
                className="mr-2 h-5 w-5 animate-spin"
              />
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-graphite">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-ink hover:underline">
          Sign in
        </Link>
      </p>
    </section>
  );
}
