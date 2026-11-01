import { PageHeader } from "@/components/dashboard/PageHeader";
import { ManualOrderForm } from "./_components/ManualOrderForm";

export const metadata = { title: "New order" };

export default function NewOrderPage() {
  return (
    <>
      <PageHeader
        backHref="/admin/dashboard/orders"
        title="New phone order"
        description="Same rules as the web checkout: stock is reserved, coupons are checked, the customer is emailed. An existing account with the same phone or email is linked automatically."
      />
      <ManualOrderForm />
    </>
  );
}
