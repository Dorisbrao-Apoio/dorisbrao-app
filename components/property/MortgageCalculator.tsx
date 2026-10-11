"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";

function currency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function MortgageCalculator({ price }: { price: number }): JSX.Element {
  const [homePrice, setHomePrice] = useState(price);
  const [downPercent, setDownPercent] = useState(20);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);
  const monthly = useMemo(() => {
    const principal = homePrice * (1 - downPercent / 100);
    const monthlyRate = rate / 100 / 12;
    const payments = years * 12;
    return monthlyRate === 0 ? principal / payments : principal * monthlyRate / (1 - (1 + monthlyRate) ** -payments);
  }, [homePrice, downPercent, rate, years]);

  return <section className="rounded-[22px] bg-[#f0eee8] p-6 sm:p-8" aria-labelledby="mortgage-heading">
    <div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-[#476557]"><Calculator className="size-5" /></span><div><p className="eyebrow">Plan with confidence</p><h2 id="mortgage-heading" className="mt-1 font-serif text-2xl text-[#243c35]">Monthly estimate</h2></div></div>
    <div className="mt-7 grid gap-4 sm:grid-cols-2">
      <label className="block"><span className="form-label">Home price</span><div className="relative"><span className="absolute left-3 top-3 text-sm text-stone-400">$</span><input type="number" min="0" step="10000" value={homePrice} onChange={(event) => setHomePrice(Math.max(0, Number(event.target.value)))} className="form-control pl-7" /></div></label>
      <label className="block"><span className="form-label">Down payment <span className="text-stone-400">{downPercent}%</span></span><input type="range" min="0" max="80" step="5" value={downPercent} onChange={(event) => setDownPercent(Number(event.target.value))} className="mt-4 w-full accent-[#476557]" /><span className="mt-1 block text-[10px] text-stone-500">{currency(homePrice * downPercent / 100)}</span></label>
      <label className="block"><span className="form-label">Interest rate</span><div className="relative"><input type="number" min="0" max="30" step="0.05" value={rate} onChange={(event) => setRate(Math.min(30, Math.max(0, Number(event.target.value))))} className="form-control pr-8" /><span className="absolute right-3 top-3 text-sm text-stone-400">%</span></div></label>
      <label className="block"><span className="form-label">Loan term</span><select value={years} onChange={(event) => setYears(Number(event.target.value))} className="form-control"><option value={15}>15 years</option><option value={20}>20 years</option><option value={30}>30 years</option></select></label>
    </div>
    <div className="mt-6 flex flex-col justify-between gap-1 rounded-2xl bg-[#243c35] p-5 text-white sm:flex-row sm:items-center"><div><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-white/55">Estimated principal + interest</p><p className="mt-1 text-[10px] text-white/55">Taxes, insurance, and HOA not included</p></div><p className="font-serif text-3xl">{currency(monthly)}<span className="ml-1 font-sans text-xs text-white/60">/ month</span></p></div>
  </section>;
}
