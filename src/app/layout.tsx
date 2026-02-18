import type { Metadata } from "next";
import Link from "next/link";

import "@xyflow/react/dist/style.css";

import { Providers } from "@/app/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Taskflow Control Plane",
  description: "Mission control for orchestrating and observing agentic workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen bg-grid">
            <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
              <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="text-sm font-semibold tracking-tight">
                  Taskflow Mission Control
                </Link>
                <nav className="flex items-center gap-5 text-sm text-muted-foreground">
                  <Link href="/" className="hover:text-foreground">
                    Dashboard
                  </Link>
                  <Link href="/workflows" className="hover:text-foreground">
                    Workflows
                  </Link>
                </nav>
              </div>
            </header>
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
