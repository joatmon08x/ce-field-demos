import { NextResponse } from "next/server";
import { getRunbook, getRunbookTrack, runbookSectionHref, runbookTrackHref } from "@/lib/runbooks/meta";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ track: string }> },
) {
  const { track } = await params;
  const selected = getRunbookTrack(track);
  if (!selected) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: selected.id,
    title: selected.title,
    description: selected.description,
    href: runbookTrackHref(selected.id),
    sections: selected.sections.map((section) => ({
      id: section.id,
      title: section.title,
      href: runbookSectionHref(selected.id, section.id),
      beats: section.beats,
    })),
    runbooks: selected.runbookSlugs
      .map(getRunbook)
      .filter((runbook) => runbook !== undefined),
  });
}
