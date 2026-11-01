import { PageHeader } from "@/components/dashboard/PageHeader";
import { ProductForm } from "../_components/ProductForm";

export const metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <>
      <PageHeader title="New product" backHref="/admin/dashboard/products" />
      <ProductForm />
    </>
  );
}
