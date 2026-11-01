"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LanguageTabs } from "@/components/dashboard/LanguageTabs";
import { Panel } from "@/components/dashboard/Panel";
import { ProForm } from "@/components/form/ProForm";
import { ProInput } from "@/components/form/ProInput";
import { ProRichText } from "@/components/form/ProRichText";
import { ProSubmit } from "@/components/form/ProSubmit";
import { ProSwitch } from "@/components/form/ProSwitch";
import { ProTextarea } from "@/components/form/ProTextarea";
import { useCreatePageMutation, useUpdatePageMutation } from "@/redux/api/contentApi";
import { pageInput, type PageInput } from "@/server/modules/content/content.schema";
import type { AdminPage } from "@/server/modules/content/page.service";

export function PageForm({ page }: { page?: AdminPage }) {
  const router = useRouter();
  const [create] = useCreatePageMutation();
  const [update] = useUpdatePageMutation();

  async function onSubmit(values: PageInput) {
    if (page) {
      await update({ id: page.id, data: values }).unwrap();
      toast.success("Page saved.");
    } else {
      const created = await create(values).unwrap();
      toast.success("Page created.");
      router.replace(`/admin/dashboard/pages/${created.id}/edit`);
    }
  }

  const t = (l: "bn" | "en") => ({
    title: page?.translations[l].title ?? "",
    body: page?.translations[l].body ?? "",
    metaTitle: page?.translations[l].metaTitle ?? "",
    metaDescription: page?.translations[l].metaDescription ?? "",
  });

  return (
    <ProForm
      schema={pageInput}
      defaultValues={{
        slug: page?.slug ?? "",
        isPublished: page?.isPublished ?? true,
        translations: { bn: t("bn"), en: t("en") },
      }}
      onSubmit={onSubmit}
    >
      <div className="grid gap-space-lg lg:grid-cols-[1fr_320px]">
        <Panel title="Content" description="Write both languages — the store never mixes them.">
          <LanguageTabs prefix="translations">
            {(l) => (
              <>
                <ProInput name={`translations.${l}.title`} label="Title" />
                <ProRichText name={`translations.${l}.body`} label="Body" />
                <ProInput name={`translations.${l}.metaTitle`} label="SEO title (optional)" />
                <ProTextarea
                  name={`translations.${l}.metaDescription`}
                  label="SEO description (optional)"
                  rows={2}
                />
              </>
            )}
          </LanguageTabs>
        </Panel>
        <div className="space-y-space-lg">
          <Panel title="Settings">
            <ProInput
              name="slug"
              label="URL slug"
              description="e.g. about, return-policy. Footer links use: about, shipping-delivery, return-policy, privacy, terms, faq, size-guide."
            />
            <ProSwitch
              name="isPublished"
              label="Published"
              description="Hidden pages return “not found”."
            />
            <ProSubmit className="w-full">{page ? "Save page" : "Create page"}</ProSubmit>
          </Panel>
        </div>
      </div>
    </ProForm>
  );
}
