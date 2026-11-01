"use client";

import { ChevronLeft, ChevronRight, ImageOff, Pencil, Search, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDelete } from "@/components/dashboard/ConfirmDelete";
import { Panel } from "@/components/dashboard/Panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/useDebounce";
import { isApiError } from "@/lib/api/axios";
import { formatDate, formatPrice } from "@/lib/format/intl";
import {
  useDeleteProductMutation,
  useGetProductsQuery,
  type ProductListParams,
} from "@/redux/api/productApi";
import { PRODUCT_STATUSES } from "@/server/modules/product/product.schema";

const statusVariant = { PUBLISHED: "default", DRAFT: "secondary", ARCHIVED: "outline" } as const;

export function ProductsTable() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ProductListParams["status"] | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const search = useDebounce(q.trim());

  const { data, isFetching, isError } = useGetProductsQuery({
    page,
    limit: 20,
    q: search || undefined,
    status: status === "ALL" ? undefined : status,
  });
  const [remove] = useDeleteProductMutation();
  const meta = data?.meta;

  return (
    <Panel className="p-0 md:p-0">
      <div className="flex flex-wrap gap-space-sm border-b border-outline-variant/50 p-space-md">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-outline" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or SKU"
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as typeof status);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {PRODUCT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError ? (
        <p className="p-space-lg text-body-md">Could not load products.</p>
      ) : !data ? (
        <div className="space-y-2 p-space-md">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <p className="p-space-lg text-body-md text-on-surface-variant">No products found.</p>
      ) : (
        <Table className={isFetching ? "opacity-60" : undefined}>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16" />
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- tiny admin thumbnail
                    <img src={p.image} alt="" className="size-10 rounded-lg object-cover" />
                  ) : (
                    <div className="grid size-10 place-items-center rounded-lg bg-surface-container">
                      <ImageOff className="size-4 text-outline" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/dashboard/products/${p.id}/edit`}
                    className="flex items-center gap-1 font-medium hover:text-primary"
                  >
                    {p.name.en}
                    {p.isFeatured ? (
                      <Star className="size-3.5 fill-current text-tertiary" aria-label="Featured" />
                    ) : null}
                  </Link>
                  <div lang="bn" className="text-body-sm text-on-surface-variant">
                    {p.name.bn}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[p.status]}>{p.status.toLowerCase()}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {p.minPrice === null ? "—" : formatPrice(p.minPrice, "en")}
                </TableCell>
                <TableCell className="text-right">
                  <span className={p.totalStock === 0 ? "text-error" : undefined}>
                    {p.totalStock}
                  </span>
                  <div className="text-label-sm text-on-surface-variant">
                    {p.variantCount} variant{p.variantCount === 1 ? "" : "s"}
                  </div>
                </TableCell>
                <TableCell className="text-body-sm text-on-surface-variant">
                  {formatDate(p.updatedAt, "en", "medium")}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" asChild aria-label="Edit">
                      <Link href={`/admin/dashboard/products/${p.id}/edit`}>
                        <Pencil />
                      </Link>
                    </Button>
                    <ConfirmDelete
                      title={`Delete “${p.name.en}”?`}
                      description="The product, its variants and gallery links are removed. Tip: set it to Archived instead to keep it."
                      onConfirm={() =>
                        remove(p.id)
                          .unwrap()
                          .then(
                            () => toast.success("Product deleted."),
                            (e) => toast.error(isApiError(e) ? e.message : "Delete failed."),
                          )
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {meta && meta.totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-outline-variant/50 p-space-md text-body-sm">
          <span className="text-on-surface-variant">
            {meta.total} products · page {meta.page} of {meta.totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => setPage((n) => n - 1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Next page"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((n) => n + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}
