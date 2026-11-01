"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-space-xs rounded-full bg-primary px-space-lg py-2.5 text-label-lg text-on-primary hover:bg-primary-container print:hidden"
    >
      <Printer className="size-4" aria-hidden />
      {label}
    </button>
  );
}
