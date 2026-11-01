import type { ReactNode } from "react";

/** Centered card used by the sign-in / register / password pages. */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md px-margin-sm py-space-xl md:py-16">
      <div className="space-y-space-lg rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-space-lg shadow-card-hover md:p-space-xl">
        <div className="space-y-space-xs">
          <h1 className="font-heading text-headline-md text-on-surface">{title}</h1>
          {subtitle ? <p className="text-body-md text-on-surface-variant">{subtitle}</p> : null}
        </div>
        {children}
      </div>
      {footer ? <div className="mt-space-md text-center text-body-md">{footer}</div> : null}
    </div>
  );
}

export function FormAlert({
  tone = "error",
  children,
}: {
  tone?: "error" | "success";
  children: ReactNode;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "error"
          ? "rounded-lg bg-error-container px-space-md py-space-sm text-body-sm text-on-error-container"
          : "rounded-lg bg-secondary-fixed/30 px-space-md py-space-sm text-body-sm text-on-secondary-fixed-variant"
      }
    >
      {children}
    </p>
  );
}
