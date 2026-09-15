import type { ReactNode } from "react";
import Link from "next/link";
import { COMPANYTICKET_PROJECT, DEMO_OPERATOR_NAME } from "./brand";

export function TicketShell({ children }: { children: ReactNode }) {
  return (
    <div className="companyticket-shell min-h-full">
      <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-card px-4 sm:px-6">
        <Link href="/companyticket" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-md bg-indigo text-[11px] font-bold text-primary-foreground">
            LY
          </span>
          <span>CompanyTicket</span>
        </Link>
        <span className="hidden text-muted-foreground sm:inline">/</span>
        <span className="hidden text-sm text-muted-foreground sm:inline">{COMPANYTICKET_PROJECT.workspace}</span>
        <span className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            Keys {COMPANYTICKET_PROJECT.keyScheme} · {DEMO_OPERATOR_NAME}
          </span>
          <Link href="/" className="rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground hover:bg-muted">
            Ledgerly
          </Link>
        </span>
      </header>
      {children}
    </div>
  );
}
