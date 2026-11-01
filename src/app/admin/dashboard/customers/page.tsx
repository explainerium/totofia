import { PageHeader } from "@/components/dashboard/PageHeader";
import { CustomersTable } from "./_components/CustomersTable";

export const metadata = { title: "Customers" };

export default function CustomersPage() {
  return (
    <>
      <PageHeader
        title="Customers"
        description="Registered accounts. Guest orders are not listed here — find them under Orders."
      />
      <CustomersTable />
    </>
  );
}
