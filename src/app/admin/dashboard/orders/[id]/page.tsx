import { OrderDetail } from "./OrderDetail";

export const metadata = { title: "Order" };

export default async function OrderPage({ params }: PageProps<"/admin/dashboard/orders/[id]">) {
  const { id } = await params;
  return <OrderDetail id={id} />;
}
