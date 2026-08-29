"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  ArrowLeftRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Server,
  User,
  Wallet,
  X,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { WalletConnectButton } from "@/components/shared/wallet-connect-button";
import { useUser } from "@/hooks/use-user";

const CLIENT_NAV = [
  { name: "Overview", href: "/client", icon: LayoutDashboard },
  { name: "Deploy Workload", href: "/client/submit", icon: Plus },
];

const PROVIDER_NAV = [
  { name: "Node Status", href: "/provider", icon: Server },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { user: fetchedUser, loadUser } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavigationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (status === "authenticated") {
      void loadUser();
    }
  }, [status, loadUser]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const menuButton = menuButtonRef.current;
    const closeMenu = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };

    mobileNavigationRef.current?.querySelector<HTMLElement>("a")?.focus();
    document.addEventListener("keydown", closeMenu);
    return () => {
      document.removeEventListener("keydown", closeMenu);
      menuButton?.focus();
    };
  }, [isMobileMenuOpen]);

  const isProvider =
    pathname.startsWith("/provider") || pathname.startsWith("/stake");
  const navLinks = isProvider ? PROVIDER_NAV : CLIENT_NAV;
  const workspaceLabel = isProvider ? "Provider workspace" : "Client workspace";
  const isActive = (href: string) =>
    pathname === href ||
    (href === "/client" && pathname.startsWith("/client/jobs/"));

  const userName =
    fetchedUser?.name || session?.user?.name || "Account";
  const userEmail = fetchedUser?.email || session?.user?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();

  function SidebarFooter({ onAction }: { onAction?: () => void }) {
    return (
      <div className="border-t border-hairline p-4 space-y-1">
        {/* User identity */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline bg-canvas text-xs font-semibold text-ink">
            {userInitial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink leading-tight">
              {userName}
            </p>
            {userEmail && (
              <p className="truncate text-xs text-stone leading-tight mt-0.5">
                {userEmail}
              </p>
            )}
          </div>
        </div>

        {/* Switch workspace */}
        <Link
          href={isProvider ? "/client" : "/provider"}
          onClick={onAction}
          className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
        >
          <ArrowLeftRight aria-hidden="true" className="h-4 w-4 shrink-0" />
          Switch to {isProvider ? "Client" : "Provider"}
        </Link>

        {/* Sign out */}
        <button
          type="button"
          onClick={() => {
            onAction?.();
            void signOut();
          }}
          className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
        >
          <LogOut aria-hidden="true" className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-canvas">
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-[100] rounded-md bg-primary px-4 py-2 text-sm font-semibold text-on-primary focus:not-sr-only"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-hairline bg-surface-cool md:flex xl:w-[280px]">
        <div className="flex h-20 items-center border-b border-hairline px-6">
          <Logo />
        </div>

        <nav
          aria-label={`${isProvider ? "Provider" : "Client"} navigation`}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6"
        >
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone">
            {workspaceLabel}
          </p>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-on-primary"
                    : "text-ink-soft hover:bg-canvas hover:text-ink"
                }`}
              >
                <Icon aria-hidden="true" className="h-5 w-5" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <SidebarFooter />
      </aside>

      {/* Mobile overlay drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            tabIndex={-1}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-canvas/80 backdrop-blur-sm"
          />
          <aside
            ref={mobileNavigationRef}
            id="dashboard-mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label={`${isProvider ? "Provider" : "Client"} navigation`}
            className="relative flex h-full w-[min(280px,85vw)] shrink-0 flex-col border-r border-hairline bg-canvas shadow-2xl"
          >
            <div className="flex h-20 items-center justify-between border-b border-hairline px-6">
              <Logo />
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex h-11 w-11 items-center justify-center text-ink-soft hover:text-ink"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6">
              <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone">
                {workspaceLabel}
              </p>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary text-on-primary"
                        : "text-ink-soft hover:bg-surface-cool hover:text-ink"
                    }`}
                  >
                    <Icon aria-hidden="true" className="h-5 w-5" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-hairline px-4 pb-4 pt-3">
              <WalletConnectButton className="w-full mb-3" showBalance={false} />
            </div>

            <SidebarFooter onAction={() => setIsMobileMenuOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div
        inert={isMobileMenuOpen ? true : undefined}
        className="flex h-full min-w-0 flex-1 flex-col overflow-hidden"
      >
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-hairline bg-canvas px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Mobile: hamburger + logo */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              ref={menuButtonRef}
              type="button"
              aria-controls="dashboard-mobile-navigation"
              aria-expanded={isMobileMenuOpen}
              aria-label="Open navigation"
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center text-ink-soft hover:text-ink"
            >
              <Menu aria-hidden="true" className="h-6 w-6" />
            </button>
            <Logo />
          </div>

          {/* Desktop: workspace label lives in sidebar — keep header clean */}
          <div className="hidden md:block" />

          {/* Right: wallet actions */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <Link
              href="/wallet"
              aria-label="Wallet verification"
              className="flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-hairline text-sm font-medium transition-colors hover:bg-surface-cool sm:w-auto sm:px-4"
            >
              <Wallet aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">Wallet</span>
            </Link>
            <WalletConnectButton className="hidden lg:flex" showBalance />
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
