import { CreditCard } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { SettingsView } from "./_components/SettingsView";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Store information shown to customers, checkout rules and integrations."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/dashboard/settings/payments">
              <CreditCard /> Payment gateways
            </Link>
          </Button>
        }
      />
      <SettingsView />
    </>
  );
}
