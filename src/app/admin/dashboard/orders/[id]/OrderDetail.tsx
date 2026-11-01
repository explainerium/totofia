"use client";

import { ExternalLink, Printer } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatPrice } from "@/lib/format/intl";
import { DIVISIONS, findDistrict, type DivisionCode } from "@/lib/geo/bd";
import { useGetOrderQuery } from "@/redux/api/orderApi";
import { statusVariant } from "../_components/order-labels";
import { OrderActions } from "./_components/OrderActions";
import { OrderHistory } from "./_components/OrderHistory";
import { OrderNotes } from "./_components/OrderNotes";
import { OnlinePaymentsPanel } from "./_components/OnlinePaymentsPanel";
import { PaymentPanel } from "./_components/PaymentPanel";

const price = (v: number) => formatPrice(v, "en");

export function OrderDetail({ id }: { id: string }) {
  const { data: order, isError } = useGetOrderQuery(id);

  if (isError) return <p>Order not found.</p>;
  if (!order) return <Skeleton className="h-96 w-full" />;

  const address = order.address;
  const customerPath = `${order.locale === "en" ? "/en" : ""}/order/${order.number}?token=${order.guestAccessToken}`;

  return (
    <>
      <PageHeader
        backHref="/admin/dashboard/orders"
        title={
          <span className="flex flex-wrap items-center gap-space-sm">
            Order #{order.number}
            <Badge variant={statusVariant[order.status]}>{order.status.toLowerCase()}</Badge>
            {order.source === "ADMIN" ? <Badge variant="outline">phone order</Badge> : null}
          </span>
        }
        description={`Placed ${formatDate(order.createdAt, "en", "medium")} · customer language: ${order.locale === "bn" ? "Bangla" : "English"}`}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <a href={customerPath} target="_blank" rel="noreferrer">
                Customer view <ExternalLink />
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`/admin/invoice/${order.id}`} target="_blank" rel="noreferrer">
                <Printer /> Print invoice
              </a>
            </Button>
          </>
        }
      />

      <OrderActions order={order} />

      <div className="mt-space-lg grid gap-space-lg lg:grid-cols-[1fr_320px]">
        <div className="space-y-space-lg">
          <Panel title="Items">
            <ul className="divide-y divide-outline-variant/50">
              {order.items.map((item) => (
                <li key={item.sku} className="flex items-center gap-space-md py-space-sm">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                    <img src={item.image} alt="" className="size-12 rounded-lg object-cover" />
                  ) : null}
                  <div className="flex-1">
                    <p className="font-medium">{item.nameEn}</p>
                    <p className="text-body-sm text-on-surface-variant">
                      {item.variantLabel} · <span className="font-mono">{item.sku}</span>
                    </p>
                  </div>
                  <div className="text-right text-body-sm">
                    {item.quantity} × {price(item.unitPrice)}
                    <div className="font-semibold">{price(item.lineTotal)}</div>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="grid grid-cols-[1fr_auto] gap-y-1 border-t border-outline-variant/50 pt-space-sm text-body-md">
              <dt>Subtotal</dt>
              <dd className="text-right">{price(order.subtotal)}</dd>
              {order.discount > 0 ? (
                <>
                  <dt>Discount {order.couponCode ? `(${order.couponCode})` : ""}</dt>
                  <dd className="text-right">−{price(order.discount)}</dd>
                </>
              ) : null}
              <dt>Delivery ({order.shippingZoneCode})</dt>
              <dd className="text-right">
                {order.shippingFee === 0 ? "Free" : price(order.shippingFee)}
              </dd>
              <dt className="font-semibold">Total</dt>
              <dd className="text-right font-semibold">{price(order.grandTotal)}</dd>
            </dl>
          </Panel>
          <OnlinePaymentsPanel order={order} />
          <OrderNotes order={order} />
          <OrderHistory order={order} />
        </div>

        <div className="space-y-space-lg">
          <Panel title="Customer">
            <p className="font-medium">{order.customerName}</p>
            <p className="text-body-sm">{order.customerPhone}</p>
            {order.customerEmail ? <p className="text-body-sm">{order.customerEmail}</p> : null}
            {order.account ? (
              <Link
                href={`/admin/dashboard/customers/${order.account.id}`}
                className="text-body-sm text-primary hover:underline"
              >
                View customer account
              </Link>
            ) : (
              <p className="text-body-sm text-on-surface-variant">Guest order</p>
            )}
            {order.note ? (
              <p className="rounded-lg bg-surface-container p-space-sm text-body-sm">
                Customer note: {order.note}
              </p>
            ) : null}
          </Panel>
          {address ? (
            <Panel title="Delivery address">
              <p className="text-body-sm">
                {address.name}, {address.phone}
                <br />
                {address.addressLine}
                <br />
                {address.area}, {findDistrict(address.district)?.name.en ?? address.district},{" "}
                {DIVISIONS[address.division as DivisionCode]?.en ?? address.division}
              </p>
              {order.courierName || order.trackingCode ? (
                <p className="text-body-sm">
                  Courier: <span className="font-medium">{order.courierName ?? "—"}</span>
                  {order.trackingCode ? (
                    <>
                      {" "}
                      · Tracking <span className="font-mono">{order.trackingCode}</span>
                    </>
                  ) : null}
                </p>
              ) : null}
            </Panel>
          ) : null}
          <PaymentPanel order={order} />
        </div>
      </div>
    </>
  );
}
