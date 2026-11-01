"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ProForm } from "@/components/form/ProForm";
import { ProInput } from "@/components/form/ProInput";
import { ProSubmit } from "@/components/form/ProSubmit";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateAttributeMutation, useUpdateAttributeMutation } from "@/redux/api/attributeApi";
import { attributeInput, type AttributeInput } from "@/server/modules/attribute/attribute.schema";
import type { AdminAttribute } from "@/server/modules/attribute/attribute.service";

type AttributeDialogProps = { attribute?: AdminAttribute; trigger: ReactNode };

export function AttributeDialog({ attribute, trigger }: AttributeDialogProps) {
  const [open, setOpen] = useState(false);
  const [create] = useCreateAttributeMutation();
  const [update] = useUpdateAttributeMutation();

  async function onSubmit(values: AttributeInput) {
    if (attribute) await update({ id: attribute.id, data: values }).unwrap();
    else await create(values).unwrap();
    toast.success(attribute ? "Attribute saved." : "Attribute created.");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{attribute ? "Edit attribute" : "New attribute"}</DialogTitle>
        </DialogHeader>
        {open ? (
          <ProForm
            schema={attributeInput}
            defaultValues={{
              code: attribute?.code ?? "",
              sortOrder: attribute?.sortOrder ?? 0,
              name: { bn: attribute?.name.bn ?? "", en: attribute?.name.en ?? "" },
            }}
            onSubmit={onSubmit}
          >
            <ProInput name="name.en" label="Name (English)" />
            <ProInput name="name.bn" label="Name (বাংলা)" lang="bn" />
            <ProInput
              name="code"
              label="Code"
              description="Machine name, e.g. size or color. Filters use size and color."
            />
            <ProInput name="sortOrder" label="Sort order" numeric="number" min={0} />
            <DialogFooter>
              <ProSubmit>{attribute ? "Save" : "Create"}</ProSubmit>
            </DialogFooter>
          </ProForm>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
