import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrdersTable } from "./_components/OrdersTable";

export const metadata = { title: "Orders" };

export default function OrdersPage() {
  return (
    <>
      <PageHeader
        title="Orders"
        description="Web and phone orders. Open an order to confirm, ship, deliver or cancel it."
        actions={
          <Button asChild>
            <Link href="/admin/dashboard/orders/new">
              <Plus /> New order
            </Link>
          </Button>
        }
      />
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <OrdersTable />
      </Suspense>
    </>
  );
}
