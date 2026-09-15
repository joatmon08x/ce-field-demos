/**
 * Mock CompanyTicket book — JIRA-shaped issues for the 201 MCP beat.
 * Keys use the LY-000 scheme (zero-padded). No real companies.
 */

export const TICKET_KEY_PATTERN = /^LY-\d{3}$/;

export type TicketType = "Story" | "Bug" | "Task";
export type TicketStatus = "Backlog" | "To Do" | "In Progress" | "Done";
export type TicketPriority = "Low" | "Medium" | "High";

export type TicketComment = {
  id: string;
  author: string;
  createdOn: string;
  body: string;
};

export type Ticket = {
  key: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  title: string;
  summary: string;
  description: string;
  acceptance: string[];
  sprintId: string | null;
  assignee: string;
  reporter: string;
  labels: string[];
  ledgerlyPaths: string[];
  ledgerlyUrls: string[];
  comments: TicketComment[];
};

export type Sprint = {
  id: string;
  name: string;
  state: "active" | "closed";
  goal: string;
  startOn: string;
  endOn: string;
};

export const COMPANYTICKET_PROJECT = {
  key: "LY",
  name: "CompanyTicket",
  workspace: "Fieldnote Workspace",
  keyScheme: "LY-000",
  operator: "Avery Quinn",
  catalogPricesUsd: ["$49", "$99", "$249"] as const,
  boardUrl: "http://127.0.0.1:43173/companyticket",
  ledgerlyUrl: "http://127.0.0.1:43173",
};

export const SPRINTS: readonly Sprint[] = [
  {
    id: "spr_268",
    name: "Fieldnote 26.8",
    state: "active",
    goal: "Give Grok Build three jumpable Ledgerly tickets on one sprint board.",
    startOn: "2026-08-17",
    endOn: "2026-08-28",
  },
];

export const TICKETS: readonly Ticket[] = [
  {
    key: "LY-001",
    type: "Story",
    status: "To Do",
    priority: "Medium",
    title: "Change customer email on invoice detail",
    summary: "Change customer email on invoice detail.",
    description:
      "Add a control on the invoice detail customer card so Avery Quinn can update the customer email. Do not implement email validation. Invoice amounts stay on the catalog: Starter $49, Growth $99, Scale $249.",
    acceptance: [
      "Invoice detail customer card can change the seeded contact email.",
      "No email-format validation is added.",
      "Customer names and .example addresses stay on the Fieldnote book.",
    ],
    sprintId: "spr_268",
    assignee: "Avery Quinn",
    reporter: "Avery Quinn",
    labels: ["invoices", "customer-card"],
    ledgerlyPaths: ["app/invoices/[id]/page.tsx"],
    ledgerlyUrls: ["http://127.0.0.1:43173/invoices"],
    comments: [
      {
        id: "cmt_ly001_1",
        author: "Avery Quinn",
        createdOn: "2026-08-18",
        body: "Matches the 101 Plan beat. Keep the change on the invoice detail customer card.",
      },
    ],
  },
  {
    key: "LY-002",
    type: "Bug",
    status: "In Progress",
    priority: "High",
    title: "Dispute dsp_1043 claims $400 against a $249 Scale invoice",
    summary: "Dispute dsp_1043 claims $400 against a $249 Scale invoice.",
    description:
      "Dispute dsp_1043 claims $400 against a $249 Scale invoice. Open http://127.0.0.1:43173/disputes/dsp_1043. The page still selects deprecated suggested-credit v1 and shows $400.00. v2, the domain helper, and the seed stored credit cap at the Scale catalog price of $249. Do not correct the $400 claim — it is valid input for the catalog cap. Preserve both v1 and v2 routes and tests/suggested-credit-api.test.ts.",
    acceptance: [
      "Client selects /api/v2/disputes/*/suggested-credit.",
      "dsp_1043 still stores a $400 claim against INV-1043 (Scale $249).",
      "v1 and v2 routes remain; tests/suggested-credit-api.test.ts is not edited to force green.",
    ],
    sprintId: "spr_268",
    assignee: "Avery Quinn",
    reporter: "Avery Quinn",
    labels: ["disputes", "suggested-credit"],
    ledgerlyPaths: [
      "lib/disputes/suggested-credit-api.ts",
      "app/disputes/[id]/page.tsx",
      "app/api/v1/disputes/[id]/suggested-credit/route.ts",
      "app/api/v2/disputes/[id]/suggested-credit/route.ts",
    ],
    ledgerlyUrls: ["http://127.0.0.1:43173/disputes/dsp_1043"],
    comments: [
      {
        id: "cmt_ly002_1",
        author: "Avery Quinn",
        createdOn: "2026-08-19",
        body: "The $400 figure is the claim, not a fourth catalog price. Scale stays $249.",
      },
    ],
  },
  {
    key: "LY-003",
    type: "Bug",
    status: "To Do",
    priority: "High",
    title: "Overdue / Needs review filter does not change the list",
    summary:
      "On http://127.0.0.1:43173/invoices (or /disputes), click Overdue / Needs review. The list does not change. All stays highlighted.",
    description:
      "On http://127.0.0.1:43173/invoices (or /disputes), click Overdue / Needs review. The list does not change. All stays highlighted. Reproduce on both list pages, then fix only the filter selection so one pill is active and the table or queue matches that status.",
    acceptance: [
      "On /invoices, Overdue shows only OVERDUE rows and only that pill is active.",
      "On /disputes, Needs review shows only NEEDS_REVIEW rows and only that pill is active.",
      "All still lists the full seeded book.",
    ],
    sprintId: "spr_268",
    assignee: "Avery Quinn",
    reporter: "Avery Quinn",
    labels: ["invoices", "disputes", "filters"],
    ledgerlyPaths: ["components/filter-pills.tsx", "app/invoices/page.tsx", "app/disputes/page.tsx"],
    ledgerlyUrls: ["http://127.0.0.1:43173/invoices", "http://127.0.0.1:43173/disputes"],
    comments: [
      {
        id: "cmt_ly003_1",
        author: "Avery Quinn",
        createdOn: "2026-08-20",
        body: "Same control on invoices (Overdue) and disputes (Needs review). Treat them as one filter bug.",
      },
    ],
  },
  {
    key: "LY-004",
    type: "Task",
    status: "Backlog",
    priority: "Low",
    title: "Draft a Tidewatch Logistics dunning note",
    summary: "Draft on-voice collection copy for the Tidewatch Logistics overdue folio.",
    description:
      "Use the draft-collection-email skill. Tidewatch Logistics is on the Fieldnote book. Do not invent a price; keep the folio on Starter $49, Growth $99, or Scale $249 as seeded.",
    acceptance: ["Copy names Tidewatch Logistics and stays inside the catalog."],
    sprintId: null,
    assignee: "Avery Quinn",
    reporter: "Avery Quinn",
    labels: ["collections"],
    ledgerlyPaths: ["app/collections/page.tsx"],
    ledgerlyUrls: ["http://127.0.0.1:43173/collections"],
    comments: [],
  },
  {
    key: "LY-005",
    type: "Task",
    status: "Backlog",
    priority: "Low",
    title: "Record Harborbill remittance window on Settings",
    summary: "Note the frozen 23 Aug 2026 clock on the settings description.",
    description:
      "Settings already has a Cmd-K TODO. Leave that seam unless a later ticket names it. This card is backlog filler only.",
    acceptance: ["No settings rewrite unless a later LY ticket asks for it."],
    sprintId: null,
    assignee: "Avery Quinn",
    reporter: "Avery Quinn",
    labels: ["settings"],
    ledgerlyPaths: ["app/settings/page.tsx"],
    ledgerlyUrls: ["http://127.0.0.1:43173/settings"],
    comments: [],
  },
];

