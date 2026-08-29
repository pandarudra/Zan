"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

function safeCallbackUrl(value: string | null): string | null {
  if (!value?.startsWith("/") || value.startsWith("//")) return null;

  try {
    decodeURI(value);
    const url = new URL(value, window.location.origin);
    const pathname = decodeURIComponent(url.pathname);
    if (
      url.origin !== window.location.origin ||
      pathname === "/login" ||
      pathname.startsWith("/login/") ||
      pathname === "/register" ||
      pathname.startsWith("/register/")
    ) {
      return null;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      const currentSession = await getSession();
      const fallback =
        currentSession?.user.role === "PROVIDER" ? "/provider" : "/client";
      const callbackUrl = safeCallbackUrl(
        new URLSearchParams(window.location.search).get("callbackUrl"),
      );
      router.push(callbackUrl ?? fallback);
    } catch {
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-labelledby="login-title" className="w-full">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
          Welcome back
        </p>
        <h1
          id="login-title"
          className="mt-4 text-3xl font-normal tracking-[-0.03em] text-ink sm:text-4xl"
        >
          Sign in to Zan
        </h1>
        <p className="mt-3 text-base leading-7 text-graphite">
          Access your workloads, wallet, and provider tools.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        aria-describedby={error ? "login-error" : undefined}
        className="space-y-5"
      >
        {error && (
          <div
            id="login-error"
            role="alert"
            className="rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-sm text-error"
          >
            {error}
          </div>
        )}

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
              autoComplete="current-password"
              required
              aria-invalid={Boolean(error)}
              placeholder="Enter your password"
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
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-graphite">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-ink hover:underline"
        >
          Create one
        </Link>
      </p>
    </section>
  );
}
