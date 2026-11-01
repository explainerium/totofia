"use client";

import { ExternalLink, Pencil } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
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
import { formatDate } from "@/lib/format/intl";
import { useDeletePageMutation, useGetPagesQuery } from "@/redux/api/contentApi";

export function PagesTable() {
  const { data, isError } = useGetPagesQuery();
  const [remove] = useDeletePageMutation();

  if (isError) return <p>Could not load pages.</p>;
  if (!data) return <Skeleton className="h-60 w-full" />;

  return (
    <Panel className="p-0 md:p-0">
      {data.length === 0 ? (
        <p className="p-space-lg text-on-surface-variant">No pages yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-32" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Link
                    href={`/admin/dashboard/pages/${p.id}/edit`}
                    className="font-medium hover:text-primary"
                  >
                    {p.translations.en.title}
                  </Link>
                  <div lang="bn" className="text-body-sm text-on-surface-variant">
                    {p.translations.bn.title}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-body-sm">/{p.slug}</TableCell>
                <TableCell>
                  <Badge variant={p.isPublished ? "default" : "outline"}>
                    {p.isPublished ? "published" : "hidden"}
                  </Badge>
                </TableCell>
                <TableCell className="text-body-sm text-on-surface-variant">
                  {formatDate(p.updatedAt, "en", "medium")}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" asChild aria-label="Open in store">
                      <a href={`/${p.slug}`} target="_blank" rel="noreferrer">
                        <ExternalLink />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon-sm" asChild aria-label="Edit">
                      <Link href={`/admin/dashboard/pages/${p.id}/edit`}>
                        <Pencil />
                      </Link>
                    </Button>
                    <ConfirmDelete
                      title={`Delete “${p.translations.en.title}”?`}
                      description="Links to this page will show “not found”. Tip: unpublish it instead."
                      onConfirm={() =>
                        remove(p.id)
                          .unwrap()
                          .then(
                            () => toast.success("Page deleted."),
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
    </Panel>
  );
}
