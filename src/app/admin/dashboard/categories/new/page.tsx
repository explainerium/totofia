import { PageHeader } from "@/components/dashboard/PageHeader";
import { CategoryForm } from "../_components/CategoryForm";

export const metadata = { title: "New category" };

export default function NewCategoryPage() {
  return (
    <>
      <PageHeader title="New category" backHref="/admin/dashboard/categories" />
      <CategoryForm />
    </>
  );
}
