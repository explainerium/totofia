"use client";

import { Check, ChevronLeft, ChevronRight, Star, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDelete } from "@/components/dashboard/ConfirmDelete";
import { Panel } from "@/components/dashboard/Panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiError } from "@/lib/api/axios";
import { formatDate } from "@/lib/format/intl";
import { cn } from "@/lib/utils";
import {
  useDeleteReviewMutation,
  useGetReviewsQuery,
  useSetReviewStatusMutation,
} from "@/redux/api/inboxApi";

const TABS = ["PENDING", "APPROVED", "REJECTED"] as const;
const fail = (e: unknown) => toast.error(isApiError(e) ? e.message : "Update failed.");

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            i < rating ? "fill-current text-tertiary" : "text-outline-variant",
          )}
        />
      ))}
    </span>
  );
}

export function ReviewsModeration() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("PENDING");
  const [page, setPage] = useState(1);
  const { data, isError, isFetching } = useGetReviewsQuery({ status: tab, page, limit: 20 });
  const [setStatus] = useSetReviewStatusMutation();
  const [remove] = useDeleteReviewMutation();

  return (
    <Panel className="p-0 md:p-0">
      <div className="flex gap-1 border-b border-outline-variant/50 p-space-sm">
        {TABS.map((t) => (
          <Button
            key={t}
            size="sm"
            variant={tab === t ? "default" : "ghost"}
            onClick={() => {
              setTab(t);
              setPage(1);
            }}
          >
            {t.charAt(0) + t.slice(1).toLowerCase()}
            {t === "PENDING" && data?.pending ? ` (${data.pending})` : ""}
          </Button>
        ))}
      </div>
      {isError ? (
        <p className="p-space-lg">Could not load reviews.</p>
      ) : !data ? (
        <Skeleton className="m-space-md h-40" />
      ) : data.items.length === 0 ? (
        <p className="p-space-lg text-on-surface-variant">No {tab.toLowerCase()} reviews.</p>
      ) : (
        <ul className={cn("divide-y divide-outline-variant/50", isFetching && "opacity-60")}>
          {data.items.map((r) => (
            <li key={r.id} className="space-y-space-sm p-space-md">
              <div className="flex flex-wrap items-center gap-space-sm">
                <Stars rating={r.rating} />
                <Link
                  href={`/admin/dashboard/products/${r.productId}/edit`}
                  className="font-medium hover:text-primary"
                >
                  {r.productName}
                </Link>
                <Badge variant="outline">{r.locale === "bn" ? "Bangla" : "English"}</Badge>
                <span className="flex-1" />
                <span className="text-label-sm text-on-surface-variant">
                  {r.author} ({r.authorEmail}) · order #{r.orderNumber} ·{" "}
                  {formatDate(r.createdAt, "en", "medium")}
                </span>
              </div>
              <p lang={r.locale} className="text-body-md whitespace-pre-line">
                {r.body}
              </p>
              <div className="flex gap-space-sm">
                {r.status !== "APPROVED" ? (
                  <Button
                    size="sm"
                    onClick={() =>
                      setStatus({ id: r.id, status: "APPROVED" })
                        .unwrap()
                        .then(() => toast.success("Review approved — now visible."), fail)
                    }
                  >
                    <Check /> Approve
                  </Button>
                ) : null}
                {r.status !== "REJECTED" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setStatus({ id: r.id, status: "REJECTED" })
                        .unwrap()
                        .then(() => toast.success("Review rejected."), fail)
                    }
                  >
                    <X /> Reject
                  </Button>
                ) : null}
                <ConfirmDelete
                  title="Delete this review?"
                  description="The customer can then write a new review for this product."
                  onConfirm={() =>
                    remove(r.id)
                      .unwrap()
                      .then(() => toast.success("Review deleted."), fail)
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      )}
      {data?.meta && data.meta.totalPages > 1 ? (
        <div className="flex justify-end gap-1 border-t border-outline-variant/50 p-space-md">
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
            disabled={page >= data.meta.totalPages}
            onClick={() => setPage((n) => n + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      ) : null}
    </Panel>
  );
}
