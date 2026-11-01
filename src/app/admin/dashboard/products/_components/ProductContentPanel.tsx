"use client";

import { LanguageTabs } from "@/components/dashboard/LanguageTabs";
import { Panel } from "@/components/dashboard/Panel";
import { ProInput } from "@/components/form/ProInput";
import { ProRichText } from "@/components/form/ProRichText";
import { ProTextarea } from "@/components/form/ProTextarea";

/** Bilingual product texts. Both languages need at least a name. */
export function ProductContentPanel() {
  return (
    <Panel
      title="Content"
      description="Fill in both বাংলা and English — the store never mixes languages."
    >
      <LanguageTabs prefix="translations">
        {(l) => (
          <>
            <ProInput name={`translations.${l}.name`} label="Name" />
            <ProTextarea
              name={`translations.${l}.shortDescription`}
              label="Short description"
              description="Shown next to the price."
              rows={2}
            />
            <ProRichText name={`translations.${l}.description`} label="Description" />
            <ProTextarea name={`translations.${l}.materialCare`} label="Material & care" rows={2} />
            <div className="grid gap-space-md md:grid-cols-2">
              <ProInput name={`translations.${l}.metaTitle`} label="SEO title" />
              <ProTextarea
                name={`translations.${l}.metaDescription`}
                label="SEO description"
                rows={2}
              />
            </div>
          </>
        )}
      </LanguageTabs>
    </Panel>
  );
}
