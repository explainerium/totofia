"use client";

import type { ReactNode } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldShell } from "./FieldShell";

export type SelectOption = { value: string; label: ReactNode };

// Radix Select cannot hold an empty string, so "no value" uses a sentinel.
const NONE = "__none__";

type ProSelectProps = {
  name: string;
  options: SelectOption[];
  label?: ReactNode;
  description?: ReactNode;
  placeholder?: string;
  /** Adds a "none" option that stores `null`. */
  nullableLabel?: string;
  className?: string;
};

export function ProSelect({
  name,
  options,
  label,
  description,
  placeholder,
  nullableLabel,
  className,
}: ProSelectProps) {
  const { control } = useFormContext();

  return (
    <FieldShell name={name} label={label} description={description} className={className}>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <Select
            value={(field.value as string | null | undefined) ?? (nullableLabel ? NONE : "")}
            onValueChange={(v) => field.onChange(v === NONE ? null : v)}
          >
            <SelectTrigger
              id={name}
              aria-invalid={fieldState.invalid || undefined}
              className="w-full"
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {nullableLabel ? <SelectItem value={NONE}>{nullableLabel}</SelectItem> : null}
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FieldShell>
  );
}
