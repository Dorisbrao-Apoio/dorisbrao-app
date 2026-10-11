"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownToLine, ArrowUpRight, Building2, Check, ChevronDown, Plus, Eye, Home, Inbox, Pencil, Search, Trash2, Users } from "lucide-react";

import { readLeads, readProperties, readSession, writeProperties } from "@/lib/data/browser-store";
import { seedProperties } from "@/lib/data/properties";
import type { DemoSession, Property, PropertyCategory, PropertyLead, PropertyStatus } from "@/lib/data/types";
import { formatPrice } from "@/components/property/PropertyCard";

const blankForm = { title: "", neighborhood: "", price: "", category: "SALE" as PropertyCategory, beds: "", baths: "", sqft: "", description: "", image: "" };

export function AgentDashboard(): JSX.Element {
  const [session, setSession] = useState<DemoSession | null>(null);
  const [properties, setProperties] = useState<Property[]>(seedProperties);
  const [leads, setLeads] = useState<PropertyLead[]>([]);
  const [tab, setTab] = useState<"listings" | "leads">("listings");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(blankForm);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => { setSession(readSession()); setProperties(readProperties()); setLeads(readLeads()); }, []);

  const visibleProperties = useMemo(() => properties.filter((property) => `${property.title} ${property.neighborhood}`.toLowerCase().includes(search.toLowerCase())), [properties, search]);
  const liveCount = properties.filter((property) => property.status === "PUBLISHED").length;

  function persist(next: Property[]) {
    setProperties(next);
    writeProperties(next);
  }

  function resetForm() { setEditingId(null); setForm(blankForm); }

  function startEdit(property: Property) {
    setEditingId(property.id);
    setForm({ title: property.title, neighborhood: property.neighborhood, price: String(property.price), category: property.category, beds: String(property.beds), baths: String(property.baths), sqft: String(property.sqft), description: property.description, image: property.images[0] ?? "" });
    document.getElementById("listing-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function saveProperty(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = form.title.trim();
    const neighborhood = form.neighborhood.trim();
    const existing = properties.find((property) => property.id === editingId);
    const slug = existing?.slug ?? `${neighborhood}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const property: Property = {
      id: editingId ?? `custom-${crypto.randomUUID()}`, slug, title, neighborhood, location: `${neighborhood}, Luanda`, city: "Luanda",
      price: Number(form.price), category: form.category, beds: Number(form.beds), baths: Number(form.baths), sqft: Number(form.sqft),
      images: [form.image.trim() || seedProperties[0]!.images[0]!], agentId: existing?.agentId ?? "agent-1", status: existing?.status ?? "DRAFT",
      description: form.description.trim() || "A thoughtfully presented home in Luanda. Contact our team to learn more.", amenities: existing?.amenities ?? [], yearBuilt: existing?.yearBuilt ?? new Date().getFullYear(), hoaFee: existing?.hoaFee ?? 0,
      latitude: existing?.latitude ?? 37.7749, longitude: existing?.longitude ?? -122.4194,
    };
    persist(editingId ? properties.map((item) => item.id === editingId ? property : item) : [property, ...properties]);
    setNotice(editingId ? "Listing details updated." : "Draft listing created.");
    resetForm();
    window.setTimeout(() => setNotice(""), 3500);
  }

  function toggleStatus(property: Property) {
    persist(properties.map((item) => item.id === property.id ? { ...item, status: item.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" } : item));
  }

  function removeProperty(property: Property) {
    if (!window.confirm(`Delete “${property.title}”? This cannot be undone.`)) return;
    persist(properties.filter((item) => item.id !== property.id));
    if (editingId === property.id) resetForm();
  }

  function refreshLeads() { setLeads(readLeads()); }

  if (session === null) return <main className="grid min-h-[70vh] place-items-center bg-[#faf9f6] px-5"><div className="max-w-md rounded-[22px] border border-stone-200 bg-white p-8 text-center"><span className="mx-auto grid size-12 place-items-center rounded-full bg-[#e7ece6] text-[#476557]"><Building2 className="size-5" /></span><h1 className="mt-5 font-serif text-3xl text-[#243c35]">Your Dorisbrao workspace</h1><p className="mt-3 text-sm leading-6 text-stone-500">Sign in as an agent or administrator to manage listings and incoming inquiries.</p><Link href="/login" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#243c35] px-6 py-3.5 text-xs font-semibold text-white">Sign in to continue <ArrowUpRight className="size-4" /></Link></div></main>;
  if (session.role === "BUYER") return <main className="grid min-h-[70vh] place-items-center bg-[#faf9f6] px-5"><div className="max-w-md rounded-[22px] border border-stone-200 bg-white p-8 text-center"><h1 className="font-serif text-3xl text-[#243c35]">This is an agent workspace.</h1><p className="mt-3 text-sm leading-6 text-stone-500">You’re signed in as a home seeker. You can keep exploring or switch to a demo agent profile.</p><div className="mt-6 flex justify-center gap-3"><Link href="/search" className="rounded-full border border-stone-300 px-5 py-3 text-xs font-semibold text-[#243c35]">Explore homes</Link><Link href="/signup?role=AGENT" className="rounded-full bg-[#243c35] px-5 py-3 text-xs font-semibold text-white">Agent demo</Link></div></div></main>;

  return <main className="min-h-screen bg-[#f5f4f0]">
    <div className="border-b border-stone-200 bg-white"><div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-7 sm:px-8 lg:px-12"><div><p className="eyebrow">{session.role === "ADMIN" ? "Administration" : "Agent workspace"}</p><h1 className="mt-1 font-serif text-3xl text-[#243c35]">Good morning, {session.name.split(" ")[0]}.</h1></div><Link href="/search" className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-3 text-[11px] font-semibold text-[#243c35]"><Eye className="size-4" />View public site</Link></div></div>
    <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
        { title: "Total listings", value: properties.length, icon: Home, helper: "Across your portfolio" },
        { title: "Published homes", value: liveCount, icon: Check, helper: "Visible to home seekers" },
        { title: "New inquiries", value: leads.length, icon: Inbox, helper: "Tour requests & messages" },
        { title: "Your role", value: session.role === "ADMIN" ? "Admin" : "Agent", icon: Users, helper: session.email },
      ].map(({ title, value, icon: Icon, helper }) => <article key={title} className="rounded-2xl border border-stone-200 bg-white p-5"><div className="flex items-center justify-between"><p className="text-xs text-stone-500">{title}</p><Icon className="size-4 text-[#91a294]" /></div><p className="mt-3 font-serif text-3xl text-[#243c35]">{value}</p><p className="mt-1 truncate text-[10px] text-stone-400">{helper}</p></article>)}</div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4"><div className="inline-flex rounded-full border border-stone-200 bg-white p-1"><button onClick={() => setTab("listings")} className={`rounded-full px-5 py-2.5 text-xs font-semibold ${tab === "listings" ? "bg-[#243c35] text-white" : "text-stone-500"}`}>Listings</button><button onClick={() => { setTab("leads"); refreshLeads(); }} className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold ${tab === "leads" ? "bg-[#243c35] text-white" : "text-stone-500"}`}>Inquiries {leads.length > 0 && <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${tab === "leads" ? "bg-white/20" : "bg-[#e4e9e4] text-[#476557]"}`}>{leads.length}</span>}</button></div>{tab === "listings" && <button onClick={() => { resetForm(); document.getElementById("listing-form")?.scrollIntoView({ behavior: "smooth", block: "center" }); }} className="inline-flex items-center gap-2 rounded-full bg-[#243c35] px-5 py-3 text-xs font-semibold text-white"><Plus className="size-4" />Add a listing</button>}</div>
      {notice && <p role="status" className="mt-4 rounded-xl bg-[#e4eee5] px-4 py-3 text-xs font-medium text-[#355b47]">{notice}</p>}

      {tab === "listings" ? <div className="mt-5 grid items-start gap-6 xl:grid-cols-[1fr_370px]">
        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 p-5"><div><h2 className="font-serif text-xl text-[#243c35]">Your properties</h2><p className="mt-1 text-[10px] text-stone-400">Create, publish, and update your listing collection.</p></div><label className="relative"><span className="sr-only">Search listings</span><Search className="absolute left-3 top-2.5 size-4 text-stone-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search listings" className="h-9 w-44 rounded-full border border-stone-200 pl-9 pr-3 text-xs outline-none focus:border-[#476557]" /></label></div>
          <div className="divide-y divide-stone-100">{visibleProperties.map((property) => <article key={property.id} className="grid gap-4 p-4 sm:grid-cols-[90px_1fr_auto] sm:items-center"><img src={property.images[0]} alt="" className="h-20 w-full rounded-xl object-cover sm:w-[90px]" /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-semibold text-[#243c35]">{property.title}</h3><span className={`rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.1em] ${property.status === "PUBLISHED" ? "bg-[#e4eee5] text-[#466a54]" : "bg-[#f4eee2] text-[#9b7844]"}`}>{property.status === "PUBLISHED" ? "Published" : "Draft"}</span></div><p className="mt-1 text-[10px] text-stone-500">{property.neighborhood} <span className="mx-1 text-stone-300">·</span>{formatPrice(property.price, property.category)}</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => startEdit(property)} className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-3 py-1.5 text-[9px] font-semibold text-stone-600"><Pencil className="size-3" />Edit</button><button onClick={() => toggleStatus(property)} className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-3 py-1.5 text-[9px] font-semibold text-stone-600"><ChevronDown className="size-3" />{property.status === "PUBLISHED" ? "Unpublish" : "Publish"}</button><button onClick={() => removeProperty(property)} className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-3 py-1.5 text-[9px] font-semibold text-red-700"><Trash2 className="size-3" />Delete</button></div></div><Link href={`/listings/${property.slug}`} aria-label={`View ${property.title}`} className="hidden rounded-full border border-stone-200 p-2 text-stone-500 hover:text-[#243c35] sm:grid"><ArrowUpRight className="size-4" /></Link></article>)}{visibleProperties.length === 0 && <p className="p-10 text-center text-sm text-stone-500">No properties match that search.</p>}</div>
        </section>

        <section id="listing-form" className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"><div className="flex items-start justify-between"><div><p className="eyebrow">{editingId ? "Make it yours" : "Grow your portfolio"}</p><h2 className="mt-1 font-serif text-2xl text-[#243c35]">{editingId ? "Edit listing" : "Add a home"}</h2></div>{editingId && <button onClick={resetForm} className="text-[10px] font-semibold text-stone-400">Cancel</button>}</div><form onSubmit={saveProperty} className="mt-5 grid gap-3">
          <label className="block"><span className="form-label">Property title</span><input required maxLength={100} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="form-control" placeholder="A bright home near the park" /></label>
          <div className="grid grid-cols-2 gap-3"><label className="block"><span className="form-label">Neighborhood</span><input required maxLength={80} value={form.neighborhood} onChange={(event) => setForm({ ...form, neighborhood: event.target.value })} className="form-control" placeholder="Talatona" /></label><label className="block"><span className="form-label">Listing type</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as PropertyCategory })} className="form-control"><option value="SALE">For sale</option><option value="RENT">For rent</option></select></label></div>
          <div className="grid grid-cols-2 gap-3"><label className="block"><span className="form-label">Price ($)</span><input required type="number" min="1" max="100000000" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="form-control" placeholder="1250000" /></label><label className="block"><span className="form-label">Square feet</span><input required type="number" min="100" max="200000" value={form.sqft} onChange={(event) => setForm({ ...form, sqft: event.target.value })} className="form-control" placeholder="1800" /></label></div>
          <div className="grid grid-cols-2 gap-3"><label className="block"><span className="form-label">Bedrooms</span><input required type="number" min="0" max="20" value={form.beds} onChange={(event) => setForm({ ...form, beds: event.target.value })} className="form-control" placeholder="3" /></label><label className="block"><span className="form-label">Bathrooms</span><input required type="number" min="0" max="20" step="0.5" value={form.baths} onChange={(event) => setForm({ ...form, baths: event.target.value })} className="form-control" placeholder="2" /></label></div>
          <label className="block"><span className="form-label">Cover image URL <span className="font-normal text-stone-400">(optional)</span></span><input type="url" maxLength={1000} value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} className="form-control" placeholder="https://…" /></label>
          <label className="block"><span className="form-label">Property description</span><textarea rows={3} maxLength={1800} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="form-control resize-y" placeholder="What makes this home special?" /></label>
          <button type="submit" className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#243c35] text-xs font-semibold text-white">{editingId ? "Save changes" : "Save as draft"}<ArrowDownToLine className="size-4" /></button>
          <p className="text-center text-[9px] leading-4 text-stone-400">Demo listings are saved in this browser. Publish to make them appear in search results.</p>
        </form></section>
      </div> : <section className="mt-5 overflow-hidden rounded-2xl border border-stone-200 bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 p-5"><div><h2 className="font-serif text-xl text-[#243c35]">Client inquiries</h2><p className="mt-1 text-[10px] text-stone-400">Tour requests and messages submitted from property pages.</p></div><button onClick={refreshLeads} className="rounded-full border border-stone-200 px-4 py-2 text-[10px] font-semibold text-stone-600">Refresh inbox</button></div>{leads.length > 0 ? <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left"><thead className="bg-[#f7f6f2] text-[9px] font-semibold uppercase tracking-[.13em] text-stone-400"><tr><th className="px-5 py-3">Client</th><th className="px-5 py-3">Property</th><th className="px-5 py-3">Request</th><th className="px-5 py-3">Message</th><th className="px-5 py-3">Received</th></tr></thead><tbody className="divide-y divide-stone-100">{leads.map((lead) => <tr key={lead.id} className="text-xs"><td className="px-5 py-4"><p className="font-semibold text-[#243c35]">{lead.name}</p><a href={`mailto:${lead.email}`} className="mt-1 block text-[10px] text-stone-500 underline">{lead.email}</a>{lead.phone && <a href={`tel:${lead.phone}`} className="mt-1 block text-[10px] text-stone-500">{lead.phone}</a>}</td><td className="max-w-[190px] px-5 py-4 text-stone-600">{lead.propertyTitle}</td><td className="px-5 py-4"><span className="rounded-full bg-[#e4eee5] px-2.5 py-1 text-[9px] font-semibold text-[#476557]">{lead.type === "TOUR" ? "Tour request" : "Message"}</span></td><td className="max-w-[240px] px-5 py-4 text-[10px] leading-5 text-stone-500">{lead.message}</td><td className="px-5 py-4 text-[10px] text-stone-500">{new Date(lead.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div> : <div className="grid min-h-72 place-items-center px-5 text-center"><div><span className="mx-auto grid size-12 place-items-center rounded-full bg-[#e7ece6] text-[#476557]"><Inbox className="size-5" /></span><h3 className="mt-4 font-serif text-2xl text-[#243c35]">Your inbox is clear.</h3><p className="mt-2 max-w-sm text-xs leading-5 text-stone-500">When someone requests a tour or sends a message from a listing, their details will appear here.</p><button onClick={() => setTab("listings")} className="mt-5 text-xs font-semibold text-[#476557] underline underline-offset-4">Back to listings</button></div></div>}</section>}
      <p className="mt-6 text-center text-[9px] text-stone-400">Demo workspace data is stored in this browser only. Connect a database and verified role-based authentication for a live deployment.</p>
    </div>
  </main>;
}
