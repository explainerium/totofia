"use client";

import { Panel } from "@/components/dashboard/Panel";
import { CheckboxList } from "@/components/form/ProCheckbox";
import { ProInput } from "@/components/form/ProInput";
import { ProSelect } from "@/components/form/ProSelect";
import { ProSwitch } from "@/components/form/ProSwitch";
import { Label } from "@/components/ui/label";
import { PRODUCT_BADGES, PRODUCT_STATUSES } from "@/server/modules/product/product.schema";
import { SlugField } from "../../_components/SlugField";

const title = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export function ProductSettingsPanel({ isEdit }: { isEdit: boolean }) {
  return (
    <Panel title="Settings">
      <ProSelect
        name="status"
        label="Status"
        description="Only published products appear in the store."
        options={PRODUCT_STATUSES.map((s) => ({ value: s, label: title(s) }))}
      />
      <SlugField sourceName="translations.en.name" locked={isEdit} />
      <ProSwitch name="isFeatured" label="Featured" description="Shown on the home page." />
      <div className="space-y-space-sm">
        <Label className="text-label-md">Badges</Label>
        <CheckboxList
          name="badges"
          options={PRODUCT_BADGES.map((b) => ({ value: b, label: title(b) }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-space-sm">
        <ProInput name="ageMinMonths" label="Age from (months)" numeric="nullable" min={0} />
        <ProInput name="ageMaxMonths" label="Age to (months)" numeric="nullable" min={1} />
      </div>
      <p className="text-body-sm text-on-surface-variant">
        Leave the age empty for all ages. Used by “Shop by age”.
      </p>
    </Panel>
  );
}
