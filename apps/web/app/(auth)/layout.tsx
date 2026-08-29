import Image from "next/image";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh w-full bg-canvas lg:grid-cols-2">
      <aside className="relative hidden min-h-dvh overflow-hidden border-r border-hairline lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-12">
        <Image
          src="/images/hero.png"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-canvas/55" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/20 to-canvas/50"
        />

        <div className="relative z-10">
          <Logo />
        </div>

        <div className="relative z-10 max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">
            Decentralized GPU compute
          </p>
          <p className="mt-5 text-4xl font-normal leading-tight tracking-[-0.04em] text-ink xl:text-5xl">
            Compute without the cloud bottleneck.
          </p>
          <p className="mt-5 max-w-md text-base leading-7 text-ink-soft">
            Deploy workloads or put idle hardware to work through one secure,
            global network.
          </p>
        </div>
      </aside>

      <main
        id="main-content"
        className="flex min-h-dvh w-full items-center justify-center overflow-y-auto px-4 py-8 sm:px-8 lg:px-12"
      >
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
