import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: { background: "hsl(var(--background))", foreground: "hsl(var(--foreground))", card: "hsl(var(--card))", muted: "hsl(var(--muted))", "muted-foreground": "hsl(var(--muted-foreground))", border: "hsl(var(--border))", primary: "hsl(var(--primary))", "primary-foreground": "hsl(var(--primary-foreground))", ring: "hsl(var(--ring))", destructive: "hsl(var(--destructive))" } } },
  plugins: [],
} satisfies Config;
