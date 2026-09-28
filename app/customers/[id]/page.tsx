import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityFeed } from "@/components/collections/activity-feed";
import { GatedAmount } from "@/components/collections/gated-amount";
import { NoteComposer } from "@/components/collections/note-composer";
import { NudgeControl } from "@/components/collections/nudge-control";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mostPastDueOverdue } from "@/lib/collections/balance";
import { getCustomerAccount } from "@/lib/collections/data";
import { formatDate } from "@/lib/dates";
import { planLabel } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = await getCustomerAccount(id);
  return { title: account ? account.customer.name : "Account" };
}

export default async function CustomerAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = await getCustomerAccount(id);
  if (!account) notFound();

  const { customer, invoices, overdue } = account;
  const nudgeTarget = mostPastDueOverdue(invoices);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Account"
        title={customer.name}
        description={`${planLabel(customer.plan)} · ${customer.email}`}
        actions={
          <NudgeControl
            invoiceId={nudgeTarget?.id ?? null}
            invoiceNumber={nudgeTarget?.number}
            variant="account"
          />
        }
      />

      <Card className="overflow-hidden py-0">
        <CardHeader className="px-5 pt-5">
          <CardTitle>Overdue Book</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-4">
          {overdue.length === 0 ? (
            <p className="px-5 text-sm text-muted-foreground">No overdue invoices.</p>
          ) : (
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
                {overdue.map((invoice) => (
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
                    <TableCell className="text-right">{invoice.daysPastDue}</TableCell>
                    <TableCell className="text-right">
                      <GatedAmount cents={invoice.outstandingCents} plan={customer.plan} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {invoice.lastActivityAt ? formatDate(invoice.lastActivityAt) : "—"}
                    </TableCell>
                    <TableCell>
                      <NudgeControl invoiceId={invoice.id} invoiceNumber={invoice.number} variant="row" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Note</CardTitle>
        </CardHeader>
        <CardContent>
          <NoteComposer
            customerId={customer.id}
            invoices={overdue.map(({ id: invoiceId, number }) => ({ id: invoiceId, number }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed customerId={customer.id} plan={customer.plan} />
        </CardContent>
      </Card>
    </div>
  );
}
