"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Zap, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/builds", label: "Builds" },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-xl">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
          <Zap size={14} className="text-black" fill="black" />
        </div>
        <span className="font-bold text-white tracking-tight">EVMods</span>
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              pathname === link.href
                ? "text-white bg-white/10"
                : "text-white/50 hover:text-white hover:bg-white/5"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Auth */}
      <div className="hidden md:flex items-center gap-3">
        <SignedOut>
          <Link
            href="/sign-in"
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="text-sm px-4 py-2 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-colors"
          >
            Get Started
          </Link>
        </SignedOut>
        <SignedIn>
          <Link
            href="/builds"
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            My Builds
          </Link>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
        </SignedIn>
      </div>

      {/* Mobile menu toggle */}
      <button
        className="md:hidden text-white/60 hover:text-white"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-[#0a0a0a] border-b border-white/5 p-4 flex flex-col gap-2 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-white bg-white/10"
                  : "text-white/50"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/5 flex gap-2">
            <SignedOut>
              <Link href="/sign-in" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-sm py-2.5 border border-white/10 rounded-xl text-white/60">
                Sign In
              </Link>
              <Link href="/sign-up" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-sm py-2.5 bg-white text-black font-medium rounded-xl">
                Get Started
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      )}
    </nav>
  );
}
