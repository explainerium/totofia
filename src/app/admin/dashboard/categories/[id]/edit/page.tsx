import { PageHeader } from "@/components/dashboard/PageHeader";
import { EditCategory } from "./EditCategory";

export const metadata = { title: "Edit category" };

export default async function EditCategoryPage({
  params,
}: PageProps<"/admin/dashboard/categories/[id]/edit">) {
  const { id } = await params;
  return (
    <>
      <PageHeader title="Edit category" backHref="/admin/dashboard/categories" />
      <EditCategory id={id} />
    </>
  );
}
