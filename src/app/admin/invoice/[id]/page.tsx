import { notFound, redirect } from "next/navigation";
import { LogoMark } from "@/components/shared/LogoMark";
import { formatDate, formatPrice } from "@/lib/format/intl";
import { DIVISIONS, findDistrict, type DivisionCode } from "@/lib/geo/bd";
import { getSessionUser, isStaff } from "@/server/auth/session";
import { getAdminOrder } from "@/server/modules/order/order.service";
import { getStoreSettings } from "@/server/modules/setting/setting.service";
import { PrintButton } from "./PrintButton";

export const metadata = { title: "Invoice" };

const price = (v: number) => formatPrice(v, "en");

// Printable A4 invoice, outside the dashboard chrome. Browser print keeps Bangla text shaping intact.
export default async function InvoicePage({ params }: PageProps<"/admin/invoice/[id]">) {
  if (!isStaff(await getSessionUser())) redirect("/admin/login");
  const { id } = await params;
  const [order, store] = await Promise.all([
    getAdminOrder(id).catch(() => null),
    getStoreSettings(),
  ]);
  if (!order) notFound();
  const a = order.address;

  return (
    <main className="mx-auto max-w-[210mm] bg-white p-10 text-body-md text-on-surface print:p-0">
      <style>{`@page { size: A4; margin: 14mm; } @media print { body { background: white; } }`}</style>
      <div className="mb-8 flex items-start justify-between gap-6">
        <div className="flex items-center gap-3">
          <LogoMark className="size-12" />
          <div>
            <p className="font-heading text-headline-sm font-bold text-primary">Totofia</p>
            <p className="text-body-sm text-on-surface-variant">Baby &amp; Toddler</p>
          </div>
        </div>
        <div className="text-right text-body-sm text-on-surface-variant">
          {store.addressEn ? <p>{store.addressEn}</p> : null}
          {store.phone ? <p>{store.phone}</p> : null}
          {store.email ? <p>{store.email}</p> : null}
        </div>
      </div>

      <div className="mb-8 flex flex-wrap justify-between gap-6">
        <div>
          <h1 className="text-headline-md">Invoice #{order.number}</h1>
          <p className="text-body-sm text-on-surface-variant">
            Date: {formatDate(order.createdAt, "en", "long")}
          </p>
        </div>
        <div className="text-body-sm">
          <p className="text-label-md text-on-surface-variant">Bill &amp; deliver to</p>
          <p className="font-medium">{a?.name ?? order.customerName}</p>
          <p>{a?.phone ?? order.customerPhone}</p>
          {a ? (
            <p>
              {a.addressLine}, {a.area}
              <br />
              {findDistrict(a.district)?.name.en ?? a.district},{" "}
              {DIVISIONS[a.division as DivisionCode]?.en ?? a.division}
            </p>
          ) : null}
        </div>
      </div>

      <table className="w-full border-collapse text-body-sm">
        <thead>
          <tr className="border-b-2 border-on-surface text-left">
            <th className="py-2">Item</th>
            <th className="py-2">SKU</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-right">Unit price</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.sku} className="border-b border-outline-variant">
              <td className="py-2">
                {item.nameEn}
                <div className="text-label-sm text-on-surface-variant">{item.variantLabel}</div>
              </td>
              <td className="py-2 font-mono">{item.sku}</td>
              <td className="py-2 text-right">{item.quantity}</td>
              <td className="py-2 text-right">{price(item.unitPrice)}</td>
              <td className="py-2 text-right">{price(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="mt-4 ml-auto grid w-64 grid-cols-[1fr_auto] gap-y-1 text-body-sm">
        <dt>Subtotal</dt>
        <dd className="text-right">{price(order.subtotal)}</dd>
        {order.discount > 0 ? (
          <>
            <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt>
            <dd className="text-right">−{price(order.discount)}</dd>
          </>
        ) : null}
        <dt>Delivery</dt>
        <dd className="text-right">
          {order.shippingFee === 0 ? "Free" : price(order.shippingFee)}
        </dd>
        <dt className="border-t border-on-surface pt-1 font-semibold">Total</dt>
        <dd className="border-t border-on-surface pt-1 text-right font-semibold">
          {price(order.grandTotal)}
        </dd>
      </dl>

      <p className="mt-8 text-body-sm">
        Payment: {order.paymentMethod === "COD" ? "Cash on delivery" : order.paymentMethod} ·{" "}
        {order.paymentStatus.toLowerCase()}
      </p>
      <p className="mt-2 text-body-sm text-on-surface-variant">
        Thank you for shopping with Totofia!
      </p>

      <div className="mt-10 print:hidden">
        <PrintButton />
      </div>
    </main>
  );
}
