"use client";

import mapboxgl from "mapbox-gl";
import Link from "next/link";
import { useEffect, useRef } from "react";

import type { ListingMatch } from "@/lib/validation/search";

type Props = { listings: ListingMatch[]; initialCenter?: [number, number]; initialZoom?: number };
const defaultCenter: [number, number] = [13.2344, -8.8383];

export function ListingMap({ listings, initialCenter = defaultCenter, initialZoom = 10 }: Props): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [initialLongitude, initialLatitude] = initialCenter;

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token || !containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({ container: containerRef.current, style: "mapbox://styles/mapbox/streets-v12", center: initialCenter, zoom: initialZoom });
    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [initialLatitude, initialLongitude, initialZoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = listings.map((listing) => new mapboxgl.Marker({ color: "#0f172a" })
      .setLngLat([listing.longitude, listing.latitude])
      .setPopup(new mapboxgl.Popup({ offset: 18 }).setHTML(`<strong>${escapeHtml(listing.title)}</strong><br/>${listing.bedrooms} bed · ${listing.bathrooms} bath`))
      .addTo(map));
    if (listings.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      listings.forEach((listing) => bounds.extend([listing.longitude, listing.latitude]));
      map.fitBounds(bounds, { padding: 56, maxZoom: 14, duration: 0 });
    }
    return () => markers.forEach((marker) => marker.remove());
  }, [listings]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) return <div className="grid min-h-80 place-items-center rounded-xl border bg-muted p-6 text-center text-sm text-muted-foreground">Map display requires NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN.</div>;
  return <div className="relative overflow-hidden rounded-xl border"><div ref={containerRef} className="h-[32rem] w-full" aria-label="Map of active listings" /><div className="sr-only">{listings.map((listing) => <Link key={listing.id} href={`/listings/${listing.slug}`}>{listing.title}</Link>)}</div></div>;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" })[character] ?? character);
}
