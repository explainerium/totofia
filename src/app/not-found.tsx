import Link from "next/link";
import { fontVariables } from "@/lib/fonts";

// Only reached for paths outside the storefront (e.g. unknown /admin routes). Storefront 404s
// are rendered by `[locale]/not-found.tsx` in the visitor's language.
export default function GlobalNotFound() {
  return (
    <html lang="bn" className={fontVariables}>
      <body className="grid min-h-dvh place-items-center p-6 text-center">
        <div>
          <h1 className="text-headline-lg">৪০৪ — পেজটি পাওয়া যায়নি</h1>
          <Link href="/" className="mt-4 inline-block text-primary underline">
            হোমপেজে ফিরে যান
          </Link>
        </div>
      </body>
    </html>
  );
}
