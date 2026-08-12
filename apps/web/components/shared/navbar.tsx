"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "./logo";
import { LogOut, User, LayoutDashboard, ChevronDown } from "lucide-react";
import { WalletConnectButton } from "./wallet-connect-button";
import { Button } from "@/components/ui/button";
import { DownloadAgentButton } from "./download-agent-button";
import { useUser } from "@/hooks/use-user";

const NAV_LINKS = [
  { name: "Problem", href: "#problem" },
  { name: "Solution", href: "#solution" },
  { name: "Process", href: "#process" },
  { name: "Scale", href: "#scale" },
  { name: "Security", href: "#security" },
];

export function Navbar(): ReactElement {
  const { data: session, status } = useSession();
  const { user: fetchedUser, loadUser } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      void loadUser();
    }
  }, [status, loadUser]);

  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";
  const userName = fetchedUser?.name || session?.user?.name || "Account";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-canvas border-b border-hairline">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Logo />

        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link, idx) => (
            <Link
              key={idx}
              href={link.href}
              className="text-sm font-semibold text-ink-soft hover:text-ink transition-colors py-2"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <DownloadAgentButton showIcon={false}>
              <span className="text-sm font-semibold text-ink-soft hover:text-ink transition-colors cursor-pointer mr-4">
                Earn with GPU
              </span>
            </DownloadAgentButton>
          </div>
          {isLoggedIn && <WalletConnectButton showBalance />}

          {!isLoading && (
            <>
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-hairline hover:bg-surface-cool transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-surface-cool flex items-center justify-center border border-hairline-soft">
                      <User className="w-4 h-4 text-ink" />
                    </div>
                    <span className="text-sm font-semibold text-ink hidden sm:block">
                      {userName.split(" ")[0] || "Account"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-ink-soft transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-56 rounded-lg border border-hairline bg-canvas p-2">
                      <Link
                        href="/client"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-ink-soft hover:text-ink hover:bg-surface-cool transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-ink-soft hover:text-ink hover:bg-surface-cool transition-colors mt-1"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <DownloadAgentButton showIcon={false}>
                  <Button variant="primary" size="sm">Launch App</Button>
                </DownloadAgentButton>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
