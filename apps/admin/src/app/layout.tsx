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
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#1ef2a6",
          colorBackground: "#0d1119",
          colorInput: "#020306",
          colorForeground: "#f4f6f9",
          colorMutedForeground: "#94a0b2",
          colorBorder: "rgba(255, 255, 255, 0.16)",
          borderRadius: "10px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        },
      }}
    >
      <html lang="pt-BR">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
