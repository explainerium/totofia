import type { ReactNode } from "react";
import "./globals.css";

// The storefront (`[locale]`) and the admin panel each render their own <html>.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
