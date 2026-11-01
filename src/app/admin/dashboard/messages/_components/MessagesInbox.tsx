"use client";

import { Archive, ChevronLeft, ChevronRight, Mail, Phone } from "lucide-react";
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
  useDeleteMessageMutation,
  useGetMessagesQuery,
  useSetMessageStatusMutation,
} from "@/redux/api/inboxApi";

type Filter = "INBOX" | "NEW" | "ARCHIVED";
const FILTERS: { value: Filter; label: string }[] = [
  { value: "INBOX", label: "All" },
  { value: "NEW", label: "Unread" },
  { value: "ARCHIVED", label: "Archived" },
];
const fail = (e: unknown) => toast.error(isApiError(e) ? e.message : "Update failed.");

export function MessagesInbox() {
  const [filter, setFilter] = useState<Filter>("INBOX");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  // "All" (INBOX) hides archived messages — filtered by the server so every page is full.
  const { data, isError, isFetching } = useGetMessagesQuery({ status: filter, page, limit: 20 });
  const [setStatus] = useSetMessageStatusMutation();
  const [remove] = useDeleteMessageMutation();
  const items = data?.items ?? [];

  return (
    <Panel className="p-0 md:p-0">
      <div className="flex gap-1 border-b border-outline-variant/50 p-space-sm">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? "default" : "ghost"}
            onClick={() => {
              setFilter(f.value);
              setPage(1);
            }}
          >
            {f.label}
            {f.value === "NEW" && data?.unread ? ` (${data.unread})` : ""}
          </Button>
        ))}
      </div>
      {isError ? (
        <p className="p-space-lg">Could not load messages.</p>
      ) : !data ? (
        <Skeleton className="m-space-md h-40" />
      ) : items.length === 0 ? (
        <p className="p-space-lg text-on-surface-variant">No messages.</p>
      ) : (
        <ul className={cn("divide-y divide-outline-variant/50", isFetching && "opacity-60")}>
          {items.map((m) => {
            const open = openId === m.id;
            return (
              <li key={m.id} className={cn("p-space-md", m.status === "NEW" && "bg-primary/5")}>
                <button
                  type="button"
                  className="flex w-full items-start gap-space-sm text-left"
                  onClick={() => {
                    setOpenId(open ? null : m.id);
                    if (!open && m.status === "NEW") {
                      setStatus({ id: m.id, status: "READ" }).unwrap().catch(fail);
                    }
                  }}
                >
                  <div className="flex-1">
                    <p className={cn(m.status === "NEW" && "font-semibold")}>
                      {m.name}
                      {m.subject ? ` — ${m.subject}` : ""}
                    </p>
                    <p
                      className={cn(
                        "text-body-sm text-on-surface-variant",
                        !open && "line-clamp-1",
                      )}
                    >
                      {m.message}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-label-sm text-on-surface-variant">
                      {formatDate(m.createdAt, "en", "medium")}
                    </p>
                    {m.status === "NEW" ? <Badge>new</Badge> : null}
                    {m.status === "ARCHIVED" ? <Badge variant="outline">archived</Badge> : null}
                  </div>
                </button>
                {open ? (
                  <div className="mt-space-sm flex flex-wrap items-center gap-space-sm">
                    {m.phone ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`tel:${m.phone}`}>
                          <Phone /> {m.phone}
                        </a>
                      </Button>
                    ) : null}
                    {m.email ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`mailto:${m.email}`}>
                          <Mail /> {m.email}
                        </a>
                      </Button>
                    ) : null}
                    <span className="text-label-sm text-on-surface-variant">
                      Written in {m.locale === "bn" ? "Bangla" : "English"}
                    </span>
                    <span className="flex-1" />
                    {m.status !== "ARCHIVED" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setStatus({ id: m.id, status: "ARCHIVED" })
                            .unwrap()
                            .then(() => toast.success("Archived."), fail)
                        }
                      >
                        <Archive /> Archive
                      </Button>
                    ) : null}
                    <ConfirmDelete
                      title="Delete this message?"
                      onConfirm={() =>
                        remove(m.id)
                          .unwrap()
                          .then(() => toast.success("Message deleted."), fail)
                      }
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
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
