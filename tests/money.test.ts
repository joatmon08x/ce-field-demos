import { describe, expect, it } from "vitest";
import { formatUsd, sumCents } from "@/lib/money";

describe("formatUsd", () => {
  it("formats catalog prices from cents", () => {
    expect(formatUsd(4900)).toBe("$49.00");
    expect(formatUsd(9900)).toBe("$99.00");
    expect(formatUsd(24900)).toBe("$249.00");
  });
});

describe("sumCents", () => {
  it("adds invoice totals without inventing a unit", () => {
    expect(sumCents([4900, 9900, 24900])).toBe(39700);
  });
});
