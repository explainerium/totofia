import type { z } from "zod";
import type { productInput } from "@/server/modules/product/product.schema";
import type { AdminProduct } from "@/server/modules/product/product.service";

export type ProductFormValues = z.input<typeof productInput>;
export type VariantFormValues = ProductFormValues["variants"] extends (infer V)[] | undefined
  ? V
  : never;

/** `<input type="datetime-local">` value in the browser's time zone. */
export function toLocalInput(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function emptyVariant(): VariantFormValues {
  return {
    sku: "",
    price: 0,
    salePrice: null,
    saleStartsAt: null,
    saleEndsAt: null,
    stock: 0,
    weightGrams: null,
    isActive: true,
    attributeValueIds: [],
  };
}

export function toFormValues(product?: AdminProduct): ProductFormValues {
  const t = (l: "bn" | "en") => ({ ...emptyTranslation, ...product?.translations[l] });
  return {
    status: product?.status ?? "DRAFT",
    slug: product?.slug ?? "",
    ageMinMonths: product?.ageMinMonths ?? null,
    ageMaxMonths: product?.ageMaxMonths ?? null,
    isFeatured: product?.isFeatured ?? false,
    badges: product?.badges ?? [],
    categoryIds: product?.categoryIds ?? [],
    images: product?.images.map(({ assetId, altBn, altEn }) => ({ assetId, altBn, altEn })) ?? [],
    translations: { bn: t("bn"), en: t("en") },
    variants: product?.variants.map((v) => ({
      ...v,
      stockBase: v.stock,
      saleStartsAt: toLocalInput(v.saleStartsAt),
      saleEndsAt: toLocalInput(v.saleEndsAt),
    })) ?? [emptyVariant()],
  };
}

const emptyTranslation = {
  name: "",
  shortDescription: "",
  description: "",
  materialCare: "",
  metaTitle: "",
  metaDescription: "",
};
