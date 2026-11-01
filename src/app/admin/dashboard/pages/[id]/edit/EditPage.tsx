"use client";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPageQuery } from "@/redux/api/contentApi";
import { PageForm } from "../../_components/PageForm";

export function EditPage({ id }: { id: string }) {
  const { data: page, isError } = useGetPageQuery(id);
  if (isError) return <p>Page not found.</p>;
  if (!page) return <Skeleton className="h-96 w-full" />;

  return (
    <>
      <PageHeader
        backHref="/admin/dashboard/pages"
        title={`Edit “${page.translations.en.title}”`}
      />
      {/* key: remount the form when a different page loads */}
      <PageForm key={page.id} page={page} />
    </>
  );
}
