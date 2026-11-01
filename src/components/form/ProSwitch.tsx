"use client";

import type { ReactNode } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type ProSwitchProps = { name: string; label: ReactNode; description?: ReactNode };

export function ProSwitch({ name, label, description }: ProSwitchProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="flex items-start justify-between gap-space-md">
          <div className="space-y-0.5">
            <Label htmlFor={name} className="text-label-md">
              {label}
            </Label>
            {description ? (
              <p className="text-body-sm text-on-surface-variant">{description}</p>
            ) : null}
          </div>
          <Switch id={name} checked={Boolean(field.value)} onCheckedChange={field.onChange} />
        </div>
      )}
    />
  );
}
