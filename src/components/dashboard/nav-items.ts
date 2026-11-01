import {
  CreditCard,
  FileText,
  FolderTree,
  GalleryHorizontal,
  LayoutDashboard,
  Mail,
  MessageSquareText,
  Package,
  ReceiptText,
  Settings,
  SlidersHorizontal,
  Star,
  TicketPercent,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

/** `badge` names a live counter shown next to the item (see Sidebar). */
export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: "unreadMessages" | "pendingReviews";
};
export type NavGroup = { label: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/admin/dashboard/overview", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Sales",
    items: [
      { href: "/admin/dashboard/orders", label: "Orders", icon: ReceiptText },
      { href: "/admin/dashboard/customers", label: "Customers", icon: Users },
      { href: "/admin/dashboard/coupons", label: "Coupons", icon: TicketPercent },
      { href: "/admin/dashboard/shipping", label: "Shipping zones", icon: Truck },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/dashboard/products", label: "Products", icon: Package },
      { href: "/admin/dashboard/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/dashboard/attributes", label: "Attributes", icon: SlidersHorizontal },
      { href: "/admin/dashboard/reviews", label: "Reviews", icon: Star, badge: "pendingReviews" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/dashboard/pages", label: "Pages", icon: FileText },
      { href: "/admin/dashboard/banners", label: "Banners", icon: GalleryHorizontal },
    ],
  },
  {
    label: "Inbox",
    items: [
      {
        href: "/admin/dashboard/messages",
        label: "Messages",
        icon: MessageSquareText,
        badge: "unreadMessages",
      },
      { href: "/admin/dashboard/newsletter", label: "Newsletter", icon: Mail },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/admin/dashboard/settings", label: "Settings", icon: Settings },
      { href: "/admin/dashboard/settings/payments", label: "Payments", icon: CreditCard },
    ],
  },
];
