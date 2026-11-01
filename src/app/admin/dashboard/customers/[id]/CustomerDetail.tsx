"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useAdminUser } from "@/components/dashboard/AdminUserContext";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Panel } from "@/components/dashboard/Panel";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiError } from "@/lib/api/axios";
import { formatDate, formatPrice } from "@/lib/format/intl";
import { findDistrict } from "@/lib/geo/bd";
import {
  useGetCustomerQuery,
  useSetCustomerBannedMutation,
  useSetCustomerRoleMutation,
} from "@/redux/api/customerApi";
import type { AdminCustomer } from "@/server/modules/customer/customer.service";
import { statusVariant } from "../../orders/_components/order-labels";

const fail = (e: unknown) => toast.error(isApiError(e) ? e.message : "Update failed.");

export function CustomerDetail({ id }: { id: string }) {
  const { data: customer, isError } = useGetCustomerQuery(id);
  const { user, isAdmin } = useAdminUser();

  if (isError) return <p>Account not found.</p>;
  if (!customer) return <Skeleton className="h-96 w-full" />;
  const isSelf = user?.email === customer.email;

  return (
    <>
      <PageHeader
        backHref="/admin/dashboard/customers"
        title={
          <span className="flex flex-wrap items-center gap-space-sm">
            {customer.name}
            {customer.role !== "CUSTOMER" ? (
              <Badge variant="secondary">{customer.role.toLowerCase()}</Badge>
            ) : null}
            {customer.banned ? <Badge variant="destructive">blocked</Badge> : null}
          </span>
        }
        description={`Joined ${formatDate(customer.createdAt, "en", "medium")} · emails in ${customer.locale === "bn" ? "Bangla" : "English"}`}
        actions={isSelf ? null : <BlockButton customer={customer} />}
      />
      <div className="grid gap-space-lg lg:grid-cols-[1fr_320px]">
        <div className="space-y-space-lg">
          <Panel title="Orders">
            {customer.orders.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">No orders yet.</p>
            ) : (
              <ul className="divide-y divide-outline-variant/50">
                {customer.orders.map((o) => (
                  <li key={o.id} className="flex items-center gap-space-sm py-2">
                    <Link
                      href={`/admin/dashboard/orders/${o.id}`}
                      className="font-semibold hover:text-primary"
                    >
                      #{o.number}
                    </Link>
                    <span className="flex-1 text-body-sm text-on-surface-variant">
                      {formatDate(o.createdAt, "en", "medium")}
                    </span>
                    <Badge variant={statusVariant[o.status]}>{o.status.toLowerCase()}</Badge>
                    <span className="w-24 text-right">{formatPrice(o.grandTotal, "en")}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title="Saved addresses">
            {customer.addresses.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">None.</p>
            ) : (
              <ul className="grid gap-space-sm sm:grid-cols-2">
                {customer.addresses.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-lg border border-outline-variant/50 p-space-sm text-body-sm"
                  >
                    {a.isDefault ? <Badge className="mb-1">default</Badge> : null}
                    <p className="font-medium">
                      {a.name}, {a.phone}
                    </p>
                    <p>
                      {a.addressLine}, {a.area}, {findDistrict(a.district)?.name.en ?? a.district}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
        <div className="space-y-space-lg">
          <Panel title="Contact">
            <p className="text-body-sm">{customer.email}</p>
            <p className="text-body-sm">{customer.phone ?? "No phone"}</p>
          </Panel>
          <Panel title="Stats" description="Excludes cancelled and returned orders.">
            <p className="text-headline-sm">{formatPrice(customer.totalSpent, "en")}</p>
            <p className="text-body-sm text-on-surface-variant">
              {customer.completedOrders} order{customer.completedOrders === 1 ? "" : "s"}
            </p>
          </Panel>
          {isAdmin && !isSelf ? <RolePanel customer={customer} /> : null}
        </div>
      </div>
    </>
  );
}

function BlockButton({ customer }: { customer: AdminCustomer }) {
  const [setBanned, { isLoading }] = useSetCustomerBannedMutation();
  const block = !customer.banned;
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={block ? "destructive" : "outline"} disabled={isLoading}>
          {block ? "Block account" : "Unblock account"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {block ? `Block ${customer.name}?` : `Unblock ${customer.name}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {block
              ? "They are signed out everywhere and cannot sign in. Guest checkout with their phone still works."
              : "They can sign in again."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={block ? "destructive" : "default"}
            onClick={() =>
              setBanned({ id: customer.id, banned: block })
                .unwrap()
                .then(() => toast.success(block ? "Account blocked." : "Account unblocked."), fail)
            }
          >
            {block ? "Block" : "Unblock"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function RolePanel({ customer }: { customer: AdminCustomer }) {
  const [setRole, { isLoading }] = useSetCustomerRoleMutation();
  return (
    <Panel
      title="Role"
      description="STAFF and ADMIN can open this admin panel. ADMIN can also change roles and settings. The user is signed out on change."
    >
      <Select
        value={customer.role}
        disabled={isLoading}
        onValueChange={(role) =>
          setRole({ id: customer.id, role: role as AdminCustomer["role"] })
            .unwrap()
            .then(() => toast.success("Role updated."), fail)
        }
      >
        <SelectTrigger className="w-full" aria-label="Role">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="CUSTOMER">Customer</SelectItem>
          <SelectItem value="STAFF">Staff</SelectItem>
          <SelectItem value="ADMIN">Admin</SelectItem>
        </SelectContent>
      </Select>
    </Panel>
  );
}
