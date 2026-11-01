import { PageHeader } from "@/components/dashboard/PageHeader";
import { BannersManager } from "./_components/BannersManager";

export const metadata = { title: "Banners" };

export default function BannersPage() {
  return (
    <>
      <PageHeader
        title="Banners"
        description="Home page banners. A live Hero banner replaces the default hero; Promo banners show as a strip below the featured products."
      />
      <BannersManager />
    </>
  );
}
