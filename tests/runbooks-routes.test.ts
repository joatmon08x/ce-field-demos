import { describe, expect, it } from "vitest";
import nextConfig from "@/next.config";
import { GET as getRunbookCatalog } from "@/app/api/runbooks/route";
import { GET as getRunbookTrack } from "@/app/api/runbooks/[track]/route";
import { GET as getRunbookCommand } from "@/app/api/runbooks/commands/[slug]/route";
import {
  generateStaticParams as generateTrackParams,
} from "@/app/runbooks/[track]/page";
import {
  generateStaticParams as generateCommandParams,
} from "@/app/runbooks/commands/[slug]/page";
import { RUNBOOKS, RUNBOOK_TRACKS, runbookSectionHref, runbookTrackHref } from "@/lib/runbooks/meta";

const request = new Request("http://localhost/api/runbooks");
const trackParams = (track: string) => ({ params: Promise.resolve({ track }) });
const slugParams = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe("runbooks API", () => {
  it("lists each track with section-header tabs, not Demo N labels", async () => {
    const response = await getRunbookCatalog();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.tracks.map((track: { id: string }) => track.id)).toEqual([
      "101",
      "201",
      "advanced",
    ]);

    for (const track of body.tracks) {
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

    expect(body.tracks[0].runbookSlugs).toEqual([]);
    expect(body.tracks[0].sections.map((section: { title: string }) => section.title)).toEqual([
      "How do I write my first prompt?",
      "How do I work with an AI agent?",
      "How do I govern my agent?",
    ]);
    expect(body.tracks[1].runbookSlugs).toEqual([
      "multitask",
      "loop",
      "autopilot",
      "orchestrate",
    ]);
    expect(body.tracks[2].runbookSlugs).toContain("goal");
  });

  it("returns the selected track catalog with beats and commands", async () => {
    const response = await getRunbookTrack(request, trackParams("201"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.id).toBe("201");
    expect(body.href).toBe("/runbooks/201");
    expect(body.sections.map((section: { id: string }) => section.id)).toEqual([
      "getting-oriented",
      "customize-agent",
      "model-selection",
      "cloud-agents",
      "automations",
      "trust-and-verification",
    ]);
    expect(body.sections[0].beats[0].id).toBe("orient");
    expect(body.runbooks.map((runbook: { slug: string }) => runbook.slug)).toEqual(
      RUNBOOK_TRACKS.find((track) => track.id === "201")?.runbookSlugs,
    );
  });

  it("returns 404 for an unknown track", async () => {
    const response = await getRunbookTrack(request, trackParams("bogus"));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Track not found" });
  });

  it("returns a command runbook by slug", async () => {
    const response = await getRunbookCommand(request, slugParams("multitask"));
    const body = await response.json();
    const expected = RUNBOOKS.find((runbook) => runbook.slug === "multitask");

    expect(response.status).toBe(200);
    expect(body.command).toBe("/multitask");
    expect(body.href).toBe("/runbooks/commands/multitask");
    expect(body.prompt).toBe(expected?.prompt);
    expect(body.demoPrompt).toContain("lib/runbooks/meta.ts");
  });

  it("returns 404 for an unknown command", async () => {
    const response = await getRunbookCommand(request, slugParams("missing"));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Runbook not found" });
  });
});

describe("runbooks redirects", () => {
  it("sends legacy workflow and analysis URLs to the runbooks catalog", async () => {
    const redirects = (await nextConfig.redirects?.()) ?? [];

    expect(redirects).toEqual(
      expect.arrayContaining([
        { source: "/workflows", destination: "/runbooks/101", permanent: false },
        {
          source: "/workflows/:slug",
          destination: "/runbooks/commands/:slug",
          permanent: false,
        },
        { source: "/analysis", destination: "/runbooks/101", permanent: false },
        { source: "/analysis/:path*", destination: "/runbooks/101", permanent: false },
      ]),
    );
  });
});

describe("runbooks catalog hrefs", () => {
  it("builds track and section-header links", () => {
    expect(runbookTrackHref("101")).toBe("/runbooks/101");
    expect(runbookSectionHref("101", "first-prompt")).toBe("/runbooks/101#first-prompt");
    expect(runbookSectionHref("advanced", "cursor-cli-primer")).toBe(
      "/runbooks/advanced#cursor-cli-primer",
    );
  });
});

describe("runbooks page routes", () => {
  it("prebuilds the 101, 201, and advanced track pages", () => {
    expect(generateTrackParams()).toEqual([
      { track: "101" },
      { track: "201" },
      { track: "advanced" },
    ]);
  });

  it("prebuilds a command page for every runbook slug", () => {
    expect(generateCommandParams()).toEqual(
      RUNBOOKS.map((runbook) => ({ slug: runbook.slug })),
    );
  });
});
