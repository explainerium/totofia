"use client";

import type { ReactNode } from "react";
import { get, useFormState } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FieldShellProps = {
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
};

/** Label + control + description + validation message for one form field. */
export function FieldShell({
  name,
  label,
  description,
  htmlFor,
  className,
  children,
}: FieldShellProps) {
  const { errors } = useFormState({ name });
  const error = get(errors, name) as { message?: string } | undefined;

  return (
    <div className={cn("space-y-1.5", className)} data-invalid={error ? "" : undefined}>
      {label ? (
        <Label htmlFor={htmlFor ?? name} className="text-label-md">
          {label}
        </Label>
      ) : null}
      {children}
      {description && !error ? (
        <p className="text-body-sm text-on-surface-variant">{description}</p>
      ) : null}
      {error?.message ? <p className="text-body-sm text-error">{humanize(error.message)}</p> : null}
    </div>
  );
}

// Server/schema messages are keys like "salePriceMustBeLower"; show them as a sentence.
function humanize(message: string): string {
  if (message.includes(" ")) return message;
  const words = message
    .replace(/([A-Z])/g, " $1")
    .replace(/-/g, " ")
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
