import type { Agent, Property } from "@/lib/data/types";

// Fictional demo contacts and sample listings for the Luanda market.
export const agents: Agent[] = [
  { id: "agent-1", name: "Olivia Bennett", title: "Senior property advisor", phone: "+244 923 555 134", email: "olivia@dorisbrao.com", avatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=160&q=80" },
  { id: "agent-2", name: "Marcus Chen", title: "Luxury homes specialist", phone: "+244 923 555 187", email: "marcus@dorisbrao.com", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=160&q=80" },
  { id: "agent-3", name: "Sophia Rivera", title: "Neighborhood expert", phone: "+244 923 555 172", email: "sophia@dorisbrao.com", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80" },
];

export const seedProperties: Property[] = [
  {
    id: "home-1", slug: "talatona-garden-residence", title: "A quieter kind of city living", price: 485000,
    location: "Talatona, Luanda", neighborhood: "Talatona", city: "Luanda", beds: 4, baths: 3, sqft: 2860,
    images: ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85", "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=85", "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1800&q=85"],
    agentId: "agent-1", category: "SALE", status: "PUBLISHED", yearBuilt: 2018, hoaFee: 0, featured: true, latitude: -8.918, longitude: 13.181,
    amenities: ["Private garden", "Chef's kitchen", "Fireplace", "Garage"],
    description: "Set in the heart of Talatona, this thoughtfully finished residence balances generous living spaces with the ease of modern comfort. Natural light moves through the main rooms, while a landscaped garden offers a quiet retreat. A refined kitchen, considered finishes, and flexible space make the home feel both special and completely livable.",
  },
  {
    id: "home-2", slug: "ilha-do-cabo-waterfront-home", title: "Room to breathe by the water", price: 680000,
    location: "Ilha do Cabo, Luanda", neighborhood: "Ilha do Cabo", city: "Luanda", beds: 3, baths: 2, sqft: 2140,
    images: ["https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1800&q=85", "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=85"],
    agentId: "agent-2", category: "SALE", status: "PUBLISHED", yearBuilt: 2016, hoaFee: 0, featured: true, latitude: -8.793, longitude: 13.238,
    amenities: ["Ocean views", "Deck", "Updated kitchen", "Laundry"],
    description: "A welcoming home on Ilha do Cabo with beautifully proportioned rooms and an easy connection to the coast. Wide windows bring in the Atlantic light, while the refreshed kitchen and dining room make everyday moments feel effortless. Enjoy the waterfront and the energy of central Luanda close by.",
  },
  {
    id: "home-3", slug: "miramar-modern-home", title: "A modern home with a softer edge", price: 595000,
    location: "Miramar, Luanda", neighborhood: "Miramar", city: "Luanda", beds: 3, baths: 2.5, sqft: 1985,
    images: ["https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1800&q=85", "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1800&q=85"],
    agentId: "agent-3", category: "SALE", status: "PUBLISHED", yearBuilt: 2020, hoaFee: 0, featured: true, latitude: -8.817, longitude: 13.232,
    amenities: ["Open plan", "Patio", "Air conditioning", "Backup generator"],
    description: "Clean lines and natural materials give this Miramar home a calm, welcoming feel. The open living level flows to a private patio, and three comfortable bedrooms create room for work, rest, and gathering. Thoughtful storage and modern systems keep the design as practical as it is beautiful.",
  },
  {
    id: "home-4", slug: "alvalade-residence-for-rent", title: "The art of arriving home", price: 4500,
    location: "Alvalade, Luanda", neighborhood: "Alvalade", city: "Luanda", beds: 2, baths: 2, sqft: 1420,
    images: ["https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=1800&q=85", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85"],
    agentId: "agent-1", category: "RENT", status: "PUBLISHED", yearBuilt: 2019, hoaFee: 0, featured: true, latitude: -8.827, longitude: 13.235,
    amenities: ["Doorman", "Fitness room", "Balcony", "Pet friendly"],
    description: "A light-filled home in the heart of Alvalade, with considered interiors and the small luxuries that make a daily difference. The open kitchen anchors an airy living space, and a private balcony offers a moment outdoors. Building amenities include a fitness room and welcoming lobby.",
  },
  {
    id: "home-5", slug: "patriota-garden-house", title: "A garden hideaway in Patriota", price: 395000,
    location: "Patriota, Luanda", neighborhood: "Patriota", city: "Luanda", beds: 3, baths: 2, sqft: 1760,
    images: ["https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1800&q=85"],
    agentId: "agent-3", category: "SALE", status: "PUBLISHED", yearBuilt: 2012, hoaFee: 0, latitude: -8.930, longitude: 13.190,
    amenities: ["Garden", "Air conditioning", "Garage", "Office nook"],
    description: "A warm, well-kept home with a deep garden and a wonderful sense of privacy. Generous living spaces pair naturally with an updated kitchen and a flexible office nook. Enjoy room for outdoor living and a close-knit residential neighborhood.",
  },
  {
    id: "home-6", slug: "maianga-city-apartment", title: "A considered Maianga apartment", price: 2600,
    location: "Maianga, Luanda", neighborhood: "Maianga", city: "Luanda", beds: 2, baths: 2, sqft: 1280,
    images: ["https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=85"],
    agentId: "agent-2", category: "RENT", status: "PUBLISHED", yearBuilt: 2017, hoaFee: 0, latitude: -8.828, longitude: 13.236,
    amenities: ["In-unit laundry", "Stone counters", "Storage", "Backup generator"],
    description: "An inviting, well-appointed apartment in a location that makes the city feel close at hand. Wide windows bring in soft afternoon light, and a thoughtful floor plan separates bedrooms from the main living space. A polished kitchen and in-unit laundry complete the home.",
  },
  {
    id: "home-7", slug: "benfica-family-home", title: "Classic lines, contemporary comfort", price: 720000,
    location: "Benfica, Luanda", neighborhood: "Benfica", city: "Luanda", beds: 4, baths: 3.5, sqft: 3120,
    images: ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85"],
    agentId: "agent-1", category: "SALE", status: "PUBLISHED", yearBuilt: 2021, hoaFee: 0, latitude: -8.994, longitude: 13.170,
    amenities: ["Formal dining", "Garden", "Fireplace", "Two-car garage"],
    description: "Graceful proportions and carefully selected finishes define this family home in Benfica. A generous dining room sets the scene for long dinners, while the garden and family room make everyday life feel easy. Thoughtful details bring together a welcoming layout and modern comfort.",
  },
  {
    id: "home-8", slug: "ingombota-city-loft", title: "A loft made for the in-between", price: 1800,
    location: "Ingombota, Luanda", neighborhood: "Ingombota", city: "Luanda", beds: 1, baths: 1, sqft: 980,
    images: ["https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=85"],
    agentId: "agent-2", category: "RENT", status: "PUBLISHED", yearBuilt: 2015, hoaFee: 0, latitude: -8.818, longitude: 13.235,
    amenities: ["High ceilings", "Concierge", "Secure parking", "Pool"],
    description: "An airy Ingombota loft with high ceilings, generous windows, and a layout that adapts to the way you live. The building offers a calm arrival and concierge service. The waterfront, cafés, and downtown are close enough to make a car optional.",
  },
];

export function getAgent(agentId: string): Agent {
  return agents.find((agent) => agent.id === agentId) ?? agents[0]!;
}
