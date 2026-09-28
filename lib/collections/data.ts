import { daysPastDue, outstandingCents, sortOverdue } from "@/lib/collections/balance";
import { prisma } from "@/lib/prisma";

export async function getCustomers() {
  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    include: {
      invoices: {
        include: { payments: true },
      },
    },
  });

  return customers.map((customer) => {
    const overdue = customer.invoices.filter((invoice) => invoice.status === "OVERDUE");
    return {
      id: customer.id,
      name: customer.name,
      plan: customer.plan,
      contactName: customer.contactName,
      email: customer.email,
      overdueCount: overdue.length,
      overdueCents: overdue.reduce((sum, invoice) => sum + outstandingCents(invoice), 0),
    };
  });
}

export async function getCustomerAccount(id: string) {
  const record = await prisma.customer.findUnique({
    where: { id },
    include: {
      invoices: {
        orderBy: { issuedOn: "desc" },
        include: {
          payments: { orderBy: { recordedAt: "asc" } },
          activities: { orderBy: { createdAt: "desc" }, select: { createdAt: true } },
        },
      },
    },
  });
  if (!record) return null;

  const { invoices: rawInvoices, ...customer } = record;
  const invoices = rawInvoices.map((invoice) => {
    const { activities, ...rest } = invoice;
    return {
      ...rest,
      lastActivityAt: activities[0]?.createdAt ?? null,
      daysPastDue: daysPastDue(invoice),
      outstandingCents: outstandingCents(invoice),
    };
  });

  return {
    customer,
    invoices,
    overdue: sortOverdue(invoices),
  };
}
