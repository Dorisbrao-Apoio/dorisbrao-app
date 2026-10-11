import { redirect } from "next/navigation";

export default function LegacyAdminListingsPage(): never {
  redirect("/dashboard");
}
