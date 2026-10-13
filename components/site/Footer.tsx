import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Footer(): JSX.Element {
  return <footer className="bg-[#213830] text-white">
    <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.3fr_.7fr_.7fr_.9fr] lg:px-12 lg:py-20">
      <div>
        <Link href="/" className="font-serif text-3xl tracking-tight">Dorisbrao <span className="font-sans text-[10px] font-semibold uppercase tracking-[.24em] text-white/55">real estate</span></Link>
        <p className="mt-5 max-w-xs text-sm leading-6 text-white/60">A better way to find where life happens. Local knowledge, thoughtful service, and homes with a sense of place in Angola.</p>
        <address className="mt-5 not-italic text-sm leading-6 text-white/70">
          Rua Marien N'Gouabi 187, Edifício Baía de Luanda, 8.º Andar<br />
          Ingombota, Luanda, Angola
        </address>
      </div>
      <div><p className="mb-4 text-[10px] font-semibold uppercase tracking-[.2em] text-white/45">Explore</p><div className="grid gap-3 text-sm text-white/75"><Link href="/search">Homes for sale</Link><Link href="/search?category=RENT">Homes for rent</Link><a href="/#neighborhoods">Neighborhoods</a></div></div>
      <div><p className="mb-4 text-[10px] font-semibold uppercase tracking-[.2em] text-white/45">Dorisbrao</p><div className="grid gap-3 text-sm text-white/75"><Link href="/dashboard">Agent workspace</Link><Link href="/signup?role=AGENT">Join our team</Link><a href="mailto:hello@dorisbrao.com">Contact us</a></div></div>
      <div><p className="mb-4 text-[10px] font-semibold uppercase tracking-[.2em] text-white/45">A good place to begin</p><p className="text-sm leading-6 text-white/70">Tell us what home means to you. We’ll help you find it.</p><Link href="/search" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">Explore homes <ArrowUpRight className="size-4" /></Link></div>
    </div>
    <div className="border-t border-white/10"><div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-3 px-5 py-5 text-[11px] text-white/45 sm:px-8 md:flex-row lg:px-12"><span>© {new Date().getFullYear()} Dorisbrao Real Estate. All rights reserved.</span><span>Find a home. Build a life.</span></div></div>
  </footer>;
}
