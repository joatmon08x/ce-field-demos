import { NextResponse } from "next/server";
import { RUNBOOK_TRACKS, runbookSectionHref, runbookTrackHref } from "@/lib/runbooks/meta";

export async function GET() {
  return NextResponse.json({
    tracks: RUNBOOK_TRACKS.map((track) => ({
      id: track.id,
      title: track.title,
      description: track.description,
      href: runbookTrackHref(track.id),
      runbookSlugs: [...track.runbookSlugs],
      sections: track.sections.map((section) => ({
        id: section.id,
        title: section.title,
        href: runbookSectionHref(track.id, section.id),
      })),
    })),
  });
}
