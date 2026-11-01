export type PriceInput = {
  price: number;
  salePrice: number | null;
  saleStartsAt: Date | null;
  saleEndsAt: Date | null;
};

export type EffectivePrice = {
  /** What the customer pays. */
  price: number;
  /** Regular price shown struck through while a sale is running, otherwise null. */
  compareAt: number | null;
};

/** A sale applies when salePrice is lower than price and `now` is inside the (optional) window. */
export function effectivePrice(v: PriceInput, now = new Date()): EffectivePrice {
  const onSale =
    v.salePrice !== null &&
    v.salePrice < v.price &&
    (!v.saleStartsAt || v.saleStartsAt <= now) &&
    (!v.saleEndsAt || v.saleEndsAt > now);

  return onSale ? { price: v.salePrice!, compareAt: v.price } : { price: v.price, compareAt: null };
}

/** Cheapest effective price across variants — what a product card shows ("from ৳..."). */
export function lowestPrice(variants: PriceInput[], now = new Date()): EffectivePrice | null {
  let best: EffectivePrice | null = null;
  for (const v of variants) {
    const p = effectivePrice(v, now);
    if (!best || p.price < best.price) best = p;
  }
  return best;
}
