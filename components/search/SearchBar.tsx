"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function SearchBar({ variant = "light", initialLocation = "", initialCategory = "SALE" }: { variant?: "light" | "glass"; initialLocation?: string; initialCategory?: string }): JSX.Element {
  const router = useRouter();
  const [location, setLocation] = useState(initialLocation);
  const [category, setCategory] = useState(initialCategory);
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const light = variant === "light";

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (category) params.set("category", category);
    if (beds) params.set("beds", beds);
    if (baths) params.set("baths", baths);
    if (maxPrice) params.set("maxPrice", maxPrice);
    router.push(`/search?${params.toString()}`);
  }

  const controlClass = light
    ? "h-11 w-full border-0 bg-transparent px-0 text-sm text-[#243c35] outline-none focus:ring-0"
    : "h-11 w-full rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-white/40 [&>option]:text-[#243c35]";

  return <form onSubmit={submit} className={`grid gap-3 rounded-[22px] p-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_.8fr_.8fr_.8fr_auto] lg:items-end ${light ? "bg-white shadow-[0_20px_60px_rgba(28,43,35,.12)]" : "border border-white/15 bg-white/10 backdrop-blur-md"}`}>
    <label className={`rounded-xl px-3 ${light ? "border-r border-stone-100" : ""}`}>
      <span className={`block text-[9px] font-bold uppercase tracking-[.15em] ${light ? "text-stone-400" : "text-white/55"}`}>Location</span>
      <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Neighborhood or city" className={controlClass} />
    </label>
    <label className={`rounded-xl px-3 ${light ? "border-r border-stone-100" : ""}`}>
      <span className={`block text-[9px] font-bold uppercase tracking-[.15em] ${light ? "text-stone-400" : "text-white/55"}`}>I’m looking to</span>
      <select value={category} onChange={(event) => { setCategory(event.target.value); setMaxPrice(""); }} className={controlClass}><option value="SALE">Buy a home</option><option value="RENT">Rent a home</option></select>
    </label>
    <label className={`rounded-xl px-3 ${light ? "border-r border-stone-100" : ""}`}>
      <span className={`block text-[9px] font-bold uppercase tracking-[.15em] ${light ? "text-stone-400" : "text-white/55"}`}>Bedrooms</span>
      <select value={beds} onChange={(event) => setBeds(event.target.value)} className={controlClass}><option value="">Any bedrooms</option><option value="1">1+ bedrooms</option><option value="2">2+ bedrooms</option><option value="3">3+ bedrooms</option><option value="4">4+ bedrooms</option></select>
    </label>
    <label className={`rounded-xl px-3 ${light ? "border-r border-stone-100" : ""}`}>
      <span className={`block text-[9px] font-bold uppercase tracking-[.15em] ${light ? "text-stone-400" : "text-white/55"}`}>Bathrooms</span>
      <select value={baths} onChange={(event) => setBaths(event.target.value)} className={controlClass}><option value="">Any bathrooms</option><option value="1">1+ bathroom</option><option value="2">2+ bathrooms</option><option value="3">3+ bathrooms</option></select>
    </label>
    <label className="rounded-xl px-3">
      <span className={`block text-[9px] font-bold uppercase tracking-[.15em] ${light ? "text-stone-400" : "text-white/55"}`}>Max. budget</span>
      <select value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} className={controlClass}><option value="">No max</option>{category === "RENT" ? <><option value="5000">$5k / mo</option><option value="10000">$10k / mo</option></> : <><option value="750000">$750k</option><option value="1500000">$1.5m</option><option value="2500000">$2.5m</option></>}</select>
    </label>
    <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#243c35] px-6 text-sm font-semibold text-white transition hover:bg-[#35564c] sm:col-span-2 lg:col-span-1"><Search className="size-4" /><span className="lg:hidden">Search homes</span><span className="hidden lg:inline">Search</span></button>
  </form>;
}
