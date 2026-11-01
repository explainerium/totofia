"use client";

import type { ComponentProps, ReactNode } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FieldShell } from "./FieldShell";

type ProInputProps = Omit<ComponentProps<typeof Input>, "name" | "value" | "onChange"> & {
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  /** "nullable": an empty number input becomes `null` instead of 0. */
  numeric?: "number" | "nullable";
  /** Text input that stores `null` when cleared (optional codes, hex colors). */
  emptyAsNull?: boolean;
  shellClassName?: string;
};

export function ProInput({
  name,
  label,
  description,
  numeric,
  emptyAsNull,
  shellClassName,
  type,
  ...props
}: ProInputProps) {
  const { control } = useFormContext();

  return (
    <FieldShell name={name} label={label} description={description} className={shellClassName}>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <Input
            id={name}
            type={numeric ? "number" : type}
            inputMode={numeric ? "decimal" : undefined}
            aria-invalid={fieldState.invalid || undefined}
            {...props}
            name={field.name}
            ref={field.ref}
            onBlur={field.onBlur}
            value={(field.value as string | number | null | undefined) ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              if (numeric === "nullable") field.onChange(raw === "" ? null : Number(raw));
              else if (numeric === "number") field.onChange(raw === "" ? "" : Number(raw));
              else field.onChange(emptyAsNull && raw === "" ? null : raw);
            }}
          />
        )}
      />
    </FieldShell>
  );
}
