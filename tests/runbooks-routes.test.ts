import { describe, expect, it } from "vitest";
import nextConfig from "@/next.config";
import { GET as getRunbookCatalog } from "@/app/api/runbooks/route";
import { GET as getRunbookTrack } from "@/app/api/runbooks/[track]/route";
import { generateStaticParams as generateTrackParams } from "@/app/runbooks/[track]/page";
import { RUNBOOK_TRACKS, runbookSectionHref, runbookTrackHref } from "@/lib/runbooks/meta";

const request = new Request("http://localhost/api/runbooks");
const trackParams = (track: string) => ({ params: Promise.resolve({ track }) });

describe("runbooks API", () => {
  it("lists only the 101 track with section-header tabs", async () => {
    const response = await getRunbookCatalog();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.tracks.map((track: { id: string }) => track.id)).toEqual(["101"]);

    for (const track of body.tracks) {
      expect(track).not.toHaveProperty("runbookSlugs");
      expect(track.href).toBe(`/runbooks/${track.id}`);
      expect(track.sections.length).toBeGreaterThan(0);
      expect(track.sections.map((section: { id: string }) => section.id)).toEqual(
        [...new Set(track.sections.map((section: { id: string }) => section.id))],
      );
      for (const section of track.sections) {
        expect(section.title).not.toMatch(/^Demo \d+$/);
        expect(section.href).toBe(`/runbooks/${track.id}#${section.id}`);
      }
    }

    expect(body.tracks[0].sections.map((section: { title: string }) => section.title)).toEqual([
      "What is Cursor?",
      "How do I work with an agent?",
      "How do I govern my agent?",
    ]);
  });

  it("returns the selected track catalog with beats", async () => {
    const response = await getRunbookTrack(request, trackParams("101"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.id).toBe("101");
    expect(body.href).toBe("/runbooks/101");
    expect(body.sections.map((section: { id: string }) => section.id)).toEqual([
      "first-prompt",
      "work-with-agent",
      "govern-agent",
    ]);
    expect(body.sections[0].beats[0].id).toBe("ask");
    expect(body).not.toHaveProperty("runbooks");
  });

  it("returns 404 for an unknown track", async () => {
    const response = await getRunbookTrack(request, trackParams("bogus"));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Track not found" });
  });

  it("returns 404 for the retired 201 and advanced tracks", async () => {
    for (const retired of ["201", "advanced"]) {
      const response = await getRunbookTrack(request, trackParams(retired));
      expect(response.status).toBe(404);
    }
  });
});

describe("runbooks redirects", () => {
  it("sends legacy workflow, analysis, and retired-track URLs to the 101 runbooks track", async () => {
    const redirects = (await nextConfig.redirects?.()) ?? [];

    expect(redirects).toEqual(
      expect.arrayContaining([
        { source: "/workflows", destination: "/runbooks/101", permanent: false },
        { source: "/workflows/:slug", destination: "/runbooks/101", permanent: false },
        { source: "/analysis", destination: "/runbooks/101", permanent: false },
        { source: "/analysis/:path*", destination: "/runbooks/101", permanent: false },
        { source: "/runbooks/201", destination: "/runbooks/101", permanent: false },
        { source: "/runbooks/advanced", destination: "/runbooks/101", permanent: false },
        { source: "/runbooks/commands", destination: "/runbooks/101", permanent: false },
        { source: "/runbooks/commands/:slug", destination: "/runbooks/101", permanent: false },
      ]),
    );
  });
});

describe("runbooks catalog hrefs", () => {
  it("builds track and section-header links", () => {
    expect(runbookTrackHref("101")).toBe("/runbooks/101");
    expect(runbookSectionHref("101", "first-prompt")).toBe("/runbooks/101#first-prompt");
  });
});

describe("runbooks page routes", () => {
  it("prebuilds only the 101 track page", () => {
    expect(generateTrackParams()).toEqual([{ track: "101" }]);
    expect(RUNBOOK_TRACKS.map((track) => track.id)).toEqual(["101"]);
  });
});
