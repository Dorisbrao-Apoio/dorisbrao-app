"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

import type { PropertyLead } from "@/lib/data/types";

type Props = { propertyId: string; propertyTitle: string; type: PropertyLead["type"]; onClose: () => void };

export function LeadCaptureModal({ propertyId, propertyTitle, type, onClose }: Props): JSX.Element {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (!name || !email) { setError("Please add your name and email so the agent can get back to you."); return; }
    setPending(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, name, email, phone, message: message || (type === "TOUR" ? "I’d like to schedule a tour." : "I’d like to learn more about this property."), type }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to save your request.");
      setError(""); setSent(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save your request. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-[#14211d]/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="lead-title" className="relative my-auto w-full max-w-lg rounded-[24px] bg-[#faf9f6] p-6 shadow-2xl sm:p-9">
      <button onClick={onClose} aria-label="Close request form" className="absolute right-5 top-5 grid size-10 place-items-center rounded-full border border-stone-200 text-stone-500 hover:bg-white"><X className="size-4" /></button>
      {sent ? <div className="py-12 text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-[#e2eae3] text-[#385c4d]"><Check className="size-6" /></span><p className="eyebrow mt-6">You’re all set</p><h2 id="lead-title" className="mt-2 font-serif text-3xl text-[#243c35]">We’ll be in touch.</h2><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-stone-500">Your request has been saved. The Dorisbrao advisor for this home will follow up shortly.</p><button onClick={onClose} className="mt-7 rounded-full bg-[#243c35] px-6 py-3 text-xs font-semibold text-white">Done</button></div> : <>
        <p className="eyebrow">A personal introduction</p><h2 id="lead-title" className="mt-2 max-w-sm font-serif text-3xl leading-tight text-[#243c35]">{type === "TOUR" ? "Let’s see it in person." : "Tell us what you’d like to know."}</h2><p className="mt-2 pr-8 text-sm leading-6 text-stone-500">{propertyTitle}. Share a few details and a Dorisbrao advisor will reach out.</p>
        <form onSubmit={submit} className="mt-7 grid gap-4">
          <label className="block"><span className="form-label">Your name</span><input name="name" autoComplete="name" required maxLength={100} className="form-control" placeholder="Full name" /></label>
          <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="form-label">Email address</span><input type="email" name="email" autoComplete="email" required maxLength={254} className="form-control" placeholder="you@example.com" /></label><label className="block"><span className="form-label">Phone <span className="font-normal text-stone-400">(optional)</span></span><input type="tel" name="phone" autoComplete="tel" maxLength={30} className="form-control" placeholder="(555) 000-0000" /></label></div>
          <label className="block"><span className="form-label">{type === "TOUR" ? "Anything we should know?" : "Your message"}</span><textarea name="message" rows={3} maxLength={1000} className="form-control resize-y" placeholder={type === "TOUR" ? "Preferred days or times, questions, accessibility needs…" : "Ask us about the home…"} /></label>
          {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
          <button type="submit" disabled={pending} className="mt-1 rounded-full bg-[#243c35] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#35564c] disabled:cursor-wait disabled:opacity-60">{pending ? "Sending…" : type === "TOUR" ? "Request a private tour" : "Send to the agent"}</button>
          <p className="text-center text-[10px] leading-5 text-stone-400">By sending, you agree to be contacted about this property. Your details stay with Dorisbrao.</p>
        </form>
      </>}
    </section>
  </div>;
}
