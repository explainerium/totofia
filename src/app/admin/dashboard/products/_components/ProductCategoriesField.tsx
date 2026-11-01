"use client";

import Link from "next/link";
import { flattenCategories } from "@/components/dashboard/category-tree";
import { CheckboxList } from "@/components/form/ProCheckbox";
import { FieldShell } from "@/components/form/FieldShell";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCategoriesQuery } from "@/redux/api/categoryApi";

/** Category tree as checkboxes. The first checked category is used for breadcrumbs. */
export function ProductCategoriesField() {
  const { data, isLoading } = useGetCategoriesQuery();

  if (isLoading) return <Skeleton className="h-32 w-full" />;
  if (!data?.length) {
    return (
      <p className="text-body-sm text-on-surface-variant">
        No categories yet.{" "}
        <Link href="/admin/dashboard/categories/new" className="text-primary underline">
          Create one
        </Link>
      </p>
    );
  }

  return (
    <FieldShell name="categoryIds">
      <CheckboxList
        name="categoryIds"
        options={flattenCategories(data).map((c) => ({
          value: c.id,
          depth: c.depth,
          label: c.translations.en?.name ?? c.slug,
        }))}
      />
    </FieldShell>
  );
}
