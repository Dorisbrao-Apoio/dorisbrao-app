"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Heart, MapPin } from "lucide-react";

import { readSavedPropertyIds, toggleSavedProperty } from "@/lib/data/browser-store";
import type { Property } from "@/lib/data/types";

export function formatPrice(price: number, category: Property["category"]): string {
  const value = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);
  return category === "RENT" ? `${value} / mo` : value;
}

export function PropertyCard({ property, compact = false }: { property: Property; compact?: boolean }): JSX.Element {
  const [saved, setSaved] = useState(false);
  useEffect(() => setSaved(readSavedPropertyIds().includes(property.id)), [property.id]);
  const image = property.images[0] ?? "";

  return <article className={`group overflow-hidden rounded-[22px] bg-white ${compact ? "min-w-[290px] max-w-[340px] flex-1" : ""}`}>
    <div className="relative overflow-hidden">
      <Link href={`/listings/${property.slug}`} className="block aspect-[1.36/1] overflow-hidden" aria-label={`View ${property.title}`}>
        <img src={image} alt={property.title} className="size-full object-cover transition duration-700 group-hover:scale-[1.04]" loading="lazy" />
      </Link>
      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-[#243c35]">{property.category === "SALE" ? "For sale" : "For rent"}</span>
      <button aria-label={saved ? `Remove ${property.title} from saved homes` : `Save ${property.title}`} aria-pressed={saved} onClick={() => setSaved(toggleSavedProperty(property.id).includes(property.id))} className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/95 text-[#243c35] transition hover:scale-105">
        <Heart className={`size-4 ${saved ? "fill-[#c7755b] text-[#c7755b]" : ""}`} />
      </button>
    </div>
    <div className="p-5">
      <div className="flex items-start justify-between gap-4"><Link href={`/listings/${property.slug}`} className="font-serif text-[19px] leading-snug text-[#243c35] hover:underline">{property.title}</Link><ArrowUpRight className="mt-1 size-4 shrink-0 text-stone-400" /></div>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-stone-500"><MapPin className="size-3.5" />{property.location}</p>
      <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4">
        <p className="font-semibold tracking-tight text-[#243c35]">{formatPrice(property.price, property.category)}</p>
        <p className="text-[11px] text-stone-500">{property.beds} bd <span className="px-1 text-stone-300">·</span> {property.baths} ba <span className="px-1 text-stone-300">·</span> {property.sqft.toLocaleString()} sqft</p>
      </div>
    </div>
  </article>;
}
