import { describe, expect, it } from "vitest";
import { readOwned, resolutionUiSource } from "./harness";

describe("worktree ownership (conflicts)", () => {
  it("keeps Prisma persist out of the API route", () => {
    expect(readOwned("app/api/disputes/[id]/resolve/route.ts")).not.toMatch(/\bprisma\b/);
  });

  it("keeps persist out of the Resolution panel", () => {
    const source = resolutionUiSource();
    expect(source).not.toMatch(/from\s+["']@\/lib\/prisma["']/);
    expect(source).not.toMatch(/from\s+["']@\/lib\/disputes\/resolve["']/);
  });
});
