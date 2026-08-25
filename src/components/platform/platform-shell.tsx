"use client";

import Link from "next/link";
import { ChevronDown, DatabaseZap, Feather, Orbit, Waypoints } from "lucide-react";
import { useEffect, useRef } from "react";

type PlatformShellProps = { children: React.ReactNode };

const products = [
  { name: "Taskflow", role: "Orchestration", icon: Waypoints, current: true },
  { name: "Data Ghost", role: "Decision intelligence", icon: DatabaseZap },
  { name: "Echo Notes", role: "Knowledge and memory", icon: Feather },
];

export function PlatformShell({ children }: PlatformShellProps) {
  const productMenuRef = useRef<HTMLDetailsElement>(null);

  const closeProductMenu = () => productMenuRef.current?.removeAttribute("open");

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!productMenuRef.current?.contains(event.target as Node)) closeProductMenu();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeProductMenu();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/90 bg-[hsl(var(--ghost-surface)/0.92)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-sm font-semibold tracking-tight"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ghost-ink text-white">
                <Orbit aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </span>
              <span className="hidden sm:inline">Ghost Platform</span>
            </Link>
            <span aria-hidden="true" className="h-5 w-px bg-border" />
            <details ref={productMenuRef} className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Waypoints aria-hidden="true" className="h-4 w-4 text-primary" />
                Taskflow
                <ChevronDown
                  aria-hidden="true"
                  className="h-4 w-4 text-muted-foreground transition group-open:rotate-180"
                />
              </summary>
              <div className="absolute left-0 top-11 w-64 rounded-xl border bg-popover p-2 shadow-lg">
                {products.map((product) => (
                  <button
                    type="button"
                    key={product.name}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-muted ${product.current ? "bg-accent" : ""}`}
                    onClick={closeProductMenu}
                  >
                    <product.icon aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{product.name}</span>
                      <span className="block text-xs text-muted-foreground">{product.role}</span>
                    </span>
                    {product.current ? <span className="text-xs text-primary">Current</span> : null}
                  </button>
                ))}
              </div>
            </details>
          </div>
          <nav className="flex h-9 items-center gap-1 rounded-lg bg-secondary p-1 text-sm">
            <Link href="/" className="rounded-md px-3 py-1.5 font-medium hover:bg-card">
              Runs
            </Link>
            <Link
              href="/workflows"
              className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-card hover:text-foreground"
            >
              Workflows
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</main>
    </div>
  );
}
