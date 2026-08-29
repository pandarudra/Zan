"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "./logo";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { WalletConnectButton } from "./wallet-connect-button";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      void loadUser();
    }
  }, [status, loadUser]);

  useEffect(() => {
    const closeMenus = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", closeMenus);
    return () => document.removeEventListener("keydown", closeMenus);
  }, []);

  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";
  const userName = fetchedUser?.name || session?.user?.name || "Account";

  return (
    <header className="relative z-50 border-b border-hairline bg-canvas">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-8 lg:flex"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-2 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden xl:block">
            <DownloadAgentButton showIcon={false}>
              <span className="cursor-pointer text-sm font-semibold text-ink-soft transition-colors hover:text-ink">
                Earn with GPU
              </span>
            </DownloadAgentButton>
          </div>
          {isLoggedIn && (
            <WalletConnectButton className="hidden xl:flex" showBalance />
          )}

          {!isLoading && (
            <>
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    type="button"
                    aria-controls="account-menu"
                    aria-expanded={isProfileOpen}
                    aria-label="Toggle account menu"
                    onClick={() => {
                      setIsProfileOpen((open) => !open);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex min-h-11 items-center gap-2 rounded-full border border-hairline py-1 pl-1 pr-2 transition-colors hover:bg-surface-cool"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline-soft bg-surface-cool">
                      <User aria-hidden="true" className="h-4 w-4 text-ink" />
                    </div>

                    <ChevronDown
                      aria-hidden="true"
                      className={`h-4 w-4 text-ink-soft transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isProfileOpen && (
                    <div
                      id="account-menu"
                      aria-label="Account menu"
                      className="absolute right-0 mt-3 w-56 rounded-lg border border-hairline bg-canvas p-2 shadow-md"
                    >
                      <div className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-ink-soft">
                        <User aria-hidden="true" className="h-4 w-4" />
                        {userName.split(" ")[0] || "Account"}
                      </div>
                      <Link
                        href="/client"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-ink-soft transition-colors hover:bg-surface-cool hover:text-ink"
                      >
                        <LayoutDashboard
                          aria-hidden="true"
                          className="h-4 w-4"
                        />
                        Dashboard
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          void signOut();
                        }}
                        className="mt-1 flex min-h-11 w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-ink-soft transition-colors hover:bg-surface-cool hover:text-ink"
                      >
                        <LogOut aria-hidden="true" className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/client"
                  className="flex min-h-11 items-center gap-2 px-2 text-sm font-semibold text-ink-soft transition-colors hover:text-ink sm:px-3"
                >
                  <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              )}
            </>
          )}

          <button
            type="button"
            aria-controls="mobile-navigation"
            aria-expanded={isMobileMenuOpen}
            aria-label={
              isMobileMenuOpen ? "Close navigation" : "Open navigation"
            }
            onClick={() => {
              setIsMobileMenuOpen((open) => !open);
              setIsProfileOpen(false);
            }}
            className="flex h-11 w-11 items-center justify-center text-ink-soft transition-colors hover:text-ink lg:hidden"
          >
            {isMobileMenuOpen ? (
              <X aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Menu aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="absolute inset-x-0 top-full border-b border-hairline bg-canvas p-4 shadow-md lg:hidden"
        >
          <div className="container mx-auto flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex min-h-11 items-center px-3 text-sm font-semibold text-ink-soft transition-colors hover:bg-surface-cool hover:text-ink"
              >
                {link.name}
              </Link>
            ))}
            <DownloadAgentButton
              className="min-h-11 px-3 text-sm font-semibold text-ink-soft transition-colors hover:bg-surface-cool hover:text-ink"
              showIcon={false}
            >
              Earn with GPU
            </DownloadAgentButton>
          </div>
        </nav>
      )}
    </header>
  );
}
