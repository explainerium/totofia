"use client";

import { MapPin, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Link } from "@/i18n/navigation";
import { localizeDigits } from "@/lib/format/intl";
import { findDistrict } from "@/lib/geo/bd";
import { cn } from "@/lib/utils";
import type { SavedAddress } from "@/server/modules/account/account.service";

/** Guests: a quiet sign-in link (they can still order without an account). */
export function CheckoutSignInHint() {
  const t = useTranslations("CheckoutAccount");
  return (
    <p className="text-body-md text-on-surface-variant">
      {t("haveAccount")}{" "}
      <Link
        href={{ pathname: "/login", query: { next: "/checkout" } }}
        className="font-semibold text-primary hover:underline"
      >
        {t("signIn")}
      </Link>
    </p>
  );
}

type PickerProps = {
  addresses: SavedAddress[];
  selectedId: string | null;
  onSelect: (address: SavedAddress | null) => void;
};

/** Signed-in customers pick a saved address (fills the fields) or enter a new one. */
export function SavedAddressPicker({ addresses, selectedId, onSelect }: PickerProps) {
  const t = useTranslations("CheckoutAccount");
  const tAccount = useTranslations("Account");
  const locale = useLocale();
  if (!addresses.length) return null;

  const card = (active: boolean) =>
    cn(
      "flex h-full w-full cursor-pointer flex-col gap-1 rounded-xl border-2 p-space-md text-left transition-colors",
      active
        ? "border-primary bg-secondary-fixed/15"
        : "border-outline-variant/50 hover:border-primary/50",
    );

  return (
    <fieldset className="space-y-space-sm">
      <legend className="mb-space-sm text-label-md text-on-surface">{t("savedAddresses")}</legend>
      <div className="grid gap-space-sm sm:grid-cols-2">
        {addresses.map((a) => (
          <button
            key={a.id}
            type="button"
            aria-pressed={selectedId === a.id}
            onClick={() => onSelect(a)}
            className={card(selectedId === a.id)}
          >
            <span className="flex items-center gap-space-xs text-label-lg text-on-surface">
              <MapPin className="size-4 text-primary" aria-hidden />
              {a.name}
              {a.isDefault ? (
                <span className="ml-auto rounded-full bg-secondary-fixed/40 px-2 text-label-sm text-on-secondary-fixed-variant">
                  {tAccount("defaultBadge")}
                </span>
              ) : null}
            </span>
            <span className="text-body-sm text-on-surface-variant">
              {localizeDigits(a.phone, locale)} · {a.addressLine}, {a.area},{" "}
              {findDistrict(a.district)?.name[locale] ?? a.district}
            </span>
          </button>
        ))}
        <button
          type="button"
          aria-pressed={selectedId === null}
          onClick={() => onSelect(null)}
          className={cn(card(selectedId === null), "items-center justify-center")}
        >
          <span className="flex items-center gap-space-xs text-label-lg text-primary">
            <Plus className="size-4" aria-hidden />
            {t("newAddress")}
          </span>
        </button>
      </div>
    </fieldset>
  );
}

export function SaveAddressCheckbox({ field }: { field: UseFormRegisterReturn }) {
  const t = useTranslations("CheckoutAccount");
  return (
    <label className="flex items-center gap-space-sm text-body-md">
      <input type="checkbox" className="size-4 accent-primary" {...field} />
      {t("saveAddress")}
    </label>
  );
}
