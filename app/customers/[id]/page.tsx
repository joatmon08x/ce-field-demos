import { notFound } from "next/navigation";
import { AccountActivity } from "@/components/customers/account-activity";
import { SaveCollectionNote } from "@/components/customers/save-collection-note";
import { OverdueBook } from "@/components/customers/overdue-book";
import { PageHeader } from "@/components/page-header";
import { getCustomer } from "@/lib/data";
import { isPlanId, planLabel } from "@/lib/plans";

export const dynamic = "force-dynamic";

function accountPlan(plan: string) {
  return isPlanId(plan) ? planLabel(plan) : plan;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomer(id);
  return { title: customer ? customer.name : "Account" };
}

export default async function CustomerAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) notFound();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Account"
        title={customer.name}
        description={`${accountPlan(customer.plan)} · ${customer.contactName} · ${customer.email}`}
      />
      <OverdueBook invoices={customer.invoices} activities={customer.activities} />
      <SaveCollectionNote
        customerId={customer.id}
        invoices={[...customer.invoices]
          .sort((a, b) => a.number.localeCompare(b.number))
          .map((invoice) => ({ id: invoice.id, number: invoice.number }))}
      />
      <AccountActivity activities={customer.activities} />
    </div>
  );
}
