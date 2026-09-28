import { randomUUID } from "node:crypto";
import type { Activity, Prisma } from "@prisma/client";
import { DEMO_AS_OF } from "@/lib/clock";
import { DEMO_OPERATOR } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const ACTIVITY_TYPES = ["NOTE_ADDED", "NUDGE_SENT", "PAYMENT_RECORDED"] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export type ActivityStatus = "recorded" | "sent" | "failed";

export type NoteAddedPayload = {
  noteId: string;
  body: string;
  invoiceNumber?: string;
};

export type NudgeSentPayload = {
  invoiceNumber: string;
  toEmail: string;
  channel: "email";
  outstandingCents: number;
  dueOn: string;
  reason?: string;
};

export type PaymentRecordedPayload = {
  invoiceNumber: string;
  amountCents: number;
  method: string;
};

export type ActivityPayload = NoteAddedPayload | NudgeSentPayload | PaymentRecordedPayload;

export type AccountActivity = Omit<Activity, "payload"> & { payload: ActivityPayload };

export async function recordActivity(
  input: {
    customerId: string;
    invoiceId?: string | null;
    type: ActivityType;
    status: ActivityStatus;
    payload: ActivityPayload;
  },
  tx?: Prisma.TransactionClient,
): Promise<Activity> {
  const db = tx ?? prisma;
  return db.activity.create({
    data: {
      id: `act_${randomUUID()}`,
      customerId: input.customerId,
      invoiceId: input.invoiceId ?? null,
      type: input.type,
      actorName: DEMO_OPERATOR.name,
      status: input.status,
      payload: JSON.stringify(input.payload),
      occurredOn: DEMO_AS_OF,
    },
  });
}

export async function listAccountActivity(customerId: string): Promise<AccountActivity[]> {
  const rows = await prisma.activity.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => ({
    ...row,
    payload: JSON.parse(row.payload) as ActivityPayload,
  }));
}
