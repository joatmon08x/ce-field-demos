import { RUNBOOK_SECTIONS_101 } from "@/lib/runbooks/beats/101";
import type { DemoSection, DemoTrack } from "@/lib/runbooks/types";

export const RUNBOOK_TRACKS = [
  {
    id: "101" as const,
    title: "101",
    description:
      "You will explore different ways to work in Cursor, use modes and models for the right tasks, apply rules and skills to ensure consistent quality, and complete at least one task with an agent.",
    sections: RUNBOOK_SECTIONS_101,
  },
] as const satisfies readonly {
  id: DemoTrack;
  title: string;
  description: string;
  sections: readonly DemoSection[];
}[];

export type RunbookTrack = (typeof RUNBOOK_TRACKS)[number];

export function getRunbookTrack(track: string): RunbookTrack | undefined {
  return RUNBOOK_TRACKS.find((entry) => entry.id === track);
}
