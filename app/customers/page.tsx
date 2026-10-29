import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCustomers } from "@/lib/data";
import { formatUsd } from "@/lib/money";
import { overdueTotals } from "@/lib/overdue-book";
import { isPlanId, planLabel } from "@/lib/plans";

export const metadata = {
  title: "Customers",
};

export const dynamic = "force-dynamic";

function accountPlan(plan: string) {
  return isPlanId(plan) ? planLabel(plan) : plan;
}

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Accounts"
        title="Customers"
        description="Seeded Fieldnote accounts. Overdue count and balance include only OVERDUE invoices. Amounts stay on the catalog — Starter $49, Growth $99, Scale $249."
      />

      {customers.length === 0 ? (
        <EmptyState
          title="No accounts in this book"
          body="Reseed the workspace. The book is the ten Fieldnote accounts plus the extra accounts in the seed."
          imageSrc="/images/empty-invoices.svg"
          imageAlt="Empty invoice folder illustration"
        />
      ) : (
        <Card className="overflow-hidden py-0">
          <CardContent className="px-0 py-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Overdue invoices</TableHead>
                  <TableHead className="text-right">Overdue balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => {
                  const overdue = overdueTotals(customer.invoices);
                  return (
                    <TableRow key={customer.id} className="relative">
                      <TableCell>
                        <Link
                          href={`/customers/${customer.id}`}
                          className="font-medium after:absolute after:inset-0 after:content-[''] hover:underline"
                        >
                          {customer.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {accountPlan(customer.plan)}
                      </TableCell>
                      <TableCell className="text-right">{overdue.count}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatUsd(overdue.balanceCents)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
