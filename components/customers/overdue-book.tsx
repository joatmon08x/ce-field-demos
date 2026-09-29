import Link from "next/link";
import { Amount } from "@/components/amount";
import { NudgeButton } from "@/components/customers/nudge-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { outstandingCents } from "@/lib/collections";
import { formatDate } from "@/lib/dates";

type OverdueInvoice = {
  id: string;
  number: string;
  issuedOn: Date;
  dueOn: Date;
  totalCents: number;
  daysPastDue: number;
  payments: { amountCents: number }[];
  activities: { occurredOn: Date }[];
};

function lastActivityOn(activities: { occurredOn: Date }[]): Date | null {
  if (activities.length === 0) return null;
  return activities.reduce(
    (latest, activity) => (activity.occurredOn > latest ? activity.occurredOn : latest),
    activities[0].occurredOn,
  );
}

export function OverdueBook({ invoices, plan }: { invoices: OverdueInvoice[]; plan: string }) {
  if (invoices.length === 0) {
    return (
      <p className="px-5 text-sm text-muted-foreground">No overdue invoices on this account.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Invoice date</TableHead>
          <TableHead>Due date</TableHead>
          <TableHead>Days past due</TableHead>
          <TableHead className="text-right">Outstanding</TableHead>
          <TableHead>Last activity</TableHead>
          <TableHead>
            <span className="sr-only">Nudge</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => {
          const lastActivity = lastActivityOn(invoice.activities);
          return (
            <TableRow key={invoice.id}>
              <TableCell>
                <Link
                  href={`/invoices/${invoice.id}`}
                  className="font-mono text-[13px] font-medium hover:underline"
                >
                  {invoice.number}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(invoice.issuedOn)}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(invoice.dueOn)}</TableCell>
              <TableCell>{invoice.daysPastDue}</TableCell>
              <TableCell className="text-right font-medium">
                <Amount
                  cents={outstandingCents(invoice.totalCents, invoice.payments)}
                  plan={plan}
                />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {lastActivity ? formatDate(lastActivity) : "—"}
              </TableCell>
              <TableCell>
                <NudgeButton invoiceId={invoice.id} size="sm" />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
