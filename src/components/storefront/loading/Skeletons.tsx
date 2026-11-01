import { getTranslations } from "next-intl/server";
import { Skeleton } from "@/components/ui/skeleton";

/** Screen-reader text for loading states (in the page language). */
async function LoadingLabel() {
  const t = await getTranslations("Loading");
  return (
    <span role="status" className="sr-only">
      {t("label")}
    </span>
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-space-sm p-space-md">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </div>
  );
}

/** Shop / category / age / search listing. */
export async function ListingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-shop px-margin-sm py-space-lg md:px-gutter">
      <LoadingLabel />
      <Skeleton className="mb-space-md h-4 w-40" />
      <Skeleton className="mb-space-lg h-9 w-64" />
      <div className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
        <div className="hidden space-y-space-sm lg:col-span-3 lg:block">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-space-sm sm:gap-space-lg lg:col-span-9 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Product detail page. */
export async function ProductSkeleton() {
  return (
    <div className="mx-auto w-full max-w-shop px-margin-sm py-space-lg md:px-gutter">
      <LoadingLabel />
      <Skeleton className="mb-space-md h-4 w-56" />
      <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-2 lg:gap-space-xl">
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <div className="space-y-space-md">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-space-sm">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/** Account pages (content area next to the account nav). */
export async function AccountSkeleton() {
  return (
    <div className="space-y-space-md">
      <LoadingLabel />
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}
