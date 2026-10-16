import { RUNBOOK_TRACKS } from "@/runbooks/tracks";
import type { DemoBeat, DemoSection } from "@/runbooks/types";

export const STATIC_RUNBOOKS_PATH = "runbooks.html";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderBeat(beat: DemoBeat): string {
  const detail = beat.detail ? `\n          <p class="detail">${escapeHtml(beat.detail)}</p>` : "";
  const paste = beat.example
    ? `
          <div class="paste">
            <div class="paste-head">
              <span>${escapeHtml(beat.pasteLabel ?? "Paste in Grok Build")}</span>
              <button type="button" class="copy">Copy</button>
            </div>
            <pre>${escapeHtml(beat.example)}</pre>
          </div>`
    : "";
  const optionalClass = beat.optional ? " optional" : "";
  return `
        <article class="beat${optionalClass}" data-beat="${escapeHtml(beat.id)}">
          <h4>${escapeHtml(beat.title)}</h4>${detail}${paste}
        </article>`;
}

function renderSection(trackId: string, section: DemoSection): string {
  return `
      <section id="${trackId}-${section.id}">
        <h3>${escapeHtml(section.title)}</h3>
        <div class="beats">${section.beats.map(renderBeat).join("")}
        </div>
      </section>`;
}

function renderOptionalToggle(track: (typeof RUNBOOK_TRACKS)[number]): string {
  const hasOptional = track.sections.some((section) => section.beats.some((beat) => beat.optional));
  if (!hasOptional) return "";
  return `
      <label class="optional-toggle" for="include-optional">
        <input id="include-optional" class="include-optional" type="checkbox">
        Include optional cards
      </label>`;
}

function renderTrack(track: (typeof RUNBOOK_TRACKS)[number]): string {
  const tabs = track.sections
    .map((section) => `<a href="#${track.id}-${section.id}">${escapeHtml(section.title)}</a>`)
    .join("\n        ");
  return `
    <div class="track" data-track="${track.id}">
      <h2>${escapeHtml(track.title)}</h2>
      <p class="lede">${escapeHtml(track.description)}</p>${renderOptionalToggle(track)}
      <nav class="tabs" aria-label="${track.id} sections">
        ${tabs}
      </nav>${track.sections.map((section) => renderSection(track.id, section)).join("")}
    </div>`;
}

/**
 * Self-contained runbooks page: no app server, no network, no build step.
 * Every track is pre-rendered so the file still reads top to bottom with
 * scripts disabled; the script only hides tracks other than `?track=`.
 * Optional cards stay in the markup and stay hidden until Include optional
 * cards is checked. That checkbox is CSS, so it works with scripts disabled.
 */
