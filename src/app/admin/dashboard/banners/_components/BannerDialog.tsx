"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ProForm } from "@/components/form/ProForm";
import { ProInput } from "@/components/form/ProInput";
import { ProSubmit } from "@/components/form/ProSubmit";
import { ProSwitch } from "@/components/form/ProSwitch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateBannerMutation, useUpdateBannerMutation } from "@/redux/api/contentApi";
import type { AdminBanner } from "@/server/modules/content/banner.service";
import { bannerInput, type BannerInput } from "@/server/modules/content/content.schema";
import { toLocalInput } from "../../_components/datetime";
import { SingleImageField } from "../../_components/SingleImageField";

export function BannerDialog({
  banner,
  placement,
  nextSortOrder,
  trigger,
}: {
  banner?: AdminBanner;
  placement: BannerInput["placement"];
  nextSortOrder: number;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [create] = useCreateBannerMutation();
  const [update] = useUpdateBannerMutation();

  async function onSubmit(values: BannerInput) {
    if (banner) await update({ id: banner.id, data: values }).unwrap();
    else await create(values).unwrap();
    toast.success(banner ? "Banner saved." : "Banner created.");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{banner ? "Edit banner" : "New banner"}</DialogTitle>
        </DialogHeader>
        {open ? (
          <ProForm
            schema={bannerInput}
            defaultValues={{
              placement,
              imageId: banner?.imageId ?? null,
              titleBn: banner?.titleBn ?? "",
              titleEn: banner?.titleEn ?? "",
              subtitleBn: banner?.subtitleBn ?? "",
              subtitleEn: banner?.subtitleEn ?? "",
              ctaLabelBn: banner?.ctaLabelBn ?? "",
              ctaLabelEn: banner?.ctaLabelEn ?? "",
              link: banner?.link ?? null,
              sortOrder: banner?.sortOrder ?? nextSortOrder,
              // datetime-local strings; zod coerces them back to dates.
              startsAt: toLocalInput(banner?.startsAt) as unknown as Date | null,
              endsAt: toLocalInput(banner?.endsAt) as unknown as Date | null,
              isActive: banner?.isActive ?? true,
            }}
            onSubmit={onSubmit}
          >
            <div className="grid gap-space-md sm:grid-cols-[200px_1fr]">
              <div className="space-y-1.5">
                <p className="text-label-md">Image</p>
                <SingleImageField name="imageId" initialUrl={banner?.image?.grid ?? null} />
              </div>
              <div className="space-y-space-md">
                <ProInput name="titleEn" label="Title (English)" />
                <ProInput name="titleBn" label="Title (বাংলা)" lang="bn" />
                <ProInput name="subtitleEn" label="Subtitle (English)" />
                <ProInput name="subtitleBn" label="Subtitle (বাংলা)" lang="bn" />
              </div>
            </div>
            <div className="grid gap-space-md sm:grid-cols-2">
              <ProInput name="ctaLabelEn" label="Button label (English)" />
              <ProInput name="ctaLabelBn" label="Button label (বাংলা)" lang="bn" />
              <ProInput
                name="link"
                label="Link"
                emptyAsNull
                placeholder="/category/sets"
                description="Store path without language, e.g. /shop or /product/…"
              />
              <ProInput name="sortOrder" label="Sort order" numeric="number" min={0} />
              <ProInput
                name="startsAt"
                label="Starts (optional)"
                type="datetime-local"
                emptyAsNull
              />
              <ProInput name="endsAt" label="Ends (optional)" type="datetime-local" emptyAsNull />
            </div>
            <ProSwitch name="isActive" label="Active" />
            <DialogFooter>
              <ProSubmit>{banner ? "Save" : "Create"}</ProSubmit>
            </DialogFooter>
          </ProForm>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
