import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "EVMods — Visual EV Configurator & Marketplace",
  description: "Visually configure your Tesla with real aftermarket mods. See every change in 3D, buy instantly.",
  keywords: ["Tesla mods", "EV modifications", "car configurator", "aftermarket parts", "Tesla accessories"],
  openGraph: {
    title: "EVMods — Visual EV Configurator & Marketplace",
    description: "Configure your Tesla in 3D. Every visual change is directly purchasable.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorBackground: "#0a0a0a",
          colorInputBackground: "#111111",
          colorText: "#ffffff",
        },
      }}
    >
      <html lang="en" className="dark">
        <body className="min-h-screen bg-[#0a0a0a] text-white antialiased">
          <Navbar />
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
