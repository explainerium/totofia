"use client";

import { ExternalLink } from "lucide-react";
import { Panel } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProductQuery } from "@/redux/api/productApi";
import { ProductForm } from "../../_components/ProductForm";

export function EditProduct({ id }: { id: string }) {
  const { data, isLoading, isError } = useGetProductQuery(id);

  if (isLoading) return <Skeleton className="h-[40rem] w-full rounded-2xl" />;
  if (isError || !data) return <Panel>Product not found.</Panel>;

  return (
    <div className="space-y-space-md">
      {data.status === "PUBLISHED" ? (
        <div className="flex gap-space-sm">
          <Button variant="outline" size="sm" asChild>
            <a href={`/product/${data.slug}`} target="_blank" rel="noreferrer">
              View in store (বাংলা) <ExternalLink />
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`/en/product/${data.slug}`} target="_blank" rel="noreferrer">
              View in store (English) <ExternalLink />
            </a>
          </Button>
        </div>
      ) : null}
      {/* `key` remounts the form with fresh defaults for another product. */}
      <ProductForm key={data.id} product={data} />
    </div>
  );
}
