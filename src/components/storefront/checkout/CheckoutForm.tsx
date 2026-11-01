"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "@/i18n/navigation";
import { isApiError } from "@/lib/api/axios";
import { DIVISION_CODES, DIVISIONS, districtsOf } from "@/lib/geo/bd";
import { trackBeginCheckout } from "@/lib/analytics/track";
import { useGetCartQuery } from "@/redux/api/cartApi";
import { useGetCheckoutPreviewQuery, usePlaceOrderMutation } from "@/redux/api/checkoutApi";
import type { SessionUser } from "@/server/auth/session";
import type { SavedAddress } from "@/server/modules/account/account.service";
import { checkoutInput } from "@/server/modules/checkout/checkout.schema";
import { toast } from "sonner";
import { CheckoutSignInHint, SaveAddressCheckbox, SavedAddressPicker } from "./CheckoutAccount";
import { CheckoutSummary } from "./CheckoutSummary";
import { PaymentMethodPicker } from "./PaymentMethodPicker";
import { Field, Section, SelectInput, TextArea, TextInput, useFieldError } from "./fields";

type Values = z.input<typeof checkoutInput>;
type Output = z.output<typeof checkoutInput>;

const FORM_ID = "checkout-form";

export type CheckoutAccountData = { user: SessionUser; addresses: SavedAddress[] } | null;

/**
 * Checkout for guests and signed-in customers: contact, address (saved addresses for customers),
 * payment (cash on delivery or SSLCommerz when configured) and a live price summary.
 */
