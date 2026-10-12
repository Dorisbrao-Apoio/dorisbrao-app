"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }): JSX.Element {
  const router = useRouter();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");
    if (mode === "signup" && name.length < 2) { setError("Please enter your name."); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError("Enter a valid email address."); return; }
    if (password.length < 8) { setError("Use at least 8 characters for your password."); return; }
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Account sign-in is not configured yet. Please try again later.");
      return;
    }

    setPending(true);
    try {
      if (mode === "signup") {
        const { data: result, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (authError) throw authError;
        if (!result.session) {
          setNotice("Check your email for a verification link. You can sign in after verifying your address.");
          return;
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
      }

      const profileResponse = await fetch("/api/auth/profile", { cache: "no-store" });
      if (!profileResponse.ok) throw new Error("Your email must be verified before you can use your account.");
      const profile = await profileResponse.json() as { role: "CLIENT" | "AGENT" | "ADMIN" };
      router.replace(profile.role === "CLIENT" ? "/search" : "/dashboard");
      router.refresh();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Unable to authenticate. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return <main className="grid min-h-[calc(100vh-76px)] bg-[#faf9f6] lg:grid-cols-[1fr_1fr]">
    <aside className="relative hidden overflow-hidden bg-[#263d35] lg:block"><img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85" alt="Sunlit living room with garden views" className="absolute inset-0 size-full object-cover opacity-55" /><div className="absolute inset-0 bg-gradient-to-t from-[#14231d]/85 via-[#14231d]/15 to-[#14231d]/10" /><div className="absolute inset-x-12 bottom-14 max-w-xl text-white"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-white/70">A more considered way home</p><h1 className="mt-4 font-serif text-6xl leading-[1.02]">The right place<br />changes <em>everything.</em></h1><p className="mt-5 max-w-sm text-sm leading-6 text-white/75">Join a community that believes finding home should feel as good as being there.</p></div></aside>
    <section className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-14"><div className="w-full max-w-[480px]">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-[#243c35]"><ArrowLeft className="size-4" />Back to Dorisbrao</Link>
      <p className="eyebrow mt-10">{mode === "login" ? "Welcome back" : "Start your next chapter"}</p><h2 className="mt-2 font-serif text-4xl tracking-tight text-[#243c35]">{mode === "login" ? "Good to see you." : "Make yourself at home."}</h2><p className="mt-3 text-sm leading-6 text-stone-500">{mode === "login" ? "Sign in to continue your home search or workspace." : "Create your Dorisbrao profile to save homes and connect with our team."}</p>
      <form onSubmit={submit} className="mt-8 grid gap-5">
        {mode === "signup" && <label className="block"><span className="form-label">Your name</span><input name="name" required minLength={2} maxLength={100} autoComplete="name" className="form-control" placeholder="Full name" /></label>}
        <label className="block"><span className="form-label">Email address</span><input name="email" type="email" required maxLength={254} autoComplete="email" className="form-control" placeholder="you@example.com" /></label>
        <label className="block"><span className="form-label">Password <span className="font-normal text-stone-400">(8 characters minimum)</span></span><input name="password" type="password" required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} className="form-control" placeholder="••••••••••" /></label>
        {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
        {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-800">{notice}</p>}
        <button type="submit" disabled={pending} className="mt-1 flex h-12 items-center justify-center gap-2 rounded-full bg-[#243c35] text-sm font-semibold text-white transition hover:bg-[#35564c] disabled:cursor-wait disabled:opacity-60">{pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}<ArrowRight className="size-4" /></button>
      </form>
      <p className="mt-6 text-center text-xs text-stone-500">{mode === "login" ? "New to Dorisbrao?" : "Already have an account?"} <Link href={mode === "login" ? "/signup" : "/login"} className="font-semibold text-[#243c35] underline underline-offset-4">{mode === "login" ? "Create an account" : "Sign in"}</Link></p>
      <p className="mt-8 text-center text-[10px] leading-5 text-stone-400">Sign-in is secured by verified email authentication. New accounts start as home seekers.</p>
    </div></section>
  </main>;
}
