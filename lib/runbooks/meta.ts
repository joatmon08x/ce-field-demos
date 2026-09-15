/**
 * Grok Build runbooks as they appear on /runbooks and in the README.
 * The 101 and 201 tracks are shipped; their beats are the source of truth.
 */

export * from "@/lib/runbooks/types";
export { RUNBOOK_SECTIONS_101 } from "@/lib/runbooks/beats/101";
export { RUNBOOK_SECTIONS_201 } from "@/lib/runbooks/beats/201";
export { PROJECT_AGENTS, PROJECT_SKILLS } from "@/lib/runbooks/agents";
export { RUNBOOK_TRACKS, getRunbookTrack, type RunbookTrack } from "@/lib/runbooks/tracks";
export {
  runbookBeatSequence,
  runbookBeats,
  runbookSectionHref,
  runbookTrackHref,
} from "@/lib/runbooks/catalog";
