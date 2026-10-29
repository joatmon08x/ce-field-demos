import Link from "next/link";
import { SendNudge } from "@/components/customers/send-nudge";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/dates";
import { formatUsd } from "@/lib/money";
import {
  NO_ACTIVITY_LABEL,
  daysPastDue,
  lastActivityOn,
  outstandingCents,
  overdueBook,
  type OverdueBookInvoice,
} from "@/lib/overdue-book";

export function OverdueBook({
  invoices,
  activities,
}: {
  invoices: readonly OverdueBookInvoice[];
  activities: readonly { occurredOn: Date }[];
}) {
  const rows = overdueBook(invoices);
  const lastActivity = lastActivityOn(activities);

  return (
    <section aria-labelledby="overdue-book-heading" className="flex flex-col gap-3">
      <div className="space-y-1">
        <h2 id="overdue-book-heading" className="text-lg font-semibold tracking-tight">
          Overdue Book
        </h2>
        <p className="text-sm text-muted-foreground">
          OVERDUE invoices for this account, days past due descending, on the 23 Aug 2026 clock.
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No overdue invoices"
          body="This account has no OVERDUE invoices. Open and paid folios stay off this book."
          imageSrc="/images/empty-invoices.svg"
          imageAlt="Empty invoice folder illustration"
        />
      ) : (
        <Card className="overflow-hidden py-0">
          <CardContent className="px-0 py-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Invoice date</TableHead>
                  <TableHead>Due date</TableHead>
                  <TableHead className="text-right">Days past due</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead>Last activity</TableHead>
                  <TableHead>
                    <span className="sr-only">Nudge</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((invoice) => (
                  <TableRow key={invoice.id} className="relative">
                    <TableCell>
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="font-mono text-[13px] font-medium after:absolute after:inset-0 after:z-0 after:content-[''] hover:underline"
                      >
                        {invoice.number}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(invoice.issuedOn)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(invoice.dueOn)}
                    </TableCell>
                    <TableCell className="text-right">{daysPastDue(invoice.dueOn)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatUsd(outstandingCents(invoice))}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {lastActivity ? (
                        <time dateTime={lastActivity.toISOString()}>{formatDate(lastActivity)}</time>
                      ) : (
                        <>
                          <span aria-hidden="true">{NO_ACTIVITY_LABEL}</span>
                          <span className="sr-only">No activity</span>
                        </>
                      )}
                    </TableCell>
                    <TableCell className="relative z-10">
                      <SendNudge
                        invoiceId={invoice.id}
                        invoiceNumber={invoice.number}
                        scope="invoice"
                        variant="outline"
                        size="sm"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
