import { SearchResults } from "@/components/search/SearchResults";

type SearchParams = Record<string, string | string[] | undefined>;

export default function SearchPage({ searchParams }: { searchParams: SearchParams }): JSX.Element {
  const scalar = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";
  return <SearchResults initialFilters={{
    location: scalar(searchParams.location),
    category: scalar(searchParams.category),
    beds: scalar(searchParams.beds),
    baths: scalar(searchParams.baths),
    maxPrice: scalar(searchParams.maxPrice),
    savedOnly: scalar(searchParams.saved) === "1",
  }} />;
}
