import { PageHeader } from "@/components/dashboard/PageHeader";
import { DashboardOverview } from "./_components/DashboardOverview";

export const metadata = { title: "Dashboard" };

export default function OverviewPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Sales exclude cancelled and returned orders. Days follow Dhaka time."
      />
      <DashboardOverview />
    </>
  );
}
