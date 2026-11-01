"use client";

import { useRouter } from "next/navigation";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { Panel } from "@/components/dashboard/Panel";
import { ProForm } from "@/components/form/ProForm";
import { ProSubmit } from "@/components/form/ProSubmit";
import { useCreateProductMutation, useUpdateProductMutation } from "@/redux/api/productApi";
import { productInput, type ProductInput } from "@/server/modules/product/product.schema";
import type { AdminProduct } from "@/server/modules/product/product.service";
import { ProductCategoriesField } from "./ProductCategoriesField";
import { ProductContentPanel } from "./ProductContentPanel";
import { ProductImagesField } from "./ProductImagesField";
import { ProductSettingsPanel } from "./ProductSettingsPanel";
import { ProductVariantsField } from "./ProductVariantsField";
import { toFormValues, type ProductFormValues } from "./product-form-values";

export function ProductForm({ product }: { product?: AdminProduct }) {
  const router = useRouter();
  const [create] = useCreateProductMutation();
  const [update] = useUpdateProductMutation();

  async function onSubmit(
    values: ProductInput,
    form: UseFormReturn<ProductFormValues, unknown, ProductInput>,
  ) {
    if (product) {
      const saved = await update({ id: product.id, data: values }).unwrap();
      // New variant ids and the live stock come back; without them the next save would
      // re-create those variants and re-apply the stock change.
      form.reset(toFormValues(saved));
      toast.success("Product saved.");
    } else {
      const created = await create(values).unwrap();
      toast.success("Product created.");
      router.replace(`/admin/dashboard/products/${created.id}/edit`);
    }
  }

  return (
    <ProForm schema={productInput} defaultValues={toFormValues(product)} onSubmit={onSubmit}>
      <div className="grid gap-space-lg xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-space-lg">
          <ProductContentPanel />
          <Panel
            title="Images"
            description="The first image is the main image on cards and the product page."
          >
            <ProductImagesField initial={product?.images ?? []} />
          </Panel>
          <ProductVariantsField />
        </div>
        <div className="space-y-space-lg">
          <ProductSettingsPanel isEdit={Boolean(product)} />
          <Panel title="Categories">
            <ProductCategoriesField />
          </Panel>
          <ProSubmit className="w-full" size="lg">
            {product ? "Save changes" : "Create product"}
          </ProSubmit>
        </div>
      </div>
    </ProForm>
  );
}
