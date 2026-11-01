import { PageHeader } from "@/components/dashboard/PageHeader";
import { EditProduct } from "./EditProduct";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({
  params,
}: PageProps<"/admin/dashboard/products/[id]/edit">) {
  const { id } = await params;
  return (
    <>
      <PageHeader title="Edit product" backHref="/admin/dashboard/products" />
      <EditProduct id={id} />
    </>
  );
}
