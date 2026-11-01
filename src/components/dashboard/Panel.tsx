import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** White card section used to group form fields and tables. */
export function Panel({
  title,
  description,
  actions,
  className,
  children,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "space-y-space-md rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-space-md md:p-space-lg",
        className,
      )}
    >
      {title || actions ? (
        <div className="flex flex-wrap items-start justify-between gap-space-sm">
          <div>
            {title ? <h2 className="text-headline-sm">{title}</h2> : null}
            {description ? (
              <p className="text-body-sm text-on-surface-variant">{description}</p>
            ) : null}
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}
