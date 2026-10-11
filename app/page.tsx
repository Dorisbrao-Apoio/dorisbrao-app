import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check, Quote } from "lucide-react";

import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { SearchBar } from "@/components/search/SearchBar";
import ConciergeChat from "@/components/concierge/ConciergeChat";

const neighborhoods = [
  { name: "Talatona", note: "Room to grow, space to breathe", image: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80", count: "24 homes" },
  { name: "Ilha do Cabo", note: "Coastal living, city close by", image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80", count: "18 homes" },
  { name: "Miramar", note: "A leafy pause above the bay", image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80", count: "16 homes" },
];

export default function HomePage(): JSX.Element {
  return <main>
    <section className="relative min-h-[650px] overflow-hidden bg-[#243c35] sm:min-h-[700px]">
      <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2400&q=90" alt="Light-filled modern home opening onto a garden" className="absolute inset-0 size-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#15241f]/80 via-[#182822]/45 to-[#15241f]/10" />
      <div className="relative mx-auto flex min-h-[650px] max-w-[1440px] flex-col justify-center px-5 pb-20 pt-20 sm:min-h-[700px] sm:px-8 lg:px-12">
        <p className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.25em] text-white/75"><span className="h-px w-8 bg-white/65" />A more considered way home</p>
        <h1 className="max-w-[720px] font-serif text-[clamp(3.6rem,8vw,7.5rem)] leading-[.92] tracking-[-.055em] text-white">Find a place<br />to <em className="font-normal">feel at home.</em></h1>
        <p className="mt-7 max-w-md text-base leading-7 text-white/75 sm:text-lg">Thoughtfully chosen homes, and the local perspective to help you choose yours.</p>
        <div className="mt-10 max-w-[980px]"><SearchBar variant="glass" /></div>
        <a href="#featured" className="absolute bottom-8 left-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.18em] text-white/60 sm:left-8 lg:left-12"><span className="grid size-9 place-items-center rounded-full border border-white/30"><ArrowDown className="size-4" /></span>Explore the collection</a>
        <div className="absolute bottom-10 right-5 hidden items-center gap-4 text-right text-white/75 md:flex"><span className="text-[10px] uppercase tracking-[.16em]">Locally rooted<br />Luanda, Angola</span><span className="h-px w-12 bg-white/50" /></div>
      </div>
    </section>

    <section id="featured" className="bg-[#f7f6f2] py-20 sm:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="mb-10 flex items-end justify-between gap-6"><div><p className="eyebrow">A few places we love</p><h2 className="section-title mt-3">Homes with a <em>sense of place.</em></h2></div><Link href="/search" className="hidden items-center gap-2 pb-1 text-xs font-semibold text-[#243c35] sm:inline-flex">View all homes <ArrowUpRight className="size-4" /></Link></div>
        <FeaturedCarousel />
        <Link href="/search" className="mt-7 inline-flex items-center gap-2 text-xs font-semibold text-[#243c35] sm:hidden">View all homes <ArrowUpRight className="size-4" /></Link>
      </div>
    </section>

    <section id="neighborhoods" className="bg-[#f0eee8] py-20 sm:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="mb-10 grid gap-5 md:grid-cols-[1fr_.6fr] md:items-end"><div><p className="eyebrow">More than an address</p><h2 className="section-title mt-3">Get to know your <em>next neighborhood.</em></h2></div><p className="max-w-sm text-sm leading-6 text-stone-500 md:justify-self-end">The right home starts with the right feeling. Explore the pockets of the city that make everyday life a little more meaningful.</p></div>
        <div className="grid gap-4 md:grid-cols-3">{neighborhoods.map((place, index) => <Link key={place.name} href={`/search?location=${encodeURIComponent(place.name)}`} className={`group relative min-h-[360px] overflow-hidden rounded-[22px] ${index === 1 ? "md:mt-10" : ""}`}><img src={place.image} alt={`${place.name} neighborhood`} className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" /><div className="absolute inset-0 bg-gradient-to-t from-[#15241f]/75 via-transparent to-black/10" /><span className="absolute right-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[.12em] text-[#243c35]">{place.count}</span><div className="absolute inset-x-6 bottom-6 text-white"><p className="text-xs text-white/70">{place.note}</p><h3 className="mt-1 font-serif text-3xl">{place.name}</h3><span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold">Explore the neighborhood <ArrowUpRight className="size-4 transition group-hover:translate-x-1 group-hover:-translate-y-1" /></span></div></Link>)}</div>
      </div>
    </section>

    <section className="bg-[#faf9f6] py-20 sm:py-28"><div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-8 md:grid-cols-[.9fr_1.1fr] md:items-center lg:px-12"><div className="relative min-h-[390px] overflow-hidden rounded-[22px] bg-stone-200"><img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85" alt="Warm, inviting living room" className="absolute inset-0 size-full object-cover" /><div className="absolute bottom-5 left-5 rounded-2xl bg-[#f7f6f2] p-5"><p className="font-serif text-3xl text-[#243c35]">4.9<span className="ml-1 text-base">/ 5</span></p><p className="mt-1 text-[9px] font-semibold uppercase tracking-[.16em] text-stone-500">Client experience</p></div></div><div className="md:pl-8"><p className="eyebrow">The Dorisbrao difference</p><h2 className="section-title mt-3">A little more <em>human.</em></h2><div className="mt-8 flex gap-4"><Quote className="mt-1 size-7 shrink-0 text-[#ad775d]" /><blockquote className="font-serif text-[25px] leading-[1.42] text-[#243c35] sm:text-[31px]">“They listened before they showed us anything. That changed the whole experience.”<footer className="mt-5 font-sans text-xs font-medium text-stone-500">— Maya & James, first-time buyers</footer></blockquote></div><div className="mt-9 grid gap-4 border-t border-stone-200 pt-6 sm:grid-cols-2">{["Advice shaped around you", "Deep neighborhood knowledge", "A thoughtful pace", "Here when you need us"].map((item) => <p key={item} className="flex items-center gap-2.5 text-xs text-stone-600"><span className="grid size-5 place-items-center rounded-full bg-[#e4e9e4] text-[#476557]"><Check className="size-3" /></span>{item}</p>)}</div></div></div></section>

    <section className="bg-[#f0eee8] py-16 sm:py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12"><div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="eyebrow">Kind words, real people</p><h2 className="section-title mt-3">Good moves, <em>good people.</em></h2></div><p className="max-w-xs text-xs leading-5 text-stone-500">A few notes from people who found their next chapter with Dorisbrao.</p></div><div className="grid gap-4 md:grid-cols-3">{[
      { quote: "From the first conversation, it felt like we had someone in our corner. We never felt rushed into a decision.", name: "Maya & James", detail: "Bought in Talatona" },
      { quote: "Our advisor knew the neighborhood block by block. We found the right home and felt at ease the whole way.", name: "Jordan Lee", detail: "Found a home on Ilha do Cabo" },
      { quote: "A thoughtful, clear process from start to finish. Selling our family home felt personal in the best way.", name: "Anika Patel", detail: "Sold in Miramar" },
    ].map((review) => <blockquote key={review.name} className="flex min-h-[220px] flex-col rounded-[20px] border border-stone-200/80 bg-[#faf9f6] p-6 sm:p-7"><Quote className="size-5 text-[#ad775d]" /><p className="mt-5 flex-1 font-serif text-[19px] leading-[1.45] text-[#243c35]">“{review.quote}”</p><footer className="mt-6 border-t border-stone-200 pt-4"><p className="text-xs font-semibold text-[#243c35]">{review.name}</p><p className="mt-1 text-[10px] text-stone-500">{review.detail}</p></footer></blockquote>)}</div></div></section>

    <section className="bg-[#dfe6df] px-5 py-16 sm:px-8 sm:py-20"><div className="mx-auto flex max-w-[1440px] flex-col gap-6 md:flex-row md:items-center md:justify-between lg:px-4"><div><p className="eyebrow">Your next chapter starts here</p><h2 className="mt-3 font-serif text-4xl tracking-tight text-[#243c35] sm:text-5xl">Let’s find your <em>place.</em></h2></div><Link href="/search" className="inline-flex w-fit items-center gap-3 rounded-full bg-[#243c35] px-6 py-4 text-xs font-semibold text-white transition hover:bg-[#35564c]">Explore available homes <ArrowUpRight className="size-4" /></Link></div></section>
    <ConciergeChat />
  </main>;
}
