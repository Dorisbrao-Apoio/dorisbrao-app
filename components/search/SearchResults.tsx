"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Heart, SlidersHorizontal, X } from "lucide-react";

import { PropertyCard } from "@/components/property/PropertyCard";
import { readSavedPropertyIds, SAVED_PROPERTIES_CHANGED } from "@/lib/data/browser-store";
import type { Property, PropertyCategory } from "@/lib/data/types";

type InitialFilters = { location: string; category: string; beds: string; baths: string; maxPrice: string; savedOnly: boolean };
const amenityOptions = ["Garden", "Garage", "Pool", "Bay views", "Pet friendly", "In-unit laundry"];

export function SearchResults({ initialFilters }: { initialFilters: InitialFilters }): JSX.Element {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [location, setLocation] = useState(initialFilters.location);
  const [category, setCategory] = useState(initialFilters.category || "ALL");
  const [beds, setBeds] = useState(initialFilters.beds);
  const [baths, setBaths] = useState(initialFilters.baths);
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice);
  const [minSqft, setMinSqft] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(initialFilters.savedOnly);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/listings", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load homes.");
        setProperties(await response.json() as Property[]);
      })
      .catch(() => { if (!controller.signal.aborted) setProperties([]); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    setSavedIds(readSavedPropertyIds());
    const refreshSaved = () => setSavedIds(readSavedPropertyIds());
    window.addEventListener(SAVED_PROPERTIES_CHANGED, refreshSaved);
    return () => { controller.abort(); window.removeEventListener(SAVED_PROPERTIES_CHANGED, refreshSaved); };
  }, []);

  const filtered = useMemo(() => properties.filter((property) => {
    const matchesLocation = `${property.location} ${property.neighborhood} ${property.city}`.toLowerCase().includes(location.trim().toLowerCase());
    const matchesCategory = category === "ALL" || property.category === category;
    const matchesBeds = !beds || property.beds >= Number(beds);
    const matchesBaths = !baths || property.baths >= Number(baths);
    const maxPriceValue = maxPrice ? Number(maxPrice) : Infinity;
    const matchesPrice = !maxPrice || property.price <= maxPriceValue;
    const matchesSqft = !minSqft || property.sqft >= Number(minSqft);
    const matchesAmenities = amenities.every((amenity) => property.amenities.some((item) => item.toLowerCase().includes(amenity.toLowerCase())));
    const matchesSaved = !savedOnly || savedIds.includes(property.id);
    return property.status === "PUBLISHED" && matchesLocation && matchesCategory && matchesBeds && matchesBaths && matchesPrice && matchesSqft && matchesAmenities && matchesSaved;
  }), [properties, location, category, beds, baths, maxPrice, minSqft, amenities, savedOnly, savedIds]);

  function toggleAmenity(amenity: string) {
    setAmenities((current) => current.includes(amenity) ? current.filter((item) => item !== amenity) : [...current, amenity]);
  }

  function clearFilters() {
    setLocation(""); setCategory("ALL"); setBeds(""); setBaths(""); setMaxPrice(""); setMinSqft(""); setAmenities([]); setSavedOnly(false);
  }

  const filters = <div className="space-y-7">
    <div className="flex items-center justify-between"><h2 className="font-serif text-xl text-[#243c35]">Refine your search</h2><button onClick={clearFilters} className="text-[11px] font-semibold text-stone-400 hover:text-[#243c35]">Reset</button></div>
    <label className="block"><span className="filter-label">Neighborhood or city</span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Try Talatona" className="filter-input" /></label>
    <fieldset><legend className="filter-label">Availability</legend><div className="mt-2 grid grid-cols-3 gap-2">{[{ value: "ALL", label: "All" }, { value: "SALE", label: "Buy" }, { value: "RENT", label: "Rent" }].map((option) => <button key={option.value} onClick={() => setCategory(option.value)} className={`rounded-xl border px-3 py-2.5 text-xs font-medium transition ${category === option.value ? "border-[#243c35] bg-[#243c35] text-white" : "bg-white text-stone-600 hover:border-[#243c35]"}`}>{option.label}</button>)}</div></fieldset>
    <label className="block"><span className="filter-label">Bedrooms</span><select value={beds} onChange={(event) => setBeds(event.target.value)} className="filter-input"><option value="">Any number</option><option value="1">1+ bedroom</option><option value="2">2+ bedrooms</option><option value="3">3+ bedrooms</option><option value="4">4+ bedrooms</option></select></label>
    <label className="block"><span className="filter-label">Bathrooms</span><select value={baths} onChange={(event) => setBaths(event.target.value)} className="filter-input"><option value="">Any number</option><option value="1">1+ bathroom</option><option value="2">2+ bathrooms</option><option value="3">3+ bathrooms</option></select></label>
    <label className="block"><span className="filter-label">Maximum price</span><select value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} className="filter-input"><option value="">No maximum</option><option value="5000">$5,000 / month</option><option value="10000">$10,000 / month</option><option value="750000">$750,000</option><option value="1500000">$1,500,000</option><option value="2500000">$2,500,000</option><option value="3000000">$3,000,000</option></select></label>
    <label className="block"><span className="filter-label">Minimum square feet</span><select value={minSqft} onChange={(event) => setMinSqft(event.target.value)} className="filter-input"><option value="">Any size</option><option value="900">900+ sqft</option><option value="1400">1,400+ sqft</option><option value="2000">2,000+ sqft</option><option value="2800">2,800+ sqft</option></select></label>
    <fieldset><legend className="filter-label">Features</legend><div className="mt-3 grid grid-cols-2 gap-2">{amenityOptions.map((amenity) => <label key={amenity} className="flex cursor-pointer items-center gap-2 text-[11px] text-stone-600"><input type="checkbox" checked={amenities.includes(amenity)} onChange={() => toggleAmenity(amenity)} className="size-4 rounded accent-[#243c35]" />{amenity}</label>)}</div></fieldset>
    <button aria-pressed={savedOnly} onClick={() => setSavedOnly((current) => !current)} className={`flex w-full items-center gap-2 rounded-xl border px-3 py-3 text-xs font-medium ${savedOnly ? "border-[#c7755b] bg-[#fcf1eb] text-[#a8553b]" : "bg-white text-stone-600"}`}><Heart className={`size-4 ${savedOnly ? "fill-current" : ""}`} />Show saved homes <span className="ml-auto text-[10px]">{savedIds.length}</span></button>
  </div>;

  return <main className="min-h-screen bg-[#faf9f6]">
    <section className="border-b border-stone-200 bg-[#f0eee8]"><div className="mx-auto max-w-[1440px] px-5 py-9 sm:px-8 sm:py-12 lg:px-12"><p className="eyebrow">Dorisbrao property collection</p><div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="font-serif text-4xl tracking-tight text-[#243c35] sm:text-5xl">Find your <em>place.</em></h1><p className="mt-3 text-sm text-stone-500">Homes chosen with care, in neighborhoods worth knowing.</p></div><Link href="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-[#243c35]">List with Dorisbrao <ArrowUpRight className="size-4" /></Link></div></div></section>
    <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12">
      <div className="mb-6 flex items-center justify-between"><p className="text-sm text-stone-500"><span className="font-semibold text-[#243c35]">{filtered.length}</span> homes to explore</p><button onClick={() => setMobileFiltersOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2.5 text-xs font-semibold text-[#243c35] lg:hidden"><SlidersHorizontal className="size-4" />Filters</button></div>
      <div className="grid gap-8 lg:grid-cols-[245px_1fr]">
        <aside className="hidden rounded-2xl border border-stone-200 bg-[#f7f6f2] p-5 lg:block">{filters}</aside>
        <div className="grid content-start gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((property) => <PropertyCard key={property.id} property={property} />)}
          {loading && <div className="col-span-full grid min-h-72 place-items-center text-sm text-stone-500">Loading homes…</div>}
          {!loading && filtered.length === 0 && <div className="col-span-full grid min-h-72 place-items-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 text-center"><div><p className="font-serif text-2xl text-[#243c35]">No homes found just yet.</p><p className="mt-2 text-sm text-stone-500">Try adjusting a filter or clear your search to see everything.</p><button onClick={clearFilters} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#243c35] px-5 py-3 text-xs font-semibold text-white">Clear filters <ArrowUpRight className="size-4" /></button></div></div>}
        </div>
      </div>
    </div>
    {mobileFiltersOpen && <div className="fixed inset-0 z-50 bg-[#15241f]/45 lg:hidden" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setMobileFiltersOpen(false); }}><section role="dialog" aria-modal="true" aria-labelledby="mobile-filters-title" className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-[#faf9f6] p-6"><div className="mb-7 flex justify-between"><div><p className="eyebrow">Find your fit</p><h2 id="mobile-filters-title" className="mt-1 font-serif text-2xl">Filters</h2></div><button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters" className="grid size-10 place-items-center rounded-full border border-stone-300"><X className="size-4" /></button></div>{filters}<button onClick={() => setMobileFiltersOpen(false)} className="mt-8 w-full rounded-xl bg-[#243c35] py-4 text-sm font-semibold text-white">Show {filtered.length} homes</button></section></div>}
  </main>;
}
