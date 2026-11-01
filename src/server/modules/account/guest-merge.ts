import "server-only";
import { prisma } from "../../db/prisma";
import { GUEST_TTL_MS } from "../../lib/guest-token";
import { MAX_LINE_QUANTITY } from "../cart/cart.schema";

/**
 * On sign-in/sign-up the guest cart becomes (or is merged into) the user's cart. Returns the token
 * the cart cookie should hold from now on, or null when the user has no cart at all.
 */
export async function mergeGuestCart(userId: string, guestToken: string | null) {
  const [guest, own] = await Promise.all([
    guestToken
      ? prisma.cart.findUnique({ where: { token: guestToken }, include: { items: true } })
      : null,
    prisma.cart.findFirst({ where: { userId }, orderBy: { updatedAt: "desc" } }),
  ]);
  const expiresAt = new Date(Date.now() + GUEST_TTL_MS);

  if (guest && (!own || guest.id === own.id)) {
    await prisma.cart.update({ where: { id: guest.id }, data: { userId, expiresAt } });
    return guest.token;
  }
  if (!own) return null;

  if (guest) {
    await prisma.$transaction(async (tx) => {
      for (const item of guest.items) {
        const existing = await tx.cartItem.findUnique({
          where: { cartId_variantId: { cartId: own.id, variantId: item.variantId } },
        });
        await tx.cartItem.upsert({
          where: { cartId_variantId: { cartId: own.id, variantId: item.variantId } },
          create: { cartId: own.id, variantId: item.variantId, quantity: item.quantity },
          update: {
            quantity: Math.min(MAX_LINE_QUANTITY, (existing?.quantity ?? 0) + item.quantity),
          },
        });
      }
      await tx.cart.update({
        where: { id: own.id },
        data: { expiresAt, couponCode: guest.couponCode ?? own.couponCode },
      });
      await tx.cart.delete({ where: { id: guest.id } });
    });
  } else {
    await prisma.cart.update({ where: { id: own.id }, data: { expiresAt } });
  }
  return own.token;
}

/** Same idea for the wishlist: union of both lists. */
export async function mergeGuestWishlist(userId: string, guestToken: string | null) {
  const [guest, own] = await Promise.all([
    guestToken
      ? prisma.wishlist.findUnique({ where: { token: guestToken }, include: { items: true } })
      : null,
    prisma.wishlist.findFirst({ where: { userId } }),
  ]);

  if (guest && (!own || guest.id === own.id)) {
    await prisma.wishlist.update({ where: { id: guest.id }, data: { userId } });
    return guest.token;
  }
  if (!own) return null;

  if (guest) {
    await prisma.$transaction([
      prisma.wishlistItem.createMany({
        data: guest.items.map((i) => ({ wishlistId: own.id, productId: i.productId })),
        skipDuplicates: true,
      }),
      prisma.wishlist.delete({ where: { id: guest.id } }),
    ]);
  }
  return own.token;
}
