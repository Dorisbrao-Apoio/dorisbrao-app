"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { PropertyDetail } from "@/components/property/PropertyDetail";
import type { Property } from "@/lib/data/types";

export function PropertyRoute({ slug }: { slug: string }): JSX.Element {
  const [property, setProperty] = useState<Property | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setProperty(null);
    setChecked(false);
    fetch(`/api/listings/${encodeURIComponent(slug)}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => response.ok ? await response.json() as Property : null)
      .then((result) => { if (!controller.signal.aborted) setProperty(result); })
      .catch(() => { if (!controller.signal.aborted) setProperty(null); })
      .finally(() => { if (!controller.signal.aborted) setChecked(true); });
    return () => controller.abort();
  }, [slug]);

  if (property) return <PropertyDetail property={property} />;
  if (!checked) return <main className="min-h-[60vh] bg-[#faf9f6]" aria-busy="true" />;
  return <main className="grid min-h-[60vh] place-items-center bg-[#faf9f6] px-5 text-center"><div><p className="eyebrow">A home not found</p><h1 className="mt-3 font-serif text-4xl text-[#243c35]">This listing has moved.</h1><p className="mt-3 text-sm text-stone-500">Let’s help you find another place that feels right.</p><Link href="/search" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#243c35] px-6 py-3 text-xs font-semibold text-white"><ArrowLeft className="size-4" />Explore homes</Link></div></main>;
}
