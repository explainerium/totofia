"use client";

import { ImageOff, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDelete } from "@/components/dashboard/ConfirmDelete";
import { Panel } from "@/components/dashboard/Panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiError } from "@/lib/api/axios";
import { formatDate } from "@/lib/format/intl";
import { useDeleteBannerMutation, useGetBannersQuery } from "@/redux/api/contentApi";
import type { AdminBanner } from "@/server/modules/content/banner.service";
import { BannerDialog } from "./BannerDialog";

const PLACEMENTS = [
  { value: "HOME_HERO", label: "Home hero" },
  { value: "HOME_PROMO", label: "Home promo strip" },
] as const;

function liveState(b: AdminBanner): {
  label: string;
  variant: "default" | "outline" | "secondary";
} {
  const now = new Date();
  if (!b.isActive) return { label: "inactive", variant: "outline" };
  if (b.startsAt && new Date(b.startsAt) > now) return { label: "scheduled", variant: "secondary" };
  if (b.endsAt && new Date(b.endsAt) <= now) return { label: "ended", variant: "outline" };
  return { label: "live", variant: "default" };
}

export function BannersManager() {
  const { data, isError } = useGetBannersQuery();
  const [remove] = useDeleteBannerMutation();

  if (isError) return <p>Could not load banners.</p>;
  if (!data) return <Skeleton className="h-60 w-full" />;

  return (
    <div className="space-y-space-lg">
      {PLACEMENTS.map((placement) => {
        const banners = data.filter((b) => b.placement === placement.value);
        return (
          <Panel
            key={placement.value}
            title={placement.label}
            actions={
              <BannerDialog
                placement={placement.value}
                nextSortOrder={banners.length}
                trigger={
                  <Button size="sm">
                    <Plus /> Add banner
                  </Button>
                }
              />
            }
          >
            {banners.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">No banners.</p>
            ) : (
              <ul className="divide-y divide-outline-variant/50">
                {banners.map((b) => {
                  const state = liveState(b);
                  return (
                    <li key={b.id} className="flex items-center gap-space-md py-space-sm">
                      {b.image ? (
                        // eslint-disable-next-line @next/next/no-img-element -- admin preview
                        <img
                          src={b.image.thumb}
                          alt=""
                          className="h-14 w-20 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="grid h-14 w-20 place-items-center rounded-lg bg-surface-container">
                          <ImageOff className="size-4 text-outline" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{b.titleEn}</p>
                        <p lang="bn" className="text-body-sm text-on-surface-variant">
                          {b.titleBn}
                        </p>
                        <p className="text-label-sm text-on-surface-variant">
                          {b.link ?? "no link"}
                          {b.startsAt || b.endsAt
                            ? ` · ${b.startsAt ? formatDate(b.startsAt, "en", "medium") : "now"} → ${b.endsAt ? formatDate(b.endsAt, "en", "medium") : "no end"}`
                            : ""}
                        </p>
                      </div>
                      <Badge variant={state.variant}>{state.label}</Badge>
                      <BannerDialog
                        banner={b}
                        placement={b.placement}
                        nextSortOrder={banners.length}
                        trigger={
                          <Button variant="ghost" size="icon-sm" aria-label="Edit">
                            <Pencil />
                          </Button>
                        }
                      />
                      <ConfirmDelete
                        title={`Delete “${b.titleEn}”?`}
                        onConfirm={() =>
                          remove(b.id)
                            .unwrap()
                            .then(
                              () => toast.success("Banner deleted."),
                              (e) => toast.error(isApiError(e) ? e.message : "Delete failed."),
                            )
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        );
      })}
    </div>
  );
}
