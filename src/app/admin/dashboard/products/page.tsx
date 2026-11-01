import { Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { ProductsTable } from "./_components/ProductsTable";

export const metadata = { title: "Products" };

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Products"
        actions={
          <Button asChild>
            <Link href="/admin/dashboard/products/new">
              <Plus /> New product
            </Link>
          </Button>
        }
      />
      <ProductsTable />
    </>
  );
}
