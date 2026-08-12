import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "TFIT Admin",
  description: "Painel interno de moderação — TFIT",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
