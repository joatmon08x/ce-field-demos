import Link from "next/link";
import { GatedAmount } from "@/components/collections/gated-amount";
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
import { getCustomers } from "@/lib/collections/data";
import { planLabel } from "@/lib/plans";

export const metadata = {
  title: "Customers",
};

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Accounts"
        title="Customers"
        description="Seeded accounts. Overdue balance is what is still outstanding on overdue invoices."
      />

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
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <Link href={`/customers/${customer.id}`} className="font-medium hover:underline">
                      {customer.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{planLabel(customer.plan)}</TableCell>
                  <TableCell className="text-right">{customer.overdueCount}</TableCell>
                  <TableCell className="text-right">
                    <GatedAmount cents={customer.overdueCents} plan={customer.plan} />
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
