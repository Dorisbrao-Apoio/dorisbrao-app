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
