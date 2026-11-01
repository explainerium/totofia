import { describe, expect, it } from "vitest";
import {
  canTransition,
  marksCodPaidOn,
  NEXT_STATUSES,
  releasesCouponOn,
  restocksOn,
} from "@/server/domain/order/transitions";

describe("order transitions", () => {
  it("follows the fulfilment path", () => {
    expect(canTransition("PENDING", "CONFIRMED")).toBe(true);
    expect(canTransition("CONFIRMED", "PROCESSING")).toBe(true);
    expect(canTransition("PROCESSING", "SHIPPED")).toBe(true);
    expect(canTransition("SHIPPED", "DELIVERED")).toBe(true);
  });
  it("cannot skip steps or go backwards", () => {
    expect(canTransition("PENDING", "SHIPPED")).toBe(false);
    expect(canTransition("DELIVERED", "PENDING")).toBe(false);
    expect(canTransition("SHIPPED", "CANCELLED")).toBe(false);
  });
  it("treats cancelled and returned as final", () => {
    expect(NEXT_STATUSES.CANCELLED).toEqual([]);
    expect(NEXT_STATUSES.RETURNED).toEqual([]);
  });
  it("restocks on cancel and return only", () => {
    expect(restocksOn("CANCELLED")).toBe(true);
    expect(restocksOn("RETURNED")).toBe(true);
    expect(restocksOn("DELIVERED")).toBe(false);
  });
  it("releases coupons only on cancel and marks COD paid on delivery", () => {
    expect(releasesCouponOn("CANCELLED")).toBe(true);
    expect(releasesCouponOn("RETURNED")).toBe(false);
    expect(marksCodPaidOn("DELIVERED")).toBe(true);
  });
});
