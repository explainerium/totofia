import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Eyebrow + title (+ optional body / action) used by the home page sections. */
export function SectionHeading({
  eyebrow,
  title,
  body,
  action,
  center,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  action?: ReactNode;
  center?: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-space-lg flex flex-col gap-space-sm",
        center ? "mx-auto max-w-xl text-center" : "md:flex-row md:items-end md:justify-between",
      )}
    >
      <div>
        <p className="text-label-sm tracking-wider text-primary uppercase">{eyebrow}</p>
        <h2 className="mt-1 text-headline-lg-mobile font-bold text-on-surface md:text-headline-lg">
          {title}
        </h2>
        {center && body ? (
          <p className="mt-2 text-body-md text-on-surface-variant">{body}</p>
        ) : null}
      </div>
      {!center && body ? (
        <p className="max-w-md text-body-md text-on-surface-variant">{body}</p>
      ) : null}
      {action}
    </div>
  );
}
