import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  backHref?: string;
};

export function PageHeader({ title, description, actions, backHref }: PageHeaderProps) {
  return (
    <div className="mb-space-lg flex flex-wrap items-end justify-between gap-space-md">
      <div className="space-y-1">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-label-md text-on-surface-variant hover:text-primary"
          >
            <ArrowLeft className="size-3.5" /> Back
          </Link>
        ) : null}
        <h1 className="text-headline-md">{title}</h1>
        {description ? <p className="text-body-md text-on-surface-variant">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-space-sm">{actions}</div> : null}
    </div>
  );
}
