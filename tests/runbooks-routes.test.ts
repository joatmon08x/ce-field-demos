import { describe, expect, it } from "vitest";
import nextConfig from "@/next.config";
import { GET as getRunbookCatalog } from "@/app/api/runbooks/route";
import { GET as getRunbookTrack } from "@/app/api/runbooks/[track]/route";
import { generateStaticParams as generateTrackParams } from "@/app/runbooks/[track]/page";
import { RUNBOOK_TRACKS, runbookSectionHref, runbookTrackHref } from "@/lib/runbooks/meta";

const request = new Request("http://localhost/api/runbooks");
const trackParams = (track: string) => ({ params: Promise.resolve({ track }) });

describe("runbooks API", () => {
  it("lists the 101, 201, and 301 tracks with section-header tabs", async () => {
    const response = await getRunbookCatalog();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.tracks.map((track: { id: string }) => track.id)).toEqual(["101", "201", "301"]);

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
      "What is Grok Build?",
      "How do you work with an agent?",
      "How do you govern an agent?",
    ]);
    expect(body.tracks[1].sections.map((section: { title: string }) => section.title)).toEqual([
      "How do you manage context?",
      "How do you standardize agent behavior?",
      "How do you connect an agent to external tools?",
      "How do you parallelize a task?",
    ]);
    expect(body.tracks[2].sections.map((section: { title: string }) => section.title)).toEqual([
      "How do you break down tasks for agents?",
      "How do multiple agents go from plan to PR?",
      "How do you scale AI code reviews?",
      "How do contributors share ownership safely?",
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

  it("returns the 201 track catalog with beats", async () => {
    const response = await getRunbookTrack(request, trackParams("201"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.id).toBe("201");
    expect(body.href).toBe("/runbooks/201");
    expect(body.sections.map((section: { id: string }) => section.id)).toEqual([
      "target-context",
      "standardize-behavior",
      "mcp-more-info",
      "parallelize-task",
    ]);
    expect(body.sections[0].beats[0].id).toBe("rename-agent-1-all");
    expect(body).not.toHaveProperty("runbooks");
  });

  it("returns the 301 track catalog with beats", async () => {
    const response = await getRunbookTrack(request, trackParams("301"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.id).toBe("301");
    expect(body.href).toBe("/runbooks/301");
    expect(body.sections.map((section: { id: string }) => section.id)).toEqual([
      "break-down-tasks",
      "plan-to-pr",
      "scale-reviews",
      "share-ownership",
    ]);
    expect(body.sections[0].beats[0].id).toBe("open-local-agent");
    expect(body.sections.map((section: { beats: unknown[] }) => section.beats.length)).toEqual([
      5, 13, 7, 4,
    ]);
    expect(body).not.toHaveProperty("runbooks");
  });

  it("returns 404 for the retired advanced track", async () => {
    const response = await getRunbookTrack(request, trackParams("advanced"));
    expect(response.status).toBe(404);
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
        { source: "/runbooks/advanced", destination: "/runbooks/101", permanent: false },
        { source: "/runbooks/commands", destination: "/runbooks/101", permanent: false },
        { source: "/runbooks/commands/:slug", destination: "/runbooks/101", permanent: false },
      ]),
    );
    expect(redirects).not.toEqual(
      expect.arrayContaining([{ source: "/runbooks/201", destination: "/runbooks/101", permanent: false }]),
    );
    expect(redirects).not.toEqual(
      expect.arrayContaining([{ source: "/runbooks/301", destination: "/runbooks/101", permanent: false }]),
    );
  });
});

describe("runbooks catalog hrefs", () => {
  it("builds track and section-header links", () => {
    expect(runbookTrackHref("101")).toBe("/runbooks/101");
    expect(runbookSectionHref("101", "first-prompt")).toBe("/runbooks/101#first-prompt");
    expect(runbookTrackHref("201")).toBe("/runbooks/201");
    expect(runbookSectionHref("201", "target-context")).toBe("/runbooks/201#target-context");
    expect(runbookTrackHref("301")).toBe("/runbooks/301");
    expect(runbookSectionHref("301", "break-down-tasks")).toBe("/runbooks/301#break-down-tasks");
  });
});

describe("runbooks page routes", () => {
  it("prebuilds the 101, 201, and 301 track pages", () => {
    expect(generateTrackParams()).toEqual([{ track: "101" }, { track: "201" }, { track: "301" }]);
    expect(RUNBOOK_TRACKS.map((track) => track.id)).toEqual(["101", "201", "301"]);
  });
});
