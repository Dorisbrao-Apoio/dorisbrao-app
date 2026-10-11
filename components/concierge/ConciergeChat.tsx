"use client";

import Link from "next/link";
import { Component, type ErrorInfo, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Bot, MapPin, Send, Square, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { z } from "zod";

import { formatMoney } from "@/lib/utils";
import type { ListingMatch } from "@/lib/validation/search";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  listings?: ListingMatch[];
  streaming?: boolean;
};

const listingSchema = z.object({
  id: z.string(), slug: z.string(), title: z.string(), neighborhood: z.string(), city: z.string(), region: z.string(),
  kind: z.enum(["RENT", "SALE"]), currency: z.string(), priceCents: z.string(), bedrooms: z.number(), bathrooms: z.number(),
  squareFeet: z.number().nullable(), latitude: z.number(), longitude: z.number(), imageUrl: z.string().nullable(), similarity: z.number(),
});
const streamEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("meta"), conversationId: z.string(), listings: z.array(listingSchema) }),
  z.object({ type: z.literal("text-delta"), delta: z.string() }),
  z.object({ type: z.literal("done") }),
  z.object({ type: z.literal("error"), message: z.string() }),
]);

class ChatErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo): void { console.error("Concierge rendering failed", error, info); }
  render(): ReactNode {
    return this.state.failed
      ? <div role="alert" className="rounded-xl border border-destructive p-4 text-sm">The concierge could not be displayed. Refresh the page to try again.</div>
      : this.props.children;
  }
}

function PropertyCard({ listing }: { listing: ListingMatch }): ReactNode {
  return <Link href={`/listings/${listing.slug}`} className="mt-3 block rounded-xl border border-border bg-background p-3 transition hover:border-primary" aria-label={`View ${listing.title}`}>
    <div className="flex items-start justify-between gap-3">
      <div><p className="font-medium text-foreground">{listing.title}</p><p className="text-xs text-muted-foreground">{listing.bedrooms} bed · {listing.bathrooms} bath · {formatMoney(listing.priceCents, listing.currency)}</p></div>
      <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{Math.round(listing.similarity * 100)}% match</span>
    </div>
    <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{listing.neighborhood}, {listing.city}</p>
  </Link>;
}

function ConciergeChatContent(): ReactNode {
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem("dorisbrao-concierge");
      if (!saved) return;
      const result = z.object({ conversationId: z.string().optional(), messages: z.array(z.object({ id: z.string(), role: z.enum(["user", "assistant"]), content: z.string(), listings: z.array(listingSchema).optional() })) }).safeParse(JSON.parse(saved));
      if (result.success) { setConversationId(result.data.conversationId); setMessages(result.data.messages); }
    } catch { window.sessionStorage.removeItem("dorisbrao-concierge"); }
  }, []);
  useEffect(() => {
    window.sessionStorage.setItem("dorisbrao-concierge", JSON.stringify({ conversationId, messages: messages.map(({ streaming, ...message }) => message) }));
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversationId, messages]);

  const sendMutation = useMutation({
    mutationFn: async (message: string) => {
      const controller = new AbortController();
      abortRef.current = controller;
      const response = await fetch("/api/chat/conversation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, conversationId }), signal: controller.signal });
      if (!response.ok || !response.body) throw new Error((await response.json().catch(() => null))?.error ?? "The concierge is unavailable.");
      return response.body;
    },
    onError: (error) => setMessages((current) => current.map((message) => message.streaming ? { ...message, streaming: false, content: error instanceof Error ? error.message : "The concierge is unavailable." } : message)),
  });

  const submit = useCallback(async () => {
    const message = input.trim();
    if (!message || sendMutation.isPending) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: message };
    const assistantId = crypto.randomUUID();
    setMessages((current) => [...current, userMessage, { id: assistantId, role: "assistant", content: "", streaming: true }]);
    setInput("");
    try {
      const stream = await sendMutation.mutateAsync(message);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let buffered = "";
      while (true) {
        const { done, value } = await reader.read();
        buffered += decoder.decode(value, { stream: !done });
        const lines = buffered.split("\n"); buffered = lines.pop() ?? "";
        for (const line of lines) {
          if (!line) continue;
          const event = streamEventSchema.safeParse(JSON.parse(line) as unknown);
          if (!event.success) continue;
          if (event.data.type === "meta") {
            const { conversationId: nextConversationId, listings } = event.data;
            setConversationId(nextConversationId);
            setMessages((current) => current.map((item) => item.id === assistantId ? { ...item, listings } : item));
          }
          if (event.data.type === "text-delta") {
            const { delta } = event.data;
            setMessages((current) => current.map((item) => item.id === assistantId ? { ...item, content: item.content + delta } : item));
          }
          if (event.data.type === "error") throw new Error(event.data.message);
        }
        if (done) break;
      }
      setMessages((current) => current.map((item) => item.id === assistantId ? { ...item, streaming: false } : item));
    } catch (error) {
      const stopped = (error as DOMException).name === "AbortError";
      setMessages((current) => current.map((item) => item.id === assistantId
        ? { ...item, streaming: false, content: item.content || (stopped ? "Response stopped." : "The concierge is unavailable. Please try again.") }
        : item));
    } finally { abortRef.current = null; }
  }, [input, sendMutation]);

  return <section className="fixed inset-x-4 bottom-4 z-50 flex h-[min(42rem,calc(100dvh-2rem))] max-w-xl flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl md:left-auto md:w-[30rem]" aria-label="Real estate concierge">
    <header className="flex items-center gap-3 border-b p-4"><Bot className="size-5 text-primary" /><div><h2 className="font-semibold">Property concierge</h2><p className="text-xs text-muted-foreground">Ask in natural language. Results are semantic matches.</p></div></header>
    <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
      {messages.length === 0 && <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">Try: “quiet 3-bedroom near good schools under $4,500/month with a modern kitchen.”</p>}
      {messages.map((message) => <div key={message.id} className={`flex gap-2 ${message.role === "user" ? "justify-end" : ""}`}>
        {message.role === "assistant" && <Bot className="mt-1 size-4 shrink-0 text-primary" />}
        <div className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
          {message.role === "assistant" ? <ReactMarkdown skipHtml>{message.content || "Searching active listings…"}</ReactMarkdown> : message.content}
          {message.listings?.map((listing) => <PropertyCard key={listing.id} listing={listing} />)}
          {message.streaming && <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-primary align-middle" />}
        </div>
        {message.role === "user" && <User className="mt-1 size-4 shrink-0 text-primary" />}
      </div>)}
      <div ref={bottomRef} />
    </div>
    <form className="flex gap-2 border-t p-3" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
      <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void submit(); } }} maxLength={1000} rows={1} aria-label="Ask the concierge" placeholder="Describe your ideal home…" className="min-h-10 flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
      {sendMutation.isPending ? <button type="button" onClick={() => abortRef.current?.abort()} className="rounded-lg border px-3" aria-label="Stop response"><Square className="size-4" /></button> : <button type="submit" disabled={!input.trim()} className="rounded-lg bg-primary px-3 text-primary-foreground disabled:opacity-50" aria-label="Send message"><Send className="size-4" /></button>}
    </form>
  </section>;
}

export default function ConciergeChat(): ReactNode { return <ChatErrorBoundary><ConciergeChatContent /></ChatErrorBoundary>; }
