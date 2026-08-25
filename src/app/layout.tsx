import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import "@xyflow/react/dist/style.css";

import { Providers } from "@/app/providers";
import { PlatformShell } from "@/components/platform/platform-shell";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

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
    <html lang="en" data-product="taskflow">
      <body className={`${manrope.variable} font-sans antialiased`}>
        <Providers>
          <PlatformShell>{children}</PlatformShell>
        </Providers>
      </body>
    </html>
  );
}
