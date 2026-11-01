import { CustomerDetail } from "./CustomerDetail";

export const metadata = { title: "Customer" };

export default async function CustomerPage({
  params,
}: PageProps<"/admin/dashboard/customers/[id]">) {
  const { id } = await params;
  return <CustomerDetail id={id} />;
}
