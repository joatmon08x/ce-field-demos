import { EmptyState } from "@/components/empty-state";
import { FilterPills } from "@/components/filter-pills";
import { InvoiceTable } from "@/components/invoice-table";
import { PageHeader } from "@/components/page-header";
import { SearchField } from "@/components/search-field";
import { Card, CardContent } from "@/components/ui/card";
import { getInvoices } from "@/lib/data";

export const metadata = {
  title: "Invoices",
};

const FILTERS = [
  { id: "ALL", label: "All" },
  { id: "OPEN", label: "Open" },
  { id: "OVERDUE", label: "Overdue" },
  { id: "PAID", label: "Paid" },
  { id: "DRAFT", label: "Draft" },
  { id: "VOID", label: "Void" },
];

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "ALL";
  const q = params.q ?? "";
  const invoices = await getInvoices({ status, q });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Receivables"
        title="Invoices"
        description="Seeded folios only. Amounts are Starter $49, Growth $99, or Scale $249 — never a custom figure."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterPills pathname="/invoices" value={status} extra={{ q }} items={FILTERS} />
        <SearchField
          defaultValue={q}
          status={status}
          placeholder="Search customer or INV-…"
        />
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices in this slice"
          body="Clear the filter or search. The seed still has Acme North, Riverstone Labs, Cobalt Goods, and the rest of the Fieldnote book."
          imageSrc="/images/empty-invoices.svg"
          imageAlt="Empty invoice folder illustration"
        />
      ) : (
        <Card className="overflow-hidden py-0">
          <CardContent className="px-0 py-2">
            <InvoiceTable invoices={invoices} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
