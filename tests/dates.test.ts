import { describe, expect, it } from "vitest";
import { DEMO_AS_OF, demoDay } from "@/lib/clock";
import { daysBetween, formatDate } from "@/lib/dates";

describe("formatDate", () => {
  it("prints the UTC calendar day for invoice dates", () => {
    expect(formatDate(DEMO_AS_OF)).toBe("Aug 23, 2026");
    expect(formatDate("2026-08-24T02:00:00.000Z")).toBe("Aug 24, 2026");
    expect(formatDate(demoDay("2026-01-05"))).toBe("Jan 5, 2026");
  });
});

describe("daysBetween", () => {
  it("counts whole demo-clock days and rounds a partial day to the nearest day", () => {
    expect(daysBetween(DEMO_AS_OF, demoDay("2026-08-13"))).toBe(10);
    expect(daysBetween(DEMO_AS_OF, DEMO_AS_OF)).toBe(0);
    expect(daysBetween(demoDay("2026-08-13"), DEMO_AS_OF)).toBe(-10);
    expect(
      daysBetween(new Date("2026-08-24T00:00:00.000Z"), new Date("2026-08-23T12:00:00.000Z")),
    ).toBe(1);
  });
});
