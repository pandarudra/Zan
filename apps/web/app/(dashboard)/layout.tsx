"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Server, Plus, Wallet, Shield, Menu, X } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { WalletConnectButton } from "@/components/shared/wallet-connect-button";

const CLIENT_NAV = [
  { name: "Overview", href: "/client", icon: LayoutDashboard },
  { name: "Deploy Workload", href: "/client/submit", icon: Plus },
];

const PROVIDER_NAV = [
  { name: "Node Status", href: "/provider", icon: Server },
  { name: "Stake", href: "/stake", icon: Shield },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Determine if we're in the provider or client section
  const isProvider = pathname.startsWith("/provider") || pathname.startsWith("/stake");
  const navLinks = isProvider ? PROVIDER_NAV : CLIENT_NAV;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-canvas">
      {/* Sidebar */}
      <aside className="w-[280px] border-r border-hairline flex flex-col bg-surface-cool shrink-0 hidden md:flex">
        <div className="h-[80px] px-6 flex items-center border-b border-hairline">
          <Logo />
        </div>
        
        <div className="flex-1 py-6 px-4 flex flex-col gap-2 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-primary text-on-primary" 
                    : "text-ink-soft hover:bg-canvas hover:text-ink"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-hairline">
          <div className="flex flex-col gap-2">
            <Link 
              href={isProvider ? "/client" : "/provider"}
              className="px-4 py-2 text-xs font-medium text-ink-soft hover:text-ink transition-colors text-center border border-hairline rounded-lg"
            >
              Switch to {isProvider ? "Client" : "Provider"}
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-canvas/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="relative w-[280px] h-full flex flex-col bg-canvas border-r border-hairline shrink-0 shadow-2xl">
            <div className="h-[80px] px-6 flex items-center justify-between border-b border-hairline">
              <Logo />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-ink-soft hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 py-6 px-4 flex flex-col gap-2 overflow-y-auto">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? "bg-primary text-on-primary" 
                        : "text-ink-soft hover:bg-surface-cool hover:text-ink"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="p-4 border-t border-hairline">
              <div className="flex flex-col gap-2">
                <Link 
                  href={isProvider ? "/client" : "/provider"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-ink-soft hover:text-ink transition-colors text-center border border-hairline rounded-lg"
                >
                  Switch to {isProvider ? "Client" : "Provider"}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <header className="h-[80px] px-4 md:px-6 border-b border-hairline flex items-center justify-between bg-canvas shrink-0">
          <div className="flex items-center gap-4 md:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-ink-soft hover:text-ink">
              <Menu className="w-6 h-6" />
            </button>
            <Logo />
          </div>
          <div className="hidden md:block">
            {/* Breadcrumb or title could go here */}
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/wallet"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-hairline text-sm font-medium hover:bg-surface-cool transition-colors"
            >
              <Wallet className="w-4 h-4" /> Wallet
            </Link>
            <WalletConnectButton showBalance />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
