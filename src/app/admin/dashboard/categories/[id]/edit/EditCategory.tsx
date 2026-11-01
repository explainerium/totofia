"use client";

import { Panel } from "@/components/dashboard/Panel";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCategoryQuery } from "@/redux/api/categoryApi";
import { CategoryForm } from "../../_components/CategoryForm";

export function EditCategory({ id }: { id: string }) {
  const { data, isLoading, isError } = useGetCategoryQuery(id);

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;
  if (isError || !data) return <Panel>Category not found.</Panel>;
  // `key` remounts the form with fresh defaults after a save refetch of a different record.
  return <CategoryForm key={data.id} category={data} />;
}
