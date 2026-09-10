import { getRunbookTrack } from "@/lib/runbooks/tracks";
import type { DemoBeat, DemoTrack } from "@/lib/runbooks/types";

export function runbookTrackHref(trackId: string): string {
  return `/runbooks/${trackId}`;
}

export function runbookSectionHref(trackId: string, sectionId: string): string {
  return `${runbookTrackHref(trackId)}#${sectionId}`;
}

export function runbookBeats(track: DemoTrack): DemoBeat[] {
  const selected = getRunbookTrack(track);
  if (!selected) return [];
  return selected.sections.flatMap((section) => [...section.beats]);
}

export function runbookBeatSequence(track: DemoTrack): string {
  return runbookBeats(track)
    .map((beat) => beat.title)
    .join(" → ");
}
