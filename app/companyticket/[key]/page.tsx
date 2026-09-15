import { getTicket } from "@/lib/companyticket/tickets";
import { notFound } from "next/navigation";
import { TicketDetail } from "@/components/companyticket/ticket-detail";

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const ticket = getTicket(key);
  return {
    title: ticket ? `${ticket.key} ${ticket.title}` : "Ticket",
  };
}

export default async function CompanyTicketIssuePage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const ticket = getTicket(key);
  if (!ticket) notFound();
  return <TicketDetail ticket={ticket} />;
}
