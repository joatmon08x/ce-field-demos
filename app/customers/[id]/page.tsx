import { notFound } from "next/navigation";
import { ActivityFeed } from "@/components/customers/activity-feed";
import { NoteComposer } from "@/components/customers/note-composer";
import { NudgeButton } from "@/components/customers/nudge-button";
import { OverdueBook } from "@/components/customers/overdue-book";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { overdueBookRows } from "@/lib/collections";
import { getCustomer } from "@/lib/customers";
import { isPlanId, planLabel } from "@/lib/plans";

export const dynamic = "force-dynamic";

function planName(plan: string) {
  return isPlanId(plan) ? planLabel(plan) : plan;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomer(id);
  return { title: customer ? customer.name : "Customer" };
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) notFound();

  const book = overdueBookRows(customer.invoices);
  const mostPastDue = book[0];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Account"
        title={customer.name}
        description={`${customer.contactName} · ${customer.email} · ${planName(customer.plan)}`}
      />

      <Card className="overflow-hidden py-0">
        <CardHeader className="px-5 pt-5">
          <CardTitle>Overdue Book</CardTitle>
          <CardDescription>Invoices still past due, oldest first.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-4">
          <OverdueBook invoices={book} plan={customer.plan} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account actions</CardTitle>
          <CardDescription>
            {mostPastDue
              ? `Nudge goes to the most past-due invoice, ${mostPastDue.number}.`
              : "No overdue invoice to nudge."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NudgeButton invoiceId={mostPastDue?.id} disabled={!mostPastDue} />
          <NoteComposer
            customerId={customer.id}
            invoices={book.map((invoice) => ({ id: invoice.id, number: invoice.number }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>Notes, nudges, and payments, newest first.</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityFeed
            activities={customer.activities}
            notes={customer.notes}
            plan={customer.plan}
          />
        </CardContent>
      </Card>
    </div>
  );
}
