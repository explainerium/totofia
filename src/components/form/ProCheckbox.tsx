"use client";

import type { ReactNode } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type ProCheckboxProps = { name: string; label: ReactNode };

/** Boolean checkbox. For "value in array" checkboxes see `CheckboxList`. */
export function ProCheckbox({ name, label }: ProCheckboxProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="flex items-center gap-space-sm">
          <Checkbox
            id={name}
            checked={Boolean(field.value)}
            onCheckedChange={(v) => field.onChange(v === true)}
          />
          <Label htmlFor={name} className="text-body-md font-normal">
            {label}
          </Label>
        </div>
      )}
    />
  );
}

type CheckboxListProps = {
  name: string;
  options: { value: string; label: ReactNode; depth?: number }[];
};

/** Checkboxes that add/remove their value in an array field (badges, categories ...). */
export function CheckboxList({ name, options }: CheckboxListProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const selected: string[] = Array.isArray(field.value) ? field.value : [];
        return (
          <div className="space-y-space-sm">
            {options.map((o) => {
              const id = `${name}-${o.value}`;
              return (
                <div
                  key={o.value}
                  className="flex items-center gap-space-sm"
                  style={{ paddingLeft: `${(o.depth ?? 0) * 1.25}rem` }}
                >
                  <Checkbox
                    id={id}
                    checked={selected.includes(o.value)}
                    onCheckedChange={(checked) =>
                      field.onChange(
                        checked === true
                          ? [...selected, o.value]
                          : selected.filter((v) => v !== o.value),
                      )
                    }
                  />
                  <Label htmlFor={id} className="text-body-md font-normal">
                    {o.label}
                  </Label>
                </div>
              );
            })}
          </div>
        );
      }}
    />
  );
}
