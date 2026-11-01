"use client";

import { useRouter } from "next/navigation";
import { useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Panel } from "@/components/dashboard/Panel";
import { ProForm } from "@/components/form/ProForm";
import { ProInput } from "@/components/form/ProInput";
import { ProSelect } from "@/components/form/ProSelect";
import { ProSubmit } from "@/components/form/ProSubmit";
import { ProTextarea } from "@/components/form/ProTextarea";
import { DIVISION_CODES, DIVISIONS, districtsOf } from "@/lib/geo/bd";
import { useCreateManualOrderMutation } from "@/redux/api/orderApi";
import { manualOrderInput, type ManualOrderInput } from "@/server/modules/order/order-admin.schema";
import { OrderItemsField } from "./OrderItemsField";

const divisionOptions = DIVISION_CODES.map((d) => ({ value: d, label: DIVISIONS[d].en }));

export function ManualOrderForm() {
  const router = useRouter();
  const [create] = useCreateManualOrderMutation();

  async function onSubmit(values: ManualOrderInput) {
    const order = await create(values).unwrap();
    toast.success(`Order #${order.number} created.`);
    router.push(`/admin/dashboard/orders/${order.id}`);
  }

  return (
    <ProForm
      schema={manualOrderInput}
      defaultValues={{
        items: [],
        name: "",
        phone: "",
        email: "",
        locale: "bn",
        division: "" as ManualOrderInput["division"],
        district: "",
        area: "",
        addressLine: "",
        note: "",
        couponCode: "",
        shippingFee: null,
        paymentMethod: "COD",
      }}
      onSubmit={onSubmit}
    >
      <div className="grid gap-space-lg lg:grid-cols-[1fr_360px]">
        <div className="space-y-space-lg">
          <Panel title="Items">
            <OrderItemsField />
          </Panel>
          <Panel title="Delivery address">
            <div className="grid gap-space-md sm:grid-cols-2">
              <ProSelect
                name="division"
                label="Division"
                options={divisionOptions}
                placeholder="Select"
              />
              <DistrictSelect />
              <ProInput name="area" label="Area / thana" />
              <ProInput name="addressLine" label="House, road, block" />
            </div>
            <ProTextarea name="note" label="Customer note (optional)" rows={2} />
          </Panel>
        </div>
        <div className="space-y-space-lg">
          <Panel title="Customer">
            <ProInput name="name" label="Name" />
            <ProInput name="phone" label="Mobile number" placeholder="01XXXXXXXXX" />
            <ProInput name="email" label="Email (optional)" type="email" />
            <ProSelect
              name="locale"
              label="Customer language"
              description="Used for the customer's emails and order page."
              options={[
                { value: "bn", label: "Bangla" },
                { value: "en", label: "English" },
              ]}
            />
          </Panel>
          <Panel title="Price">
            <ProInput name="couponCode" label="Coupon code (optional)" className="uppercase" />
            <ProInput
              name="shippingFee"
              label="Delivery fee override (৳)"
              numeric="nullable"
              min={0}
              description="Leave empty to use the zone fee. 0 = free / pickup."
            />
            <p className="text-body-sm text-on-surface-variant">Payment: cash on delivery.</p>
            <ProSubmit className="w-full">Create order</ProSubmit>
          </Panel>
        </div>
      </div>
    </ProForm>
  );
}

function DistrictSelect() {
  const division = useWatch({ name: "division" }) as string;
  return (
    <ProSelect
      name="district"
      label="District"
      placeholder={division ? "Select" : "Choose a division first"}
      options={districtsOf(division).map((d) => ({ value: d.code, label: d.name.en }))}
    />
  );
}
