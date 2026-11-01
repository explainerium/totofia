import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StorefrontChrome } from "@/components/shared/StorefrontChrome";
import { cmsRoute } from "@/components/storefront/content/cms-page";
import { listPublishedPages } from "@/server/modules/content/page.service";

type Props = PageProps<"/[locale]/[...rest]">;

/** A page added in Admin → Pages without a route of its own (`/<slug>`), or null. */
async function pageSlug({ params }: Props) {
  const { rest } = await params;
  if (rest.length !== 1) return null;
  // Cached list: unknown paths don't each hit the database.
  const pages = await listPublishedPages();
  return pages.some((p) => p.slug === rest[0]) ? rest[0] : null;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const slug = await pageSlug(props);
  return slug ? cmsRoute(slug).generateMetadata(props) : {};
}

// Anything else goes to `[locale]/not-found.tsx` so the 404 is localized.
export default async function CatchAll(props: Props) {
  const slug = await pageSlug(props);
  if (!slug) notFound();
  const { CmsPage } = cmsRoute(slug);
  return (
    <StorefrontChrome>
      <CmsPage params={props.params} />
    </StorefrontChrome>
  );
}
