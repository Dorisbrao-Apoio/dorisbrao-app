import { seedProperties } from "@/lib/data/properties";
import type { DemoSession, Property, PropertyLead } from "@/lib/data/types";

const PROPERTY_KEY = "dorisbrao-properties-v1";
const LEAD_KEY = "dorisbrao-leads-v1";
const SESSION_KEY = "dorisbrao-demo-session-v1";
const SAVED_KEY = "dorisbrao-saved-v1";
export const SAVED_PROPERTIES_CHANGED = "dorisbrao:saved-properties-changed";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function readProperties(): Property[] {
  return readJson(PROPERTY_KEY, seedProperties);
}

export function writeProperties(properties: Property[]): void {
  window.localStorage.setItem(PROPERTY_KEY, JSON.stringify(properties));
}

export function readLeads(): PropertyLead[] {
  return readJson(LEAD_KEY, []);
}

export function saveLead(lead: Omit<PropertyLead, "id" | "createdAt">): void {
  const next: PropertyLead = { ...lead, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  window.localStorage.setItem(LEAD_KEY, JSON.stringify([next, ...readLeads()]));
}

export function readSession(): DemoSession | null {
  return readJson<DemoSession | null>(SESSION_KEY, null);
}

export function writeSession(session: DemoSession | null): void {
  if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else window.localStorage.removeItem(SESSION_KEY);
}

export function readSavedPropertyIds(): string[] {
  return readJson(SAVED_KEY, []);
}

export function toggleSavedProperty(id: string): string[] {
  const saved = readSavedPropertyIds();
  const next = saved.includes(id) ? saved.filter((savedId) => savedId !== id) : [...saved, id];
  window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(SAVED_PROPERTIES_CHANGED));
  return next;
}
