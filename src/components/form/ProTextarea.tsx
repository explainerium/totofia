"use client";

import type { ComponentProps, ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { FieldShell } from "./FieldShell";

type ProTextareaProps = Omit<ComponentProps<typeof Textarea>, "name"> & {
  name: string;
  label?: ReactNode;
  description?: ReactNode;
};

export function ProTextarea({ name, label, description, ...props }: ProTextareaProps) {
  const { register, getFieldState, formState } = useFormContext();
  const invalid = getFieldState(name, formState).invalid;

  return (
    <FieldShell name={name} label={label} description={description}>
      <Textarea id={name} aria-invalid={invalid || undefined} {...props} {...register(name)} />
    </FieldShell>
  );
}
