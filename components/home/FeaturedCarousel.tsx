"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { PropertyCard } from "@/components/property/PropertyCard";
import type { Property } from "@/lib/data/types";

export function FeaturedCarousel(): JSX.Element {
  const trackRef = useRef<HTMLDivElement>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  useEffect(() => {
    fetch("/api/listings", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() as Promise<Property[]> : [])
      .then(setProperties)
      .catch(() => setProperties([]));
  }, []);
  function scroll(direction: number) {
    trackRef.current?.scrollBy({ left: direction * 380, behavior: "smooth" });
  }

  return <>
    <div ref={trackRef} className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3">
      {properties.filter((property) => property.featured && property.status === "PUBLISHED").map((property) => <div key={property.id} className="w-[88%] shrink-0 snap-start sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]"><PropertyCard property={property} /></div>)}
    </div>
    <div className="mt-5 hidden justify-end gap-2 sm:flex"><button onClick={() => scroll(-1)} aria-label="Previous homes" className="grid size-10 place-items-center rounded-full border border-stone-300 text-[#243c35] transition hover:bg-white"><ArrowLeft className="size-4" /></button><button onClick={() => scroll(1)} aria-label="Next homes" className="grid size-10 place-items-center rounded-full border border-stone-300 text-[#243c35] transition hover:bg-white"><ArrowRight className="size-4" /></button></div>
  </>;
}