export function isTicketKey(value: string): boolean {
  return TICKET_KEY_PATTERN.test(value.trim().toUpperCase());
}

export function normalizeTicketKey(value: string): string {
  return value.trim().toUpperCase();
}

export function getSprint(id: string) {
  return SPRINTS.find((sprint) => sprint.id === id) ?? null;
}

export function getActiveSprint() {
  return SPRINTS.find((sprint) => sprint.state === "active") ?? null;
}

export function listSprints() {
  return { project: COMPANYTICKET_PROJECT, sprints: SPRINTS };
}

export function getTicket(key: string) {
  const normalized = normalizeTicketKey(key);
  const ticket = TICKETS.find((entry) => entry.key === normalized) ?? null;
  if (!ticket) return null;
  return {
    ...ticket,
    sprint: ticket.sprintId ? getSprint(ticket.sprintId) : null,
    boardUrl: `${COMPANYTICKET_PROJECT.boardUrl}/${ticket.key}`,
  };
}

export function listTickets(opts: { sprintId?: string; status?: string; type?: string } = {}) {
  const tickets = TICKETS.filter((ticket) => {
    if (opts.sprintId === "none" && ticket.sprintId) return false;
    if (opts.sprintId && opts.sprintId !== "none" && ticket.sprintId !== opts.sprintId) return false;
    if (opts.status && ticket.status !== opts.status) return false;
    if (opts.type && ticket.type !== opts.type) return false;
    return true;
  });
  return {
    count: tickets.length,
    tickets: tickets.map((ticket) => ({
      key: ticket.key,
      type: ticket.type,
      status: ticket.status,
      priority: ticket.priority,
      title: ticket.title,
      summary: ticket.summary,
      sprintId: ticket.sprintId,
      assignee: ticket.assignee,
      labels: ticket.labels,
    })),
  };
}

export function listSprintBoard(sprintId?: string) {
  const sprint = sprintId ? getSprint(sprintId) : getActiveSprint();
  if (!sprint) return null;
  const cards = TICKETS.filter((ticket) => ticket.sprintId === sprint.id);
  const columns: TicketStatus[] = ["To Do", "In Progress", "Done"];
  return {
    project: COMPANYTICKET_PROJECT,
    sprint,
    columns: columns.map((status) => ({
      status,
      tickets: cards.filter((ticket) => ticket.status === status),
    })),
  };
}

export function listBacklog() {
  return {
    count: TICKETS.filter((ticket) => ticket.status === "Backlog" || ticket.sprintId === null).length,
    tickets: TICKETS.filter((ticket) => ticket.status === "Backlog" || ticket.sprintId === null),
  };
}

export function searchTickets(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return listTickets();
  const tickets = TICKETS.filter((ticket) => {
    const haystack = [
      ticket.key,
      ticket.title,
      ticket.summary,
      ticket.description,
      ticket.labels.join(" "),
      ticket.ledgerlyPaths.join(" "),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
  return { query, count: tickets.length, tickets };
}

export function describeProject() {
  return {
    ...COMPANYTICKET_PROJECT,
    issueTypes: ["Story", "Bug", "Task"],
    statuses: ["Backlog", "To Do", "In Progress", "Done"],
    ticketKeys: TICKETS.map((ticket) => ticket.key),
    activeSprintId: getActiveSprint()?.id ?? null,
    mcpTools: ["describe_project", "list_sprints", "list_tickets", "get_ticket", "search_tickets", "get_board"],
  };
}
