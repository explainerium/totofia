"use client";

import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { useFormState } from "react-hook-form";
import { Button } from "@/components/ui/button";

type ProSubmitProps = ComponentProps<typeof Button> & { form?: string };

/** Submit button that disables itself and shows a spinner while the form submits. */
export function ProSubmit({ children, disabled, ...props }: ProSubmitProps) {
  const { isSubmitting } = useFormState();

  return (
    <Button type="submit" disabled={disabled || isSubmitting} {...props}>
      {isSubmitting ? <Loader2 className="animate-spin" /> : null}
      {children}
    </Button>
  );
}
