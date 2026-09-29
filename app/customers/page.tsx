import Link from "next/link";
import { Amount } from "@/components/amount";
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
import { getCustomers } from "@/lib/customers";
import { isPlanId, planLabel } from "@/lib/plans";

export const metadata = {
  title: "Customers",
};

export const dynamic = "force-dynamic";

function planName(plan: string) {
  return isPlanId(plan) ? planLabel(plan) : plan;
}

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Accounts"
        title="Customers"
        description="Fieldnote accounts on this workspace. Overdue count and balance are the invoices still past due."
      />

      <Card className="overflow-hidden py-0">
        <CardContent className="px-0 py-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Overdue invoices</TableHead>
                <TableHead className="text-right">Overdue balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <Link href={`/customers/${customer.id}`} className="font-medium hover:underline">
                      {customer.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{customer.contactName}</TableCell>
                  <TableCell>{planName(customer.plan)}</TableCell>
                  <TableCell>{customer.overdueCount}</TableCell>
                  <TableCell className="text-right font-medium">
                    {customer.overdueCount === 0 ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <Amount cents={customer.overdueCents} plan={customer.plan} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
