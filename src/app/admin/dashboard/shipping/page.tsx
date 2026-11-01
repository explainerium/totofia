import { PageHeader } from "@/components/dashboard/PageHeader";
import { ZonesManager } from "./_components/ZonesManager";

export const metadata = { title: "Shipping zones" };

export default function ShippingPage() {
  return (
    <>
      <PageHeader
        title="Shipping zones"
        description="Delivery fee by district. Districts not listed in any zone use the default zone."
      />
      <ZonesManager />
    </>
  );
}
