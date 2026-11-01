/**
 * Development seed: sample categories, size/color attributes, products (bn + en), shipping zones
 * coupons, CMS pages and a promo banner. Orders, users and messages are kept.
 * Run with `npm run db:seed`. Wipes the catalog first — never runs in production.
 * Images in ./images are sample photos from the design export.
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/server/db/prisma";
import {
  createAttribute,
  createAttributeValue,
} from "@/server/modules/attribute/attribute.service";
import { createCategory } from "@/server/modules/category/category.service";
import { uploadImage } from "@/server/modules/media/media.service";
import { createProduct } from "@/server/modules/product/product.service";
import { couponAdminInput } from "@/server/modules/coupon/coupon.schema";
import { createCoupon } from "@/server/modules/coupon/coupon.service";
import { createZone } from "@/server/modules/shipping/shipping.service";
import { createBanner } from "@/server/modules/content/banner.service";
import { createPage } from "@/server/modules/content/page.service";
import { pages } from "./pages";
import { categories, colors, coupons, products, shippingZones, sizes } from "./data";

if (process.env.NODE_ENV === "production") throw new Error("Refusing to seed in production");

const imageDir = path.join(process.cwd(), "prisma", "seed", "images");
const uploaded = new Map<string, string>();

async function image(name: string): Promise<string> {
  const cached = uploaded.get(name);
  if (cached) return cached;
  const buffer = await readFile(path.join(imageDir, `${name}.jpg`));
  const asset = await uploadImage(
    new File([new Uint8Array(buffer)], `${name}.jpg`, { type: "image/jpeg" }),
  );
  uploaded.set(name, asset.id);
  return asset.id;
}

async function main() {
  console.log("Wiping catalog…");
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.attribute.deleteMany();
  await prisma.asset.deleteMany();

  console.log("Attributes…");
  const valueIds = new Map<string, string>();
  for (const [code, name, values] of [
    ["size", { bn: "সাইজ", en: "Size" }, sizes],
    ["color", { bn: "রং", en: "Color" }, colors],
  ] as const) {
    const attribute = await createAttribute({ code, sortOrder: code === "size" ? 0 : 1, name });
    let latest = attribute;
    for (const [i, v] of values.entries()) {
      latest = await createAttributeValue(attribute.id, {
        code: v.code,
        sortOrder: i,
        colorHex: "hex" in v ? v.hex : null,
        label: v.label,
      });
    }
    for (const v of latest.values) valueIds.set(`${code}:${v.code}`, v.id);
  }

  console.log("Categories…");
  const categoryIds = new Map<string, string>();
  for (const [i, c] of categories.entries()) {
    const created = await createCategory({
      slug: c.slug,
      parentId: null,
      imageId: await image(c.image),
      sortOrder: i,
      isHidden: false,
      translations: {
        bn: {
          name: c.name.bn,
          description: c.description.bn,
          metaTitle: undefined,
          metaDescription: undefined,
        },
        en: {
          name: c.name.en,
          description: c.description.en,
          metaTitle: undefined,
          metaDescription: undefined,
        },
      },
    });
    categoryIds.set(c.slug, created.id);
  }

  console.log("Products…");
  for (const p of products) {
    const images = [];
    for (const name of p.images)
      images.push({ assetId: await image(name), altBn: undefined, altEn: undefined });

    await createProduct({
      status: "PUBLISHED",
      slug: p.slug,
      ageMinMonths: p.age?.[0] ?? null,
      ageMaxMonths: p.age?.[1] ?? null,
      isFeatured: p.featured ?? false,
      badges: p.badges ?? [],
      categoryIds: p.categories.map((slug) => categoryIds.get(slug)!),
      images,
      translations: {
        bn: { ...p.text.bn, metaTitle: undefined, metaDescription: undefined },
        en: { ...p.text.en, metaTitle: undefined, metaDescription: undefined },
      },
      variants: p.variants.map(([size, stock]) => ({
        sku: `TF-${p.sku}-${size}`.toUpperCase(),
        price: p.price,
        salePrice: p.salePrice ?? null,
        saleStartsAt: null,
        saleEndsAt: null,
        stock,
        weightGrams: null,
        isActive: true,
        attributeValueIds: [valueIds.get(`size:${size}`)!, valueIds.get(`color:${p.color}`)!],
      })),
    });
  }

  console.log("Shipping zones & coupons…");
  await prisma.shippingZone.deleteMany();
  for (const zone of shippingZones) await createZone(zone);
  await prisma.coupon.deleteMany();
  for (const coupon of coupons) await createCoupon(couponAdminInput.parse(coupon));

  console.log("Pages & banners…");
  await prisma.page.deleteMany();
  for (const p of pages) {
    await createPage({
      slug: p.slug,
      isPublished: true,
      translations: {
        bn: { ...p.bn, metaTitle: undefined, metaDescription: undefined },
        en: { ...p.en, metaTitle: undefined, metaDescription: undefined },
      },
    });
  }
  await prisma.banner.deleteMany();
  await createBanner({
    placement: "HOME_PROMO",
    imageId: await image("organic-essentials-set"),
    titleBn: "প্রথম অর্ডারে ১০% ছাড়",
    titleEn: "10% off your first order",
    subtitleBn: "চেকআউটে WELCOME10 কোড ব্যবহার করুন (১,০০০ টাকার বেশি অর্ডারে)।",
    subtitleEn: "Use code WELCOME10 at checkout (orders over ৳1,000).",
    ctaLabelBn: "কেনাকাটা শুরু করুন",
    ctaLabelEn: "Start shopping",
    link: "/shop",
    sortOrder: 0,
    startsAt: null,
    endsAt: null,
    isActive: true,
  });

  console.log(
    `Done — ${categories.length} categories, ${products.length} products, ` +
      `${shippingZones.length} shipping zones, ${coupons.length} coupons, ${pages.length} pages.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
