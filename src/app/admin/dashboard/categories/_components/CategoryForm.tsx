"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { descendantIds, flattenCategories } from "@/components/dashboard/category-tree";
import { LanguageTabs } from "@/components/dashboard/LanguageTabs";
import { Panel } from "@/components/dashboard/Panel";
import { ProForm } from "@/components/form/ProForm";
import { ProInput } from "@/components/form/ProInput";
import { ProSelect } from "@/components/form/ProSelect";
import { ProSubmit } from "@/components/form/ProSubmit";
import { ProSwitch } from "@/components/form/ProSwitch";
import { ProTextarea } from "@/components/form/ProTextarea";
import {
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from "@/redux/api/categoryApi";
import { categoryInput, type CategoryInput } from "@/server/modules/category/category.schema";
import type { AdminCategory } from "@/server/modules/category/category.service";
import { SingleImageField } from "../../_components/SingleImageField";
import { SlugField } from "../../_components/SlugField";

function toDefaults(category?: AdminCategory) {
  const t = (l: "bn" | "en") => ({
    name: category?.translations[l]?.name ?? "",
    description: category?.translations[l]?.description ?? "",
    metaTitle: category?.translations[l]?.metaTitle ?? "",
    metaDescription: category?.translations[l]?.metaDescription ?? "",
  });
  return {
    slug: category?.slug ?? "",
    parentId: category?.parentId ?? null,
    imageId: category?.imageId ?? null,
    sortOrder: category?.sortOrder ?? 0,
    isHidden: category?.isHidden ?? false,
    translations: { bn: t("bn"), en: t("en") },
  };
}

export function CategoryForm({ category }: { category?: AdminCategory }) {
  const router = useRouter();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [create] = useCreateCategoryMutation();
  const [update] = useUpdateCategoryMutation();

  const excluded = category ? descendantIds(categories, category.id) : new Set<string>();
  const parentOptions = flattenCategories(categories)
    .filter((c) => !excluded.has(c.id))
    .map((c) => ({ value: c.id, label: `${"— ".repeat(c.depth)}${c.translations.en?.name}` }));

  async function onSubmit(values: CategoryInput) {
    if (category) {
      await update({ id: category.id, data: values }).unwrap();
      toast.success("Category saved.");
    } else {
      const created = await create(values).unwrap();
      toast.success("Category created.");
      router.replace(`/admin/dashboard/categories/${created.id}/edit`);
    }
  }

  return (
    <ProForm schema={categoryInput} defaultValues={toDefaults(category)} onSubmit={onSubmit}>
      <div className="grid gap-space-lg lg:grid-cols-[1fr_320px]">
        <Panel title="Content">
          <LanguageTabs prefix="translations">
            {(l) => (
              <>
                <ProInput name={`translations.${l}.name`} label="Name" />
                <ProTextarea name={`translations.${l}.description`} label="Description" rows={3} />
                <ProInput name={`translations.${l}.metaTitle`} label="SEO title" />
                <ProTextarea
                  name={`translations.${l}.metaDescription`}
                  label="SEO description"
                  rows={2}
                />
              </>
            )}
          </LanguageTabs>
        </Panel>
        <div className="space-y-space-lg">
          <Panel title="Settings">
            <SlugField sourceName="translations.en.name" locked={Boolean(category)} />
            <ProSelect
              name="parentId"
              label="Parent category"
              options={parentOptions}
              nullableLabel="None (top level)"
            />
            <ProInput name="sortOrder" label="Sort order" numeric="number" min={0} />
            <ProSwitch
              name="isHidden"
              label="Hidden"
              description="Hide from the store navigation."
            />
          </Panel>
          <Panel title="Image">
            <SingleImageField name="imageId" initialUrl={category?.image?.grid ?? null} />
          </Panel>
          <ProSubmit className="w-full" size="lg">
            {category ? "Save changes" : "Create category"}
          </ProSubmit>
        </div>
      </div>
    </ProForm>
  );
}
