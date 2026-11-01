import { Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { PagesTable } from "./_components/PagesTable";

export const metadata = { title: "Pages" };

export default function PagesPage() {
  return (
    <>
      <PageHeader
        title="Pages"
        description="About, policies, FAQ and other content pages. Each page is served at /<slug> (Bangla) and /en/<slug>."
        actions={
          <Button asChild>
            <Link href="/admin/dashboard/pages/new">
              <Plus /> New page
            </Link>
          </Button>
        }
      />
      <PagesTable />
    </>
  );
}
