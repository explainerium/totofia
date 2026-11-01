"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import {
  FormProvider,
  useForm,
  type DefaultValues,
  type FieldValues,
  type Path,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { isApiError } from "@/lib/api/axios";
import { cn } from "@/lib/utils";

type Schema = z.ZodType<FieldValues, FieldValues>;

export type ProFormProps<S extends Schema> = {
  schema: S;
  defaultValues: DefaultValues<z.input<S>>;
  onSubmit: (values: z.output<S>, form: UseFormReturn<z.input<S>, unknown, z.output<S>>) => unknown;
  children: ReactNode;
  className?: string;
  id?: string;
};

/**
 * react-hook-form + zod wrapper. Children read the form through `useFormContext`.
 * A rejected `onSubmit` with an API validation error maps `details[].path` onto the fields.
 */
export function ProForm<S extends Schema>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
  id,
}: ProFormProps<S>) {
  const form = useForm<z.input<S>, unknown, z.output<S>>({
    // zodResolver cannot infer through the generic schema; the cast restores its types.
    resolver: zodResolver(schema) as unknown as Resolver<z.input<S>, unknown, z.output<S>>,
    defaultValues,
  });

  const submit = form.handleSubmit(
    async (values) => {
      try {
        await onSubmit(values, form);
      } catch (error) {
        applyServerErrors(form as unknown as Pick<UseFormReturn<FieldValues>, "setError">, error);
      }
    },
    () => toast.error("Please fix the highlighted fields."),
  );

  return (
    <FormProvider {...form}>
      <form id={id} onSubmit={submit} noValidate className={cn("space-y-space-lg", className)}>
        {children}
      </form>
    </FormProvider>
  );
}

/** Shows an API error as a toast and puts validation `details` on the matching fields. */
export function applyServerErrors<T extends FieldValues>(
  form: Pick<UseFormReturn<T>, "setError">,
  error: unknown,
) {
  if (!isApiError(error)) {
    toast.error("Something went wrong.");
    return;
  }
  for (const detail of error.details ?? []) {
    if (detail.path) form.setError(detail.path as Path<T>, { message: detail.message });
  }
  toast.error(error.message);
}
