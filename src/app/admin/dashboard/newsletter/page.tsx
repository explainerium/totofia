import { Download } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { SubscribersTable } from "./_components/SubscribersTable";

export const metadata = { title: "Newsletter" };

export default function NewsletterPage() {
  return (
    <>
      <PageHeader
        title="Newsletter"
        description="Email addresses from the home page sign-up form. Export them for your email tool."
        actions={
          <Button variant="outline" asChild>
            <a href="/api/v1/admin/newsletter/export" download>
              <Download /> Export CSV
            </a>
          </Button>
        }
      />
      <SubscribersTable />
    </>
  );
}
