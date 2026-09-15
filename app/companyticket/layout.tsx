import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TicketShell } from "@/components/companyticket/ticket-shell";
import "./companyticket.css";

export const metadata: Metadata = {
  title: {
    default: "CompanyTicket",
    template: "%s · CompanyTicket",
  },
  description: "Fieldnote Workspace mock issue tracker. Keys use the LY-000 scheme.",
};

export default function CompanyTicketLayout({ children }: { children: ReactNode }) {
  return <TicketShell>{children}</TicketShell>;
}
