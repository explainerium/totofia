"use client";

import { useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { ProInput } from "@/components/form/ProInput";
import { slugify } from "@/server/lib/slugify";

/**
 * URL slug shared by both languages. Follows the English name until the slug is edited by hand;
 * existing records (`locked`) never change their slug automatically.
 */
export function SlugField({ sourceName, locked }: { sourceName: string; locked: boolean }) {
  const { setValue } = useFormContext();
  const source = useWatch({ name: sourceName }) as string | undefined;
  // Becomes true once the admin focuses the slug input.
  const manual = useRef(locked);

  useEffect(() => {
    if (!manual.current) setValue("slug", slugify(source ?? ""), { shouldValidate: false });
  }, [source, setValue]);

  return (
    <ProInput
      name="slug"
      label="URL slug"
      description="Lowercase letters, numbers and dashes. Used in both languages."
      onFocus={() => {
        manual.current = true;
      }}
    />
  );
}
