import { describe, expect, it } from "vitest";
import { GET as getBoard } from "@/app/api/companyticket/board/route";
import { GET as getSprints } from "@/app/api/companyticket/sprints/route";
import { GET as listTickets } from "@/app/api/companyticket/tickets/route";
import { GET as getTicket } from "@/app/api/companyticket/tickets/[key]/route";

const ticketParams = (key: string) => ({ params: Promise.resolve({ key }) });

describe("companyticket HTTP API", () => {
  it("lists the three Fieldnote 26.8 sprint tickets", async () => {
    const response = await listTickets(
      new Request("http://127.0.0.1:43173/api/companyticket/tickets?sprintId=spr_268"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.count).toBe(3);
    expect(body.tickets.map((ticket: { key: string }) => ticket.key)).toEqual(["LY-001", "LY-002", "LY-003"]);
  });

  it("fetches LY-003 by key", async () => {
    const response = await getTicket(
      new Request("http://127.0.0.1:43173/api/companyticket/tickets/LY-003"),
      ticketParams("LY-003"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.key).toBe("LY-003");
    expect(body.summary).toContain("Overdue / Needs review");
    expect(body.ledgerlyUrls).toEqual([
      "http://127.0.0.1:43173/invoices",
      "http://127.0.0.1:43173/disputes",
    ]);
  });

  it("returns 404 for an unknown ticket key", async () => {
    const response = await getTicket(
      new Request("http://127.0.0.1:43173/api/companyticket/tickets/LY-999"),
      ticketParams("LY-999"),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Ticket not found: LY-999" });
  });

  it("returns the active sprint board", async () => {
    const response = await getBoard();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.sprint.id).toBe("spr_268");
    expect(body.sprint.name).toBe("Fieldnote 26.8");
    expect(body.columns[0].tickets.map((ticket: { key: string }) => ticket.key)).toEqual(["LY-001", "LY-003"]);
    expect(body.columns[1].tickets.map((ticket: { key: string }) => ticket.key)).toEqual(["LY-002"]);
  });

  it("lists sprints", async () => {
    const response = await getSprints();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.project.keyScheme).toBe("LY-000");
    expect(body.sprints.map((sprint: { id: string }) => sprint.id)).toEqual(["spr_268"]);
  });
});
