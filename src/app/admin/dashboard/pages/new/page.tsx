import { PageHeader } from "@/components/dashboard/PageHeader";
import { PageForm } from "../_components/PageForm";

export const metadata = { title: "New page" };

export default function NewPagePage() {
  return (
    <>
      <PageHeader backHref="/admin/dashboard/pages" title="New page" />
      <PageForm />
    </>
  );
}