export function renderRunbooksHtml(): string {
  const options = RUNBOOK_TRACKS.map(
    (track) => `<option value="${track.id}">${escapeHtml(track.title)}</option>`,
  ).join("\n          ");

  return `<!doctype html>
<!-- Generated from runbooks/meta.ts by \`npm run runbooks:export\`. Do not edit by hand. -->
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ledgerly runbooks</title>
  <style>
    :root {
      --indigo: #4f46e5;
      --ink: #111827;
      --ink-soft: #6b7280;
      --paper: #f7f7fb;
      --paper-elevated: #ffffff;
      --line: #e5e7eb;
      --muted: #f3f4f6;
      --success: #059669;
      --radius: 0.625rem;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font: 14px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    }
    main { max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
    .eyebrow { margin: 0; color: var(--indigo); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
    h1 { margin: 0.25rem 0 0.25rem; font-size: 1.5rem; }
    .lede { margin: 0.25rem 0 0; max-width: 48rem; color: var(--ink-soft); font-size: 0.8125rem; }
    label { display: block; margin: 1.5rem 0 0.375rem; font-size: 0.75rem; font-weight: 500; }
    select {
      height: 2.25rem; min-width: 12rem; padding: 0 0.75rem;
      border: 1px solid var(--line); border-radius: var(--radius);
      background: var(--paper-elevated); color: var(--ink); font: inherit;
    }
    h2 { margin: 1.5rem 0 0; font-size: 1.25rem; }
    .tabs { display: flex; gap: 0.5rem; overflow-x: auto; margin: 1rem 0 0.5rem; padding-bottom: 0.25rem; }
    .tabs a {
      flex-shrink: 0; padding: 0.375rem 0.75rem;
      border: 1px solid var(--line); border-radius: var(--radius);
      background: var(--paper-elevated); color: var(--ink); text-decoration: none; font-size: 0.8125rem;
    }
    .tabs a:hover { border-color: var(--indigo); color: var(--indigo); }
    section { margin-top: 2.5rem; scroll-margin-top: 1rem; }
    h3 { margin: 0 0 0.75rem; font-size: 1.125rem; }
    .beats { display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
    .beat {
      display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem;
      border: 1px solid var(--line); border-radius: var(--radius); background: var(--paper-elevated);
    }
    h4 { margin: 0; font-size: 0.875rem; }
    .detail { margin: -0.375rem 0 0; color: var(--ink-soft); font-size: 0.75rem; }
    .paste { margin-top: auto; }
    .paste-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.75rem; font-weight: 500; }
    .copy {
      padding: 0.25rem 0.625rem; border: 1px solid var(--line); border-radius: var(--radius);
      background: var(--paper-elevated); color: var(--ink); font: inherit; cursor: pointer;
    }
    .copy.done { color: var(--success); border-color: var(--success); }
    pre {
      margin: 0; padding: 0.75rem; overflow: auto; white-space: pre-wrap;
      border: 1px solid var(--line); border-radius: var(--radius); background: var(--muted);
      font: 0.75rem/1.6 ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .track[hidden] { display: none; }
    label.optional-toggle {
      display: flex; align-items: center; gap: 0.5rem;
      margin: 0.75rem 0 0; font-size: 0.8125rem; font-weight: 500; cursor: pointer;
    }
    .optional-toggle input { width: 1rem; height: 1rem; margin: 0; accent-color: var(--indigo); }
    .track:not(:has(.include-optional:checked)) .beat.optional { display: none; }
  </style>
</head>
<body>
  <main>
    <p class="eyebrow">Demo catalog</p>
    <h1>Runbooks</h1>
    <p class="lede">Choose a track, jump to a section, and copy the next beat into Grok Build. Link a track directly with <code>?track=201</code> or <code>?track=301</code>.</p>
    <label for="track">Catalog</label>
    <select id="track">
          ${options}
    </select>
${RUNBOOK_TRACKS.map(renderTrack).join("\n")}
  </main>
  <script>
    (function () {
      var select = document.getElementById("track");
      var tracks = Array.prototype.slice.call(document.querySelectorAll(".track"));
      var ids = tracks.map(function (el) { return el.getAttribute("data-track"); });

      function show(id, updateUrl) {
        if (ids.indexOf(id) === -1) id = ids[0];
        select.value = id;
        tracks.forEach(function (el) { el.hidden = el.getAttribute("data-track") !== id; });
        document.title = "Runbooks · " + id;
        if (updateUrl) {
          try {
            var url = new URL(window.location.href);
            url.searchParams.set("track", id);
            url.hash = "";
            history.replaceState(null, "", url.toString());
          } catch (err) {
            // Canvas srcdoc pages cannot update their about:srcdoc URL.
          }
          if (window.parent !== window) {
            window.parent.postMessage({ type: "runbooks:track", track: id }, "*");
          }
        }
      }

      var params = new URLSearchParams(window.location.search);
      var fromHash = window.location.hash.slice(1).split("-")[0];
      show(params.get("track") || (ids.indexOf(fromHash) !== -1 ? fromHash : ids[0]), false);
      if (window.location.hash) {
        var target = document.getElementById(window.location.hash.slice(1));
        if (target) target.scrollIntoView();
      }
      select.addEventListener("change", function () { show(select.value, true); });
      window.addEventListener("message", function (event) {
        var data = event.data;
        if (
          event.source === window.parent &&
          data &&
          data.type === "runbooks:set-track" &&
          typeof data.track === "string" &&
          ids.indexOf(data.track) !== -1
        ) {
          show(data.track, false);
        }
      });

      var optionalToggle = document.querySelector(".include-optional");
      if (optionalToggle) {
        optionalToggle.checked = params.get("optional") === "1";
        optionalToggle.addEventListener("change", function () {
          try {
            var url = new URL(window.location.href);
            if (optionalToggle.checked) url.searchParams.set("optional", "1");
            else url.searchParams.delete("optional");
            history.replaceState(null, "", url.toString());
          } catch (err) {
            // Canvas embeds this page as srcdoc, which has no URL to update.
          }
        });
      }

      function fallbackCopy(text) {
        var area = document.createElement("textarea");
        area.value = text;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(area);
        return ok ? Promise.resolve() : Promise.reject();
      }

      document.addEventListener("click", function (event) {
        var button = event.target.closest(".copy");
        if (!button) return;
        var text = button.closest(".paste").querySelector("pre").textContent;
        var write = navigator.clipboard && window.isSecureContext
          ? navigator.clipboard.writeText(text).catch(function () { return fallbackCopy(text); })
          : fallbackCopy(text);
        write.then(function () {
          button.textContent = "Copied";
          button.classList.add("done");
          setTimeout(function () { button.textContent = "Copy"; button.classList.remove("done"); }, 1600);
        }, function () {});
      });
    })();
  </script>
</body>
</html>
`;
}
