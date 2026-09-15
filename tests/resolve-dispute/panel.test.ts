import { describe, expect, it } from "vitest";
import { resolutionUiSource } from "./harness";

describe("Resolution panel UI (agent 3)", () => {
  const source = resolutionUiSource();

  it("enables Accept credit and Decline", () => {
    expect(source).toMatch(/Accept credit/);
    expect(source).toMatch(/Decline/);
    expect(source).not.toMatch(/Not wired — Agent demo target/);
  });

  it("POSTs { action, reviewerNote } to the resolve route", () => {
    expect(source).toMatch(/fetch\s*\(/);
    expect(source).toMatch(/\/api\/disputes\//);
    expect(source).toMatch(/\/resolve/);
    expect(source).toMatch(/JSON\.stringify/);
    expect(source).toMatch(/reviewerNote/);
    expect(source).toMatch(/["']accept["']/);
    expect(source).toMatch(/["']decline["']/);
    expect(source).toMatch(/method:\s*["']POST["']/i);
  });

  it("does not call resolveDispute or Prisma from the panel", () => {
    expect(source).not.toMatch(/from\s+["']@\/lib\/disputes\/resolve["']/);
    expect(source).not.toMatch(/from\s+["']@\/lib\/prisma["']/);
  });
});
