import type { ReactNode } from "react";
import { AppChrome } from "@/components/app-chrome";
import { getOpenDisputeCount, getOpenDisputeNotices } from "@/lib/data";

export async function AppShell({ children }: { children: ReactNode }) {
  let openDisputeCount = 0;
  let openDisputes: Awaited<ReturnType<typeof getOpenDisputeNotices>> = [];
  try {
    [openDisputeCount, openDisputes] = await Promise.all([
      getOpenDisputeCount(),
      getOpenDisputeNotices(),
    ]);
  } catch {
    openDisputeCount = 0;
    openDisputes = [];
  }

  return (
    <AppChrome openDisputeCount={openDisputeCount} openDisputes={openDisputes}>
      {children}
    </AppChrome>
  );
}
