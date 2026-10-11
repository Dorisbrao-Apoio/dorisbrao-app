"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Bath, BedDouble, Check, ChevronLeft, ChevronRight, Heart, MapPin, Maximize2, Ruler, X } from "lucide-react";

import { LeadCaptureModal } from "@/components/property/LeadCaptureModal";
import { MortgageCalculator } from "@/components/property/MortgageCalculator";
import { formatPrice } from "@/components/property/PropertyCard";
import { readSavedPropertyIds, toggleSavedProperty } from "@/lib/data/browser-store";
import { getAgent } from "@/lib/data/properties";
import type { Property } from "@/lib/data/types";

export function PropertyDetail({ property }: { property: Property }): JSX.Element {
  const [imageIndex, setImageIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [saved, setSaved] = useState(false);
  const [leadType, setLeadType] = useState<"TOUR" | "MESSAGE" | null>(null);
  const agent = getAgent(property.agentId);
  const images = property.images.length ? property.images : [""];

  useEffect(() => setSaved(readSavedPropertyIds().includes(property.id)), [property.id]);
  useEffect(() => {
    if (!lightbox) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(false);
      if (event.key === "ArrowRight") setImageIndex((index) => (index + 1) % images.length);
      if (event.key === "ArrowLeft") setImageIndex((index) => (index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightbox, images.length]);

  const specs = [
    { icon: BedDouble, value: `${property.beds}`, label: "Bedrooms" },
    { icon: Bath, value: `${property.baths}`, label: "Bathrooms" },
    { icon: Ruler, value: property.sqft.toLocaleString(), label: "Square feet" },
    { icon: Check, value: `${property.yearBuilt}`, label: "Year built" },
  ];

  function moveImage(direction: number) {
    setImageIndex((index) => (index + direction + images.length) % images.length);
  }

  return <main className="min-h-screen bg-[#faf9f6]">
    <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-6 sm:px-8 sm:pt-8 lg:px-12">
      <Link href="/search" className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-[#243c35]"><ArrowLeft className="size-4" />Back to homes</Link>
      <div className="relative grid h-[300px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-[22px] sm:h-[440px] sm:gap-3 lg:h-[540px]">
        <button onClick={() => { setImageIndex(0); setLightbox(true); }} className="group relative col-span-4 row-span-2 overflow-hidden sm:col-span-2" aria-label="Open photo gallery"><img src={images[0]} alt={`${property.title}, exterior and main living area`} className="size-full object-cover transition duration-500 group-hover:scale-[1.02]" /><span className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 text-[10px] font-semibold text-[#243c35]"><Maximize2 className="size-3.5" />View all {images.length} photos</span></button>
        {images.slice(1, 5).map((image, index) => <button key={`${image}-${index}`} onClick={() => { setImageIndex(index + 1); setLightbox(true); }} className={`group relative hidden overflow-hidden sm:block ${index === 0 ? "" : ""}`}><img src={image} alt={`${property.title}, photo ${index + 2}`} className="size-full object-cover transition duration-500 group-hover:scale-105" /></button>)}
        {images.length === 1 && <div className="col-span-2 row-span-2 hidden gap-3 sm:grid"><div className="rounded-r-[22px] bg-[#e5e3dc]" /><div className="rounded-r-[22px] bg-[#eeece6]" /></div>}
      </div>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_365px]">
        <div>
          <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#e4e9e4] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.13em] text-[#3e6452]">{property.category === "SALE" ? "For sale" : "For rent"}</span><span className="text-[11px] text-stone-400">Listed with Dorisbrao</span></div>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight tracking-tight text-[#243c35] sm:text-5xl">{property.title}</h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-stone-500"><MapPin className="size-4" />{property.location}</p>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">{specs.map(({ icon: Icon, value, label }) => <div key={label} className="rounded-2xl border border-stone-200 bg-white p-4"><Icon className="size-4 text-[#8c9f92]" /><p className="mt-3 font-serif text-2xl text-[#243c35]">{value}</p><p className="mt-1 text-[10px] text-stone-500">{label}</p></div>)}</div>
          <section className="mt-10 max-w-3xl"><p className="eyebrow">A home that feels like yours</p><h2 className="mt-2 font-serif text-2xl text-[#243c35]">About this home</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-stone-600">{property.description}</p></section>
          <section className="mt-9"><h2 className="font-serif text-2xl text-[#243c35]">The details</h2><div className="mt-4 flex flex-wrap gap-2">{property.amenities.map((amenity) => <span key={amenity} className="rounded-full border border-stone-200 bg-white px-4 py-2.5 text-xs text-stone-600">{amenity}</span>)}</div><p className="mt-5 text-xs text-stone-500">Neighborhood <span className="ml-2 font-semibold text-[#243c35]">{property.neighborhood}</span><span className="mx-3 text-stone-300">·</span>HOA <span className="ml-2 font-semibold text-[#243c35]">{property.hoaFee ? `$${property.hoaFee.toLocaleString()} / mo` : "None"}</span></p></section>
          {property.category === "SALE" && <div className="mt-12"><MortgageCalculator price={property.price} /></div>}
        </div>
        <aside className="h-fit rounded-[22px] border border-stone-200 bg-white p-6 shadow-[0_15px_50px_rgba(35,55,45,.06)] lg:sticky lg:top-24">
          <p className="font-serif text-3xl text-[#243c35]">{formatPrice(property.price, property.category)}</p><p className="mt-2 text-xs text-stone-500">{property.beds} bedrooms <span className="mx-1 text-stone-300">·</span> {property.baths} bathrooms <span className="mx-1 text-stone-300">·</span> {property.sqft.toLocaleString()} sqft</p>
          <button onClick={() => setLeadType("TOUR")} className="mt-6 w-full rounded-full bg-[#243c35] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#35564c]">Request a private tour</button>
          <button onClick={() => setLeadType("MESSAGE")} className="mt-3 w-full rounded-full border border-stone-300 px-5 py-4 text-sm font-semibold text-[#243c35] transition hover:bg-[#f7f6f2]">Ask the agent a question</button>
          <button onClick={() => setSaved(toggleSavedProperty(property.id).includes(property.id))} aria-pressed={saved} className="mt-4 flex w-full items-center justify-center gap-2 py-2 text-xs font-medium text-stone-500"><Heart className={`size-4 ${saved ? "fill-[#c7755b] text-[#c7755b]" : ""}`} />{saved ? "Saved to your list" : "Save this home"}</button>
          <div className="my-5 h-px bg-stone-100" />
          <div className="flex items-center gap-3"><img src={agent.avatar} alt="" className="size-12 rounded-full object-cover" /><div><p className="text-sm font-semibold text-[#243c35]">{agent.name}</p><p className="mt-1 text-[10px] text-stone-500">{agent.title}</p></div></div>
          <div className="mt-4 grid grid-cols-2 gap-2"><a href={`tel:${agent.phone.replace(/[^+\d]/g, "")}`} className="rounded-xl border border-stone-200 py-3 text-center text-[11px] font-semibold text-[#243c35]">Call advisor</a><a href={`mailto:${agent.email}?subject=${encodeURIComponent(`Question about ${property.title}`)}`} className="rounded-xl border border-stone-200 py-3 text-center text-[11px] font-semibold text-[#243c35]">Email advisor</a></div>
          {property.category === "RENT" && <p className="mt-5 border-t border-stone-100 pt-4 text-[10px] leading-5 text-stone-400">Rental price shown monthly. Availability and lease terms to be confirmed with the listing advisor.</p>}
        </aside>
      </div>
    </div>
    {lightbox && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#101714]/95 p-4" role="dialog" aria-modal="true" aria-label="Property photo gallery" onMouseDown={(event) => { if (event.target === event.currentTarget) setLightbox(false); }}><button onClick={() => setLightbox(false)} aria-label="Close gallery" className="absolute right-5 top-5 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white"><X className="size-5" /></button><button onClick={() => moveImage(-1)} aria-label="Previous photo" className="absolute left-3 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white sm:left-8"><ChevronLeft className="size-6" /></button><img src={images[imageIndex]} alt={`${property.title}, photo ${imageIndex + 1} of ${images.length}`} className="max-h-[82vh] max-w-[90vw] rounded-lg object-contain" /><button onClick={() => moveImage(1)} aria-label="Next photo" className="absolute right-3 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white sm:right-8"><ChevronRight className="size-6" /></button><p className="absolute bottom-5 text-xs text-white/60">{imageIndex + 1} / {images.length}</p></div>}
    {leadType && <LeadCaptureModal propertyId={property.id} propertyTitle={property.title} type={leadType} onClose={() => setLeadType(null)} />}
  </main>;
}
