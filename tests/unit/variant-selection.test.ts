import { describe, expect, it } from "vitest";
import {
  initialSelection,
  matchVariant,
  selectValue,
  valueState,
} from "@/components/product/variant-selection";

// Sizes s1, s2, s3 × colors c1, c2. s1/c2 does not exist; s2/c1 is sold out.
const options = [
  { code: "size", values: [{ id: "s1" }, { id: "s2" }, { id: "s3" }] },
  { code: "color", values: [{ id: "c1" }, { id: "c2" }] },
];
const variants = [
  { id: "v1", valueIds: ["s1", "c1"], stock: 0 },
  { id: "v2", valueIds: ["s2", "c1"], stock: 0 },
  { id: "v3", valueIds: ["s2", "c2"], stock: 4 },
  { id: "v4", valueIds: ["s3", "c1"], stock: 2 },
];

describe("variant selection", () => {
  it("starts on the first in-stock variant", () => {
    expect(initialSelection(options, variants)).toEqual({ size: "s2", color: "c2" });
  });

  it("matches the variant for a full selection", () => {
    expect(matchVariant(options, variants, { size: "s3", color: "c1" })?.id).toBe("v4");
    expect(matchVariant(options, variants, { size: "s1", color: "c2" })).toBeNull();
    expect(matchVariant(options, variants, { size: "s1" })).toBeNull();
  });

  it("classifies values against the other selections", () => {
    const sel = { size: "s2", color: "c1" };
    expect(valueState(options, variants, sel, "size", "s1")).toBe("out");
    expect(valueState(options, variants, sel, "size", "s3")).toBe("ok");
    expect(valueState(options, variants, { size: "s1", color: "c2" }, "size", "s3")).toBe("swap");
    expect(valueState(options, variants, sel, "size", "s9")).toBe("none");
  });

  it("can reach a variant that shares no value with the current one", () => {
    // Blue-S, Blue-M, Red-L: from Blue-S, Red and L only exist together.
    const opts = [
      { code: "color", values: [{ id: "blue" }, { id: "red" }] },
      { code: "size", values: [{ id: "S" }, { id: "M" }, { id: "L" }] },
    ];
    const vars = [
      { id: "bs", valueIds: ["blue", "S"], stock: 1 },
      { id: "bm", valueIds: ["blue", "M"], stock: 1 },
      { id: "rl", valueIds: ["red", "L"], stock: 1 },
    ];
    const start = initialSelection(opts, vars);
    expect(valueState(opts, vars, start, "color", "red")).toBe("swap");
    const next = selectValue(opts, vars, start, "color", "red");
    expect(matchVariant(opts, vars, next)?.id).toBe("rl");
  });

  it("resets other options when a value does not combine", () => {
    // s1 only exists with c1
    expect(selectValue(options, variants, { size: "s2", color: "c2" }, "size", "s1")).toEqual({
      size: "s1",
      color: "c1",
    });
    // s3/c1 exists: plain change
    expect(selectValue(options, variants, { size: "s2", color: "c1" }, "size", "s3")).toEqual({
      size: "s3",
      color: "c1",
    });
  });

  it("handles products without options", () => {
    expect(initialSelection([], [{ id: "only", valueIds: [], stock: 1 }])).toEqual({});
    expect(matchVariant([], [{ id: "only", valueIds: [], stock: 1 }], {})?.id).toBe("only");
  });
});
