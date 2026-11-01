import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
import { AGE_RANGES } from "@/server/domain/catalog/age-ranges";
import { listCategorySlugs, listPublishedSlugs } from "@/server/modules/catalog/catalog.service";
import { RESERVED_PAGE_SLUGS } from "@/server/modules/content/content.schema";
import { listPublishedPages } from "@/server/modules/content/page.service";

// Rendered on request (no DB needed at build time); crawlers fetch it rarely.
export const dynamic = "force-dynamic";

type Entry = MetadataRoute.Sitemap[number];

/** One entry per page: Bangla URL (default, no prefix) with bn/en alternates. */
function entry(path: string, lastModified?: Date, priority = 0.5): Entry {
  const bn = siteUrl(path === "/" ? "/" : path);
  const en = siteUrl(path === "/" ? "/en" : `/en${path}`);
  return {
    url: bn,
    lastModified,
    priority,
    alternates: { languages: { bn, en, "x-default": bn } },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, pages] = await Promise.all([
    listPublishedSlugs(),
    listCategorySlugs(),
    listPublishedPages(),
  ]);

  // Slugs are shared by both languages, so one entry per product is enough.
  const productEntries = new Map<string, Entry>();
  for (const p of products) {
    if (!productEntries.has(p.slug)) {
      productEntries.set(p.slug, entry(`/product/${p.slug}`, p.product.updatedAt, 0.8));
    }
  }

  return [
    entry("/", undefined, 1),
    entry("/shop", undefined, 0.9),
    entry("/contact", undefined, 0.3),
    ...AGE_RANGES.map((r) => entry(`/age/${r.code}`, undefined, 0.6)),
    ...categories.map((c) => entry(`/category/${c.slug}`, c.category.updatedAt, 0.7)),
    ...productEntries.values(),
    // Pages saved before slugs were checked could sit under a real route (not reachable).
    ...pages
      .filter((p) => !RESERVED_PAGE_SLUGS.includes(p.slug))
      .map((p) => entry(`/${p.slug}`, new Date(p.updatedAt), 0.3)),
  ];
}
