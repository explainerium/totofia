import { z } from "zod";

export const MAX_LINE_QUANTITY = 10;

export const addItemInput = z.object({
  variantId: z.uuid(),
  quantity: z.coerce.number().int().min(1).max(MAX_LINE_QUANTITY).default(1),
});

export const setQuantityInput = z.object({
  quantity: z.coerce.number().int().min(0).max(MAX_LINE_QUANTITY),
});

export const couponInput = z.object({ code: z.string().trim().min(1).max(40) });

export const variantParams = z.object({ variantId: z.uuid() });
