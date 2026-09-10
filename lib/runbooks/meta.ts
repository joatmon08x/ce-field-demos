/**
 * Cursor runbooks as they appear on /runbooks and in the README.
 * Prompts are the source of truth — the README test requires them verbatim.
 */

export * from "@/lib/runbooks/types";
export { RUNBOOK_SECTIONS_101 } from "@/lib/runbooks/beats/101";
export { RUNBOOK_SECTIONS_201 } from "@/lib/runbooks/beats/201";
export { RUNBOOK_SECTIONS_ADVANCED } from "@/lib/runbooks/beats/advanced";
export { PROJECT_AGENTS, PROJECT_SKILLS } from "@/lib/runbooks/agents";
export { RUNBOOKS, getRunbook } from "@/lib/runbooks/commands";
export { RUNBOOK_TRACKS, getRunbookTrack, type RunbookTrack } from "@/lib/runbooks/tracks";
export {
  RUNBOOK_COMMANDS_ANCHOR,
  runbookBeatSequence,
  runbookBeats,
  runbookSectionHref,
  runbookTrackHref,
} from "@/lib/runbooks/catalog";
