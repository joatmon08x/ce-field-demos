import { prisma } from "@/lib/prisma";

export async function getCustomers() {
  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    include: {
      invoices: {
        select: { status: true, totalCents: true },
      },
    },
  });

  return customers.map((customer) => {
    const overdue = customer.invoices.filter((invoice) => invoice.status === "OVERDUE");
    return {
      id: customer.id,
      name: customer.name,
      contactName: customer.contactName,
      plan: customer.plan,
      overdueCount: overdue.length,
      overdueCents: overdue.reduce((sum, invoice) => sum + invoice.totalCents, 0),
    };
  });
}

export async function getCustomer(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      invoices: { include: { payments: true, activities: true } },
      notes: { orderBy: { createdAt: "desc" } },
      activities: { orderBy: { createdAt: "desc" } },
    },
  });
}
