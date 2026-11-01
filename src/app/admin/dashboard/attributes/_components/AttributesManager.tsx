"use client";

import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDelete } from "@/components/dashboard/ConfirmDelete";
import { Panel } from "@/components/dashboard/Panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isApiError } from "@/lib/api/axios";
import {
  useDeleteAttributeMutation,
  useDeleteAttributeValueMutation,
  useGetAttributesQuery,
} from "@/redux/api/attributeApi";
import { AttributeDialog } from "./AttributeDialog";
import { ValueDialog } from "./ValueDialog";

const onError = (error: unknown) =>
  toast.error(isApiError(error) ? error.message : "Something went wrong.");

export function AttributesManager() {
  const { data, isLoading, isError } = useGetAttributesQuery();
  const [removeAttribute] = useDeleteAttributeMutation();
  const [removeValue] = useDeleteAttributeValueMutation();

  if (isLoading) return <Skeleton className="h-64 w-full rounded-2xl" />;
  if (isError || !data) return <Panel>Could not load attributes.</Panel>;

  return (
    <div className="space-y-space-lg">
      <div className="flex justify-end">
        <AttributeDialog
          trigger={
            <Button>
              <Plus /> New attribute
            </Button>
          }
        />
      </div>
      {data.length === 0 ? <Panel>No attributes yet.</Panel> : null}
      {data.map((attribute) => (
        <Panel
          key={attribute.id}
          title={
            <span>
              {attribute.name.en}{" "}
              <span lang="bn" className="text-on-surface-variant">
                · {attribute.name.bn}
              </span>
            </span>
          }
          description={`Code: ${attribute.code}`}
          actions={
            <div className="flex gap-1">
              <ValueDialog
                attribute={attribute}
                trigger={
                  <Button variant="outline" size="sm">
                    <Plus /> Add value
                  </Button>
                }
              />
              <AttributeDialog
                attribute={attribute}
                trigger={
                  <Button variant="ghost" size="icon-sm" aria-label="Edit attribute">
                    <Pencil />
                  </Button>
                }
              />
              <ConfirmDelete
                title={`Delete “${attribute.name.en}” and all its values?`}
                description="Variants using these values lose them. This cannot be undone."
                onConfirm={() =>
                  removeAttribute(attribute.id)
                    .unwrap()
                    .then(() => toast.success("Attribute deleted."), onError)
                }
              />
            </div>
          }
        >
          {attribute.values.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">No values yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label (English)</TableHead>
                  <TableHead>Label (বাংলা)</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Order</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {attribute.values.map((value) => (
                  <TableRow key={value.id}>
                    <TableCell>
                      <span className="flex items-center gap-space-sm">
                        {value.colorHex ? (
                          <span
                            className="size-4 rounded-full border border-outline-variant"
                            style={{ backgroundColor: value.colorHex }}
                          />
                        ) : null}
                        {value.label.en}
                      </span>
                    </TableCell>
                    <TableCell lang="bn">{value.label.bn}</TableCell>
                    <TableCell className="text-body-sm text-on-surface-variant">
                      {value.code}
                    </TableCell>
                    <TableCell className="text-right">{value.sortOrder}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <ValueDialog
                          attribute={attribute}
                          value={value}
                          trigger={
                            <Button variant="ghost" size="icon-sm" aria-label="Edit value">
                              <Pencil />
                            </Button>
                          }
                        />
                        <ConfirmDelete
                          title={`Delete “${value.label.en}”?`}
                          description="Not possible while a variant still uses this value."
                          onConfirm={() =>
                            removeValue({ attributeId: attribute.id, valueId: value.id })
                              .unwrap()
                              .then(() => toast.success("Value deleted."), onError)
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Panel>
      ))}
    </div>
  );
}
