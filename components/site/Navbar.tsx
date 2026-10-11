"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

import { readSession, writeSession } from "@/lib/data/browser-store";
import type { DemoSession } from "@/lib/data/types";

export function Navbar(): JSX.Element {
  const [session, setSession] = useState<DemoSession | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setSession(readSession()), []);

  function signOut() {
    writeSession(null);
    setSession(null);
    setMobileOpen(false);
  }

  return <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#faf9f6]/95 backdrop-blur-xl">
    <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
      <Link href="/" className="flex items-center gap-3" aria-label="Dorisbrao Real Estate home">
        <span className="grid size-10 place-items-center rounded-full bg-[#243c35] text-sm font-semibold tracking-wide text-white">D.</span>
        <span className="font-serif text-[21px] tracking-tight text-[#243c35]">Dorisbrao <span className="font-sans text-[10px] font-semibold uppercase tracking-[.24em] text-stone-500">real estate</span></span>
      </Link>
      <nav className="hidden items-center gap-9 md:flex" aria-label="Main navigation">
        <Link href="/search" className="text-[13px] font-medium text-stone-600 transition hover:text-[#243c35]">Buy</Link>
        <Link href="/search?category=RENT" className="text-[13px] font-medium text-stone-600 transition hover:text-[#243c35]">Rent</Link>
        <a href="/#neighborhoods" className="text-[13px] font-medium text-stone-600 transition hover:text-[#243c35]">Neighborhoods</a>
        <Link href="/dashboard" className="text-[13px] font-medium text-stone-600 transition hover:text-[#243c35]">For agents</Link>
      </nav>
      <div className="hidden items-center gap-3 md:flex">
        {session ? <>
          <span className="mr-1 max-w-32 truncate text-xs text-stone-500">Hi, {session.name.split(" ")[0]}</span>
          <Link href={session.role === "BUYER" ? "/search?saved=1" : "/dashboard"} className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold text-[#243c35] transition hover:border-[#243c35]">
            {session.role === "BUYER" ? "Saved homes" : "Workspace"}
          </Link>
          <button onClick={signOut} className="p-2 text-xs text-stone-500 hover:text-[#243c35]">Sign out</button>
        </> : <>
          <Link href="/login" className="px-3 py-2 text-xs font-semibold text-[#243c35]">Log in</Link>
          <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-[#243c35] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#35564c]">Get started <ArrowUpRight className="size-3.5" /></Link>
        </>}
      </div>
      <button className="grid size-10 place-items-center rounded-full border border-stone-200 text-[#243c35] md:hidden" aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>
        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
    </div>
    {mobileOpen && <nav className="grid gap-1 border-t border-stone-200 bg-[#faf9f6] px-5 py-4 md:hidden" aria-label="Mobile navigation">
      <Link onClick={() => setMobileOpen(false)} href="/search" className="rounded-xl px-3 py-3 text-sm text-stone-700 hover:bg-stone-100">Buy a home</Link>
      <Link onClick={() => setMobileOpen(false)} href="/search?category=RENT" className="rounded-xl px-3 py-3 text-sm text-stone-700 hover:bg-stone-100">Find a rental</Link>
      <a onClick={() => setMobileOpen(false)} href="/#neighborhoods" className="rounded-xl px-3 py-3 text-sm text-stone-700 hover:bg-stone-100">Neighborhoods</a>
      <Link onClick={() => setMobileOpen(false)} href="/dashboard" className="rounded-xl px-3 py-3 text-sm text-stone-700 hover:bg-stone-100">Agent workspace</Link>
      {session ? <button onClick={signOut} className="px-3 py-3 text-left text-sm text-stone-500">Sign out</button> : <Link onClick={() => setMobileOpen(false)} href="/login" className="rounded-xl px-3 py-3 text-sm font-medium text-[#243c35]">Log in / Create an account</Link>}
    </nav>}
  </header>;
}