export function CheckoutForm({ account }: { account: CheckoutAccountData }) {
  const t = useTranslations("Checkout");
  const tErrors = useTranslations("Errors");
  const locale = useLocale();
  const router = useRouter();
  const fieldError = useFieldError();
  const [placed, setPlaced] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const defaultAddress = account?.addresses.find((a) => a.isDefault) ?? account?.addresses[0];
  const [addressId, setAddressId] = useState<string | null>(defaultAddress?.id ?? null);

  const { data: cart, isSuccess: cartLoaded } = useGetCartQuery();
  const form = useForm<Values, unknown, Output>({
    resolver: zodResolver(checkoutInput),
    defaultValues: {
      name: defaultAddress?.name ?? account?.user.name ?? "",
      phone: defaultAddress?.phone ?? account?.user.phone ?? "",
      email: account?.user.email ?? "",
      division: defaultAddress?.division ?? "",
      district: defaultAddress?.district ?? "",
      area: defaultAddress?.area ?? "",
      addressLine: defaultAddress?.addressLine ?? "",
      note: "",
      paymentMethod: "COD",
      saveAddress: false,
    },
  });
  const { register, handleSubmit, control, setValue, setError, formState } = form;
  const division = useWatch({ control, name: "division" });
  const district = useWatch({ control, name: "district" });
  const phone = useDebounce(useWatch({ control, name: "phone" }), 500);
  const paymentMethod = useWatch({ control, name: "paymentMethod" });

  const { data: preview } = useGetCheckoutPreviewQuery({
    district: district || undefined,
    phone: phone || undefined,
  });
  const [placeOrder, { isLoading: placing }] = usePlaceOrderMutation();

  // Nothing to check out → back to the bag (but not right after placing an order).
  useEffect(() => {
    if (cartLoaded && cart?.items.length === 0 && !placed) router.replace("/cart");
  }, [cartLoaded, cart?.items.length, placed, router]);

  // Analytics: begin_checkout once, when the bag has loaded with items.
  const beganCheckout = useRef(false);
  useEffect(() => {
    if (beganCheckout.current || !cart?.items.length) return;
    beganCheckout.current = true;
    trackBeginCheckout(
      cart.items.map((i) => ({
        id: i.productId,
        name: i.name,
        price: i.unitPrice,
        quantity: i.quantity,
      })),
    );
  }, [cart]);

  const pickAddress = (a: SavedAddress | null) => {
    setAddressId(a?.id ?? null);
    const fields = {
      name: a?.name ?? account?.user.name ?? "",
      phone: a?.phone ?? account?.user.phone ?? "",
      division: a?.division ?? "",
      district: a?.district ?? "",
      area: a?.area ?? "",
      addressLine: a?.addressLine ?? "",
    } as const;
    for (const [key, value] of Object.entries(fields)) {
      setValue(key as keyof typeof fields, value, { shouldValidate: false });
    }
  };

  const onSubmit = async (values: Output) => {
    // Set before the request: placing the order empties the cart, which must not bounce to /cart.
    setPlaced(true);
    try {
      const result = await placeOrder(values).unwrap();
      const orderPath = `/order/${result.number}?token=${encodeURIComponent(result.token)}`;
      if (values.paymentMethod !== "COD") {
        if (result.paymentUrl) {
          // Full navigation to the gateway page (not the Next router).
          setRedirecting(true);
          window.location.assign(result.paymentUrl);
        } else {
          // Order exists but the gateway could not be reached — the order page offers "Pay now".
          router.push(`${orderPath}&payment=failed`);
        }
        return;
      }
      router.push(`${orderPath}&placed=1`);
    } catch (e) {
      setPlaced(false);
      if (isApiError(e) && e.details?.length) {
        for (const d of e.details) setError(d.path as keyof Values, { message: d.message });
        toast.error(t("fixErrors"));
      } else {
        toast.error(isApiError(e) && e.statusCode ? e.message : tErrors("internal"));
      }
    }
  };

  if (!preview || !cart || cart.items.length === 0) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  const err = (name: keyof Values) => fieldError(formState.errors[name]);
  const aria = (name: keyof Values) => ({
    "aria-invalid": Boolean(formState.errors[name]),
    "aria-describedby": formState.errors[name] ? `${name}-error` : undefined,
  });

  return (
    <div className="grid gap-space-lg lg:grid-cols-12">
      <form
        id={FORM_ID}
        onSubmit={handleSubmit(onSubmit, () => toast.error(t("fixErrors")))}
        noValidate
        className="space-y-space-lg lg:col-span-7"
      >
        {!account ? <CheckoutSignInHint /> : null}
        <Section title={t("contactTitle")}>
          <Field id="name" label={t("name")} error={err("name")}>
            <TextInput id="name" autoComplete="name" {...register("name")} {...aria("name")} />
          </Field>
          <div className="grid gap-space-md sm:grid-cols-2">
            <Field id="phone" label={t("phone")} error={err("phone")}>
              <TextInput
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder={t("phonePlaceholder")}
                {...register("phone")}
                {...aria("phone")}
              />
            </Field>
            <Field id="email" label={t("email")} error={err("email")} hint={t("emailHint")}>
              <TextInput
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                {...aria("email")}
              />
            </Field>
          </div>
        </Section>

        <Section title={t("addressTitle")}>
          {account ? (
            <SavedAddressPicker
              addresses={account.addresses}
              selectedId={addressId}
              onSelect={pickAddress}
            />
          ) : null}
          <div className="grid gap-space-md sm:grid-cols-2">
            <Field id="division" label={t("division")} error={err("division")}>
              <SelectInput
                id="division"
                {...register("division", {
                  onChange: () => setValue("district", "", { shouldValidate: false }),
                })}
                {...aria("division")}
              >
                <option value="">{t("choose")}</option>
                {DIVISION_CODES.map((code) => (
                  <option key={code} value={code}>
                    {DIVISIONS[code][locale]}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field id="district" label={t("district")} error={err("district")}>
              {/* Controlled: picking a saved address sets division and district together, and the
                  new division's options only exist after the next render. */}
              <SelectInput
                id="district"
                disabled={!division}
                {...register("district")}
                value={district ?? ""}
                {...aria("district")}
              >
                <option value="">{t("choose")}</option>
                {districtsOf(division)
                  .slice()
                  .sort((a, b) => a.name[locale].localeCompare(b.name[locale], locale))
                  .map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name[locale]}
                    </option>
                  ))}
              </SelectInput>
            </Field>
          </div>
          <Field id="area" label={t("area")} error={err("area")}>
            <TextInput
              id="area"
              placeholder={t("areaPlaceholder")}
              {...register("area")}
              {...aria("area")}
            />
          </Field>
          <Field id="addressLine" label={t("addressLine")} error={err("addressLine")}>
            <TextArea
              id="addressLine"
              autoComplete="street-address"
              placeholder={t("addressLinePlaceholder")}
              {...register("addressLine")}
              {...aria("addressLine")}
            />
          </Field>
          {account && addressId === null ? (
            <SaveAddressCheckbox field={register("saveAddress")} />
          ) : null}
          <Field id="note" label={t("note")} error={err("note")}>
            <TextArea
              id="note"
              placeholder={t("notePlaceholder")}
              {...register("note")}
              {...aria("note")}
            />
          </Field>
        </Section>

        <Section title={t("paymentTitle")}>
          <PaymentMethodPicker
            field={register("paymentMethod")}
            selected={paymentMethod ?? "COD"}
            onlineMethods={preview.onlineMethods ?? []}
          />
        </Section>
      </form>

      <div className="lg:col-span-5">
        <CheckoutSummary
          preview={preview}
          formId={FORM_ID}
          submitting={placing || placed}
          redirecting={redirecting}
          online={paymentMethod !== undefined && paymentMethod !== "COD"}
        />
      </div>
    </div>
  );
}
