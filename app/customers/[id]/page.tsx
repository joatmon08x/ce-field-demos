import { notFound } from "next/navigation";
import { AccountActivity } from "@/components/customers/account-activity";
import { OverdueBook } from "@/components/customers/overdue-book";
import { SendNudge } from "@/components/customers/send-nudge";
import { PageHeader } from "@/components/page-header";
import { getCustomer } from "@/lib/data";
import { mostPastDueOverdue } from "@/lib/overdue-book";
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
  const nudgeTarget = mostPastDueOverdue(customer.invoices);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Account"
        title={customer.name}
        description={`${accountPlan(customer.plan)} · ${customer.contactName} · ${customer.email}`}
        actions={
          <div className="flex max-w-xs flex-col gap-1">
            <SendNudge
              invoiceId={nudgeTarget?.id ?? null}
              invoiceNumber={nudgeTarget?.number ?? null}
              disabled={nudgeTarget === null}
              describedBy="account-nudge-hint"
              scope="account"
            />
            <p id="account-nudge-hint" className="text-xs text-muted-foreground">
              {nudgeTarget
                ? `Sends a reminder for ${nudgeTarget.number}, the most past-due overdue invoice.`
                : "No overdue invoices."}
            </p>
          </div>
        }
      />
      <OverdueBook invoices={customer.invoices} activities={customer.activities} />
      <AccountActivity activities={customer.activities} />
    </div>
  );
}
