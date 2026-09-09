"use client";

import { runbookTrackHref } from "@/lib/runbooks/meta";

export function RunbookCatalogSelect({
  tracks,
  trackId,
}: {
  tracks: readonly { id: string; title: string }[];
  trackId: string;
}) {
  return (
    <div className="flex max-w-xs flex-col gap-1.5">
      <label htmlFor="runbook-catalog" className="text-xs font-medium text-foreground">
        Catalog
      </label>
      <select
        id="runbook-catalog"
        name="track"
        defaultValue={trackId}
        className="h-9 rounded-md border border-input bg-card px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
        onChange={(event) => {
          window.location.assign(runbookTrackHref(event.target.value));
        }}
      >
        {tracks.map((track) => (
          <option key={track.id} value={track.id}>
            {track.title}
          </option>
        ))}
      </select>
    </div>
  );
}
