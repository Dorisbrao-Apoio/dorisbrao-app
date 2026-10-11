import type { Metadata } from "next";
import type { ReactNode } from "react";

import { QueryProvider } from "@/components/providers/QueryProvider";
import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";

import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";

export const metadata: Metadata = { title: "Dorisbrao Real Estate — Find a place to feel at home", description: "Discover homes in Angola with local insight and a simpler way to search." };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>): ReactNode {
  return <html lang="en"><body><QueryProvider><Navbar />{children}<Footer /></QueryProvider></body></html>;
}
