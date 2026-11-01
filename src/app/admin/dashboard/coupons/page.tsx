import { PageHeader } from "@/components/dashboard/PageHeader";
import { CouponsManager } from "./_components/CouponsManager";

export const metadata = { title: "Coupons" };

export default function CouponsPage() {
  return (
    <>
      <PageHeader
        title="Coupons"
        description="Discount codes customers enter in the bag. Codes are case-insensitive."
      />
      <CouponsManager />
    </>
  );
}
