"use client";

import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { localizeDigits } from "@/lib/format/intl";
import { DIVISIONS, findDistrict, type DivisionCode } from "@/lib/geo/bd";
import {
  useDeleteAddressMutation,
  useGetAddressesQuery,
  useUpdateAddressMutation,
} from "@/redux/api/accountApi";
import type { SavedAddress } from "@/server/modules/account/account.service";
import { toastApiError } from "../cart/api-error";
import { AddressDialog } from "./AddressDialog";

export function AddressBook() {
  const t = useTranslations("Account");
  const tErrors = useTranslations("Errors");
  const locale = useLocale();
  const { data } = useGetAddressesQuery();
  const [remove] = useDeleteAddressMutation();
  const [update] = useUpdateAddressMutation();
  const [editing, setEditing] = useState<SavedAddress | undefined>();
  const [open, setOpen] = useState(false);
  // Remounts the dialog on every opening: no text left over from the last (cancelled) one.
  const [dialogKey, setDialogKey] = useState(0);

  const openDialog = (address?: SavedAddress) => {
    setEditing(address);
    setDialogKey((k) => k + 1);
    setOpen(true);
  };

  const makeDefault = (a: SavedAddress) =>
    update({ id: a.id, data: { ...a, isDefault: true } })
      .unwrap()
      .then(() => toast.success(t("addressSaved")))
      .catch((e) => toastApiError(e, tErrors("internal")));

  const del = (a: SavedAddress) =>
    remove(a.id)
      .unwrap()
      .then(() => toast.success(t("addressDeleted")))
      .catch((e) => toastApiError(e, tErrors("internal")));

  return (
    <div className="space-y-space-md">
      <div className="flex justify-end">
        <Button className="rounded-full" onClick={() => openDialog()}>
          <Plus aria-hidden /> {t("addAddress")}
        </Button>
      </div>

      {!data ? (
        <Skeleton className="h-32 w-full rounded-2xl" />
      ) : data.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-outline-variant p-space-lg text-center text-body-md text-on-surface-variant">
          {t("noAddresses")}
        </p>
      ) : (
        <ul className="grid gap-space-md md:grid-cols-2">
          {data.map((a) => (
            <li
              key={a.id}
              className="flex flex-col gap-space-sm rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-space-md"
            >
              <div className="flex items-start justify-between gap-space-sm">
                <p className="flex items-center gap-space-xs text-label-lg text-on-surface">
                  <MapPin className="size-4 text-primary" aria-hidden />
                  {a.name}
                </p>
                {a.isDefault ? (
                  <span className="rounded-full bg-secondary-fixed/40 px-2 py-0.5 text-label-sm text-on-secondary-fixed-variant">
                    {t("defaultBadge")}
                  </span>
                ) : null}
              </div>
              <p className="text-body-sm text-on-surface-variant">
                {localizeDigits(a.phone, locale)}
                <br />
                {a.addressLine}, {a.area}
                <br />
                {findDistrict(a.district)?.name[locale] ?? a.district},{" "}
                {DIVISIONS[a.division as DivisionCode]?.[locale] ?? a.division}
              </p>
              <div className="mt-auto flex flex-wrap gap-space-xs">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => openDialog(a)}
                >
                  <Pencil aria-hidden /> {t("edit")}
                </Button>
                {!a.isDefault ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                    onClick={() => makeDefault(a)}
                  >
                    {t("makeDefault")}
                  </Button>
                ) : null}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full text-error">
                      <Trash2 aria-hidden /> {t("delete")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
                      <AlertDialogDescription>{t("deleteConfirmBody")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                      <AlertDialogAction variant="destructive" onClick={() => del(a)}>
                        {t("delete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddressDialog key={dialogKey} open={open} onOpenChange={setOpen} address={editing} />
    </div>
  );
}
