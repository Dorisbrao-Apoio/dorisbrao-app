import { PropertyRoute } from "@/components/property/PropertyRoute";

export default function ListingDetailPage({ params }: { params: { slug: string } }): JSX.Element {
  return <PropertyRoute slug={params.slug} />;
}
