import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { POST } from "@/app/api/disputes/[id]/resolve/route";
import { prisma } from "@/lib/prisma";
import { PLAN_PRICE_CENTS } from "@/lib/plans";
import {
  createTddDispute,
  deleteTddDisputes,
  readOwned,
  requireSeededScaleInvoice,
  restoreDsp1043,
} from "./harness";

const params = (id: string) => ({ params: Promise.resolve({ id }) });

function postResolve(id: string, body: unknown) {
  return POST(
    new Request(`http://127.0.0.1:43173/api/disputes/${id}/resolve`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
    params(id),
  );
}

describe("resolve API route (agent 2)", () => {
  const source = readOwned("app/api/disputes/[id]/resolve/route.ts");

  it("imports resolveDispute and does not inline Prisma persist", () => {
    expect(source).toMatch(/import\s*\{[^}]*resolveDispute[^}]*\}\s*from\s*["']@\/lib\/disputes\/resolve["']/);
    expect(source).not.toMatch(/\bprisma\b/);
  });

  it("returns 400 when action is not accept or decline", async () => {
    const response = await postResolve("dsp_1043", { action: "ACCEPTED", reviewerNote: "nope" });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "action must be accept or decline" });
  });

  it("does not return 200 when resolveDispute throws", async () => {
    const response = await postResolve("dsp_tdd_missing", {
      action: "decline",
      reviewerNote: "stub",
    });
    expect(response.status).not.toBe(200);
  });
});

describe("resolve API + helper (after apply)", () => {
  beforeAll(async () => {
    await requireSeededScaleInvoice();
  });

  afterEach(async () => {
    await deleteTddDisputes();
    await restoreDsp1043();
  });

  it("returns 200 { ok: true } and persists a capped accept", async () => {
    const id = "dsp_tdd_route_accept";
    await createTddDispute(id, 40_000);

    const response = await postResolve(id, {
      action: "accept",
      reviewerNote: "Route must call resolveDispute.",
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });

    const row = await prisma.dispute.findUniqueOrThrow({ where: { id } });
    expect(row.status).toBe("ACCEPTED");
    expect(row.reviewerNote).toBe("Route must call resolveDispute.");
    expect(row.suggestedCreditCents).toBe(PLAN_PRICE_CENTS.SCALE);
  });
});
