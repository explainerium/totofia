"use client";

import { ImageOff, Pencil } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { flattenCategories } from "@/components/dashboard/category-tree";
import { ConfirmDelete } from "@/components/dashboard/ConfirmDelete";
import { Panel } from "@/components/dashboard/Panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isApiError } from "@/lib/api/axios";
import { useDeleteCategoryMutation, useGetCategoriesQuery } from "@/redux/api/categoryApi";

export function CategoriesTable() {
  const { data, isLoading, isError } = useGetCategoriesQuery();
  const [remove] = useDeleteCategoryMutation();

  if (isLoading) return <Skeleton className="h-64 w-full rounded-2xl" />;
  if (isError || !data) return <Panel>Could not load categories.</Panel>;
  if (data.length === 0) return <Panel>No categories yet.</Panel>;

  return (
    <Panel className="p-0 md:p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16" />
            <TableHead>Name (English / বাংলা)</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className="text-right">Products</TableHead>
            <TableHead className="text-right">Order</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {flattenCategories(data).map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- tiny admin thumbnail
                  <img src={c.image.thumb} alt="" className="size-10 rounded-lg object-cover" />
                ) : (
                  <div className="grid size-10 place-items-center rounded-lg bg-surface-container">
                    <ImageOff className="size-4 text-outline" />
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div style={{ paddingLeft: `${c.depth * 1.25}rem` }}>
                  <div className="flex items-center gap-space-sm font-medium">
                    {c.depth > 0 ? <span className="text-outline">└</span> : null}
                    {c.translations.en?.name}
                    {c.isHidden ? <Badge variant="outline">Hidden</Badge> : null}
                  </div>
                  <div lang="bn" className="text-body-sm text-on-surface-variant">
                    {c.translations.bn?.name}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-body-sm text-on-surface-variant">{c.slug}</TableCell>
              <TableCell className="text-right">{c.productCount}</TableCell>
              <TableCell className="text-right">{c.sortOrder}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" asChild aria-label="Edit">
                    <Link href={`/admin/dashboard/categories/${c.id}/edit`}>
                      <Pencil />
                    </Link>
                  </Button>
                  <ConfirmDelete
                    title={`Delete “${c.translations.en?.name}”?`}
                    description={
                      c.childCount > 0
                        ? "Its sub-categories move to the top level. Products stay but lose this category."
                        : "Products stay but lose this category."
                    }
                    onConfirm={async () => {
                      try {
                        await remove(c.id).unwrap();
                        toast.success("Category deleted.");
                      } catch (error) {
                        toast.error(isApiError(error) ? error.message : "Delete failed.");
                      }
                    }}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Panel>
  );
}
