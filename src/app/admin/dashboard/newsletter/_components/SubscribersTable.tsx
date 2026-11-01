"use client";

import { ChevronLeft, ChevronRight, Search, UserMinus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDelete } from "@/components/dashboard/ConfirmDelete";
import { Panel } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { formatDate } from "@/lib/format/intl";
import { useGetSubscribersQuery, useUnsubscribeMutation } from "@/redux/api/inboxApi";

export function SubscribersTable() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const search = useDebounce(q.trim());
  const { data, isError, isFetching } = useGetSubscribersQuery({
    q: search || undefined,
    page,
    limit: 25,
  });
  const [unsubscribe] = useUnsubscribeMutation();
  const meta = data?.meta;

  return (
    <Panel className="p-0 md:p-0">
      <div className="border-b border-outline-variant/50 p-space-md">
        <div className="relative max-w-md">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-outline" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search email"
            className="pl-9"
          />
        </div>
      </div>
      {isError ? (
        <p className="p-space-lg">Could not load subscribers.</p>
      ) : !data ? (
        <Skeleton className="m-space-md h-40" />
      ) : data.items.length === 0 ? (
        <p className="p-space-lg text-on-surface-variant">No subscribers yet.</p>
      ) : (
        <Table className={isFetching ? "opacity-60" : undefined}>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Subscribed</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.email}</TableCell>
                <TableCell>{s.locale === "bn" ? "Bangla" : "English"}</TableCell>
                <TableCell className="text-body-sm text-on-surface-variant">
                  {formatDate(s.createdAt, "en", "medium")}
                </TableCell>
                <TableCell>
                  <ConfirmDelete
                    title={`Unsubscribe ${s.email}?`}
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label="Unsubscribe">
                        <UserMinus className="text-error" />
                      </Button>
                    }
                    onConfirm={() =>
                      unsubscribe(s.id)
                        .unwrap()
                        .then(
                          () => toast.success("Unsubscribed."),
                          (e) => toast.error(isApiError(e) ? e.message : "Failed."),
                        )
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {meta && meta.totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-outline-variant/50 p-space-md text-body-sm">
          <span className="text-on-surface-variant">{meta.total} subscribers</span>
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
