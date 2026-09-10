import { RUNBOOK_SECTIONS_101 } from "@/lib/runbooks/beats/101";
import { RUNBOOK_SECTIONS_201 } from "@/lib/runbooks/beats/201";
import { RUNBOOK_SECTIONS_ADVANCED } from "@/lib/runbooks/beats/advanced";
import type { DemoSection, DemoTrack, RunbookMeta } from "@/lib/runbooks/types";

export const RUNBOOK_TRACKS = [
  {
    id: "101" as const,
    title: "101",
    description:
      "You will explore different ways to work in Cursor, use modes and models for the right tasks, apply rules and skills to ensure consistent quality, and complete at least one task with an agent.",
    sections: RUNBOOK_SECTIONS_101,
    runbookSlugs: [] as const,
  },
  {
    id: "201" as const,
    title: "201",
    description:
      "Deck-aligned: orient, migrate the v1 client selection to v2, create the v2-only rule live, customize the agent, choose models, show Cloud Agents and Automations, then breadth, time, PR ownership, planning, and verification.",
    sections: RUNBOOK_SECTIONS_201,
    runbookSlugs: ["multitask", "loop", "autopilot", "orchestrate"] as const,
  },
  {
    id: "advanced" as const,
    title: "Advanced",
    description:
      "Deeper vertical scenarios: Cursor CLI primer, durable goals, parallel workers, scheduled checking, PR supervision, planner trees, and verifier evidence.",
    sections: RUNBOOK_SECTIONS_ADVANCED,
    runbookSlugs: ["goal", "multitask", "loop", "autopilot", "orchestrate"] as const,
  },
] as const satisfies readonly {
  id: DemoTrack;
  title: string;
  description: string;
  sections: readonly DemoSection[];
  runbookSlugs: readonly RunbookMeta["slug"][];
}[];

export type RunbookTrack = (typeof RUNBOOK_TRACKS)[number];

export function getRunbookTrack(track: string): RunbookTrack | undefined {
  return RUNBOOK_TRACKS.find((entry) => entry.id === track);
}
