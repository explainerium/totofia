import { Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { CategoriesTable } from "./_components/CategoriesTable";

export const metadata = { title: "Categories" };

export default function CategoriesPage() {
  return (
    <>
      <PageHeader
        title="Categories"
        description="Category tree shown in the store navigation. Names are needed in both languages."
        actions={
          <Button asChild>
            <Link href="/admin/dashboard/categories/new">
              <Plus /> New category
            </Link>
          </Button>
        }
      />
      <CategoriesTable />
    </>
  );
}
