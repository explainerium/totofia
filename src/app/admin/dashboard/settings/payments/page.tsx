import { PageHeader } from "@/components/dashboard/PageHeader";
import { GatewaysManager } from "./_components/GatewaysManager";

export const metadata = { title: "Payment gateways" };

export default function PaymentGatewaysPage() {
  return (
    <>
      <PageHeader
        backHref="/admin/dashboard/settings"
        title="Payment gateways"
        description="Online payment (bKash, Nagad, Rocket, cards) through SSLCommerz and aamarPay. Credentials are stored encrypted; switch from sandbox to live here without a deploy."
      />
      <GatewaysManager />
    </>
  );
}
