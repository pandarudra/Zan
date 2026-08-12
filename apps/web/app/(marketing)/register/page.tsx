"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Loader2, ArrowRight, Eye, EyeOff, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";

type SignupRole = "CLIENT" | "PROVIDER";

export default function RegisterPage(): React.JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<SignupRole>("CLIENT");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (signInResult?.error) {
      setError("Account created, but sign in failed. Please sign in manually.");
      setLoading(false);
      return;
    }

    router.push(role === "PROVIDER" ? "/provider" : "/client");
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center relative px-[24px] pt-[80px]">
      <div className="w-full max-w-[440px] relative z-10">
        <div className="rounded-[16px] border border-hairline bg-surface-cool p-[40px] shadow-sm relative overflow-hidden">
          
          <div className="text-center mb-[40px]">
            <h1 className="text-[32px] font-[400] tracking-[-0.8px] text-ink mb-[8px]">
              Create Account
            </h1>
            <p className="text-[16px] text-graphite font-[400]">
              Join the decentralized compute network.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[24px] mb-[32px]">
            {error && (
              <div className="p-[12px] rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-400 text-[14px] text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-[12px]">
              {[
                {
                  value: "CLIENT" as const,
                  label: "Client",
                  Icon: User,
                },
                {
                  value: "PROVIDER" as const,
                  label: "Provider",
                  Icon: Cpu,
                },
              ].map(({ value, label, Icon }) => {
                const isSelected = role === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={`flex items-center justify-center gap-[8px] rounded-[12px] border py-[12px] text-[14px] font-[600] transition-all ${
                      isSelected
                        ? "border-ink bg-ink text-canvas"
                        : "border-hairline bg-canvas text-graphite hover:border-ink hover:text-ink"
                    }`}
                    aria-pressed={isSelected}
                  >
                    <Icon className="w-[16px] h-[16px]" />
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <User className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-graphite" />
              <input
                name="name"
                type="text"
                required
                placeholder="Full Name"
                className="w-full bg-canvas border border-hairline rounded-[12px] py-[16px] pl-[48px] pr-[16px] text-ink placeholder:text-stone focus:outline-none focus:border-ink transition-all text-[16px]"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-graphite" />
              <input
                name="email"
                type="email"
                required
                placeholder="name@example.com"
                className="w-full bg-canvas border border-hairline rounded-[12px] py-[16px] pl-[48px] pr-[16px] text-ink placeholder:text-stone focus:outline-none focus:border-ink transition-all text-[16px]"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-graphite" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Create a password"
                minLength={6}
                className="w-full bg-canvas border border-hairline rounded-[12px] py-[16px] pl-[48px] pr-[48px] text-ink placeholder:text-stone focus:outline-none focus:border-ink transition-all text-[16px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[16px] top-1/2 -translate-y-1/2 text-graphite hover:text-ink transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-[20px] h-[20px]" />
                ) : (
                  <Eye className="w-[20px] h-[20px]" />
                )}
              </button>
            </div>

            <Button
              disabled={loading}
              type="submit"
              variant="primary"
              className="w-full mt-[8px] rounded-[12px] py-[24px] text-[16px]"
            >
              {loading ? (
                <Loader2 className="w-[20px] h-[20px] animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="w-[16px] h-[16px] ml-[8px]" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-graphite text-[14px]">
            Already have an account?{" "}
            <Link href="/login" className="text-ink font-[600] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
