import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  checkTokenContrast,
  contrastRatio,
  decideStop,
  formatRatio,
  MIN_CONTRAST,
  safeConversationId,
  themeDeclarations,
  tokenEditFlag,
} from "./contrast-check.mjs";

const root = join(import.meta.dirname, "../..");
const shipped = readFileSync(join(root, "app/globals.css"), "utf8");

test("contrastRatio reports #B0B0B0 on the page background below 4.5:1", () => {
  const ratio = contrastRatio("#B0B0B0", "#f7f7fb");
  assert.ok(ratio < MIN_CONTRAST);
  assert.equal(formatRatio(ratio), "2.03:1");
  assert.ok(Math.abs(ratio - 2.0295359325650906) < 1e-12);
});

test("shipped token pairs meet 4.5:1", () => {
  assert.deepEqual(checkTokenContrast(shipped).violations, []);
});

test("resolves the muted text alias and reports a #B0B0B0 failure", () => {
  const css = shipped.replace(/(--ink-soft:\s*)#6b7280/, "$1#B0B0B0");
  const hit = checkTokenContrast(css).violations.find(
    (item) =>
      item.theme === "light" &&
      item.foreground === "--muted-foreground" &&
      item.background === "--background",
  );
  assert.ok(hit);
  assert.equal(hit.foregroundValue, "#b0b0b0");
  assert.equal(hit.backgroundValue, "#f7f7fb");
  assert.equal(formatRatio(hit.ratio), "2.03:1");
});

test("decideStop returns followup_message only for a flagged failing edit", () => {
  const css = shipped.replace(/(--muted-foreground:\s*)var\(--ink-soft\)/, "$1#B0B0B0");
  const flagged = { flagText: "gen-1\n/workspace/app/globals.css\n", css };
  const quiet = decideStop({ status: "completed", loop_count: 0, generation_id: "gen-1" }, { flagText: null, css });
  assert.deepEqual(quiet, { output: null, consume: false });

  const failing = decideStop({ status: "completed", loop_count: 0, generation_id: "gen-1" }, flagged);
  assert.equal(failing.consume, true);
  assert.match(failing.output.followup_message, /--muted-foreground \(#b0b0b0\) on --background \(#f7f7fb\) is 2\.03:1/);

  const otherGeneration = decideStop({ status: "completed", loop_count: 0, generation_id: "gen-2" }, flagged);
  assert.deepEqual(otherGeneration, { output: null, consume: false });

  const looped = decideStop({ status: "completed", loop_count: 1, generation_id: "gen-1" }, flagged);
  assert.deepEqual(looped, { output: null, consume: true });

  const aborted = decideStop({ status: "error", loop_count: 0, generation_id: "gen-1" }, flagged);
  assert.deepEqual(aborted, { output: null, consume: true });
});

test("a non-hex reading token is a violation", () => {
  const css = shipped.replace(/(--ink-soft:\s*)#6b7280/, "$1rgb(176, 176, 176)");
  const hit = checkTokenContrast(css).violations.find(
    (item) => item.theme === "light" && item.foreground === "--muted-foreground" && item.background === "--background",
  );
  assert.ok(hit);
  assert.equal(hit.ratio, null);
  assert.match(hit.foregroundValue, /rgb\(176, 176, 176\)/);
});

test("formatRatio keeps a 4.499 failure from printing as 4.50:1", () => {
  assert.equal(formatRatio(4.499), "4.499:1");
  assert.equal(formatRatio(4.5), "4.50:1");
});

test("safeConversationId refuses . and ..", () => {
  assert.equal(safeConversationId(".."), "default");
  assert.equal(safeConversationId("."), "default");
  assert.equal(safeConversationId("sim-token"), "sim-token");
});

test("the dark token block is .dark, not a later html.dark rule", () => {
  const css = `${shipped}\nhtml.dark { --background: #000000; --foreground: #ffffff; }\n`;
  const dark = themeDeclarations(css).dark;
  assert.equal(dark.get("--paper"), "#12141c");
  assert.notEqual(dark.get("--background"), "#000000");
});

function runHook(command, input, env) {
  return spawnSync(command, { cwd: root, input, encoding: "utf8", env });
}

test("tokenEditFlag reads the top-level file_path when edits also have file_path", () => {
  const flagged = tokenEditFlag({
    conversation_id: "nested",
    generation_id: "gen-nested",
    file_path: "app/globals.css",
    edits: [{ file_path: "app/invoices/page.tsx", old_string: "Overdue", new_string: "Past due" }],
  });
  assert.equal(flagged?.filePath, "app/globals.css");
  assert.equal(flagged?.generationId, "gen-nested");

  assert.equal(
    tokenEditFlag({
      file_path: "app/invoices/page.tsx",
      edits: [{ file_path: "app/globals.css", old_string: "a", new_string: "b" }],
    }),
    null,
  );
});

test("the collect script flags a token edit when edits contain another file_path", () => {
  const dir = mkdtempSync(join(tmpdir(), "ledgerly-contrast-"));
  const env = { ...process.env, LEDGERLY_CONTRAST_FLAG_DIR: dir };
  const collect = runHook(
    ".cursor/hooks/contrast-collect.sh",
    JSON.stringify({
      conversation_id: "nested-shell",
      generation_id: "gen-nested",
      file_path: join(root, "app/globals.css"),
      edits: [{ file_path: join(root, "app/invoices/page.tsx"), old_string: "Overdue", new_string: "Past due" }],
    }),
    env,
  );
  assert.equal(collect.status, 0);
  assert.equal(collect.stdout, "");
  const body = readFileSync(join(dir, "nested-shell"), "utf8");
  assert.equal(body.split("\n")[0], "gen-nested");
  assert.match(body, /app\/globals\.css/);
  rmSync(dir, { recursive: true, force: true });
});

test("the stop process returns followup_message for a flagged failing palette", () => {
  const dir = mkdtempSync(join(tmpdir(), "ledgerly-contrast-"));
  const cssPath = join(dir, "globals.css");
  writeFileSync(cssPath, shipped.replace(/(--ink-soft:\s*)#6b7280/, "$1#B0B0B0"));
  const flagDirPath = join(dir, "flags");
  const env = {
    ...process.env,
    LEDGERLY_CONTRAST_FLAG_DIR: flagDirPath,
    LEDGERLY_CONTRAST_CSS: cssPath,
  };
  const collect = runHook(
    ".cursor/hooks/contrast-collect.sh",
    JSON.stringify({
      conversation_id: "failing-palette",
      generation_id: "gen-fail",
      file_path: join(root, "app/globals.css"),
      edits: [{ old_string: "--ink-soft: #6b7280;", new_string: "--ink-soft: #B0B0B0;" }],
    }),
    env,
  );
  assert.equal(collect.status, 0);
  const stop = runHook(
    ".cursor/hooks/contrast-check.mjs",
    JSON.stringify({
      conversation_id: "failing-palette",
      generation_id: "gen-fail",
      status: "completed",
      loop_count: 0,
    }),
    env,
  );
  assert.equal(stop.status, 0);
  assert.match(stop.stdout, /"followup_message":/);
  assert.match(stop.stdout, /#b0b0b0/);
  assert.match(stop.stdout, /2\.03:1/);
  assert.equal(existsSync(join(flagDirPath, "failing-palette")), false);
  rmSync(dir, { recursive: true, force: true });
});

test("an invoices-page edit produces no hook output", () => {
  const dir = mkdtempSync(join(tmpdir(), "ledgerly-contrast-"));
  const env = { ...process.env, LEDGERLY_CONTRAST_FLAG_DIR: dir };
  const payload = {
    conversation_id: "app-edit",
    generation_id: "gen-app",
    file_path: join(root, "app/invoices/page.tsx"),
    edits: [
      {
        old_string: '{ id: "OVERDUE", label: "Overdue" }',
        new_string: '{ id: "OVERDUE", label: "Past due" }',
      },
    ],
  };
  const collect = runHook(".cursor/hooks/contrast-collect.sh", JSON.stringify(payload), env);
  const stop = runHook(
    ".cursor/hooks/contrast-check.mjs",
    JSON.stringify({ conversation_id: "app-edit", generation_id: "gen-app", status: "completed", loop_count: 0 }),
    env,
  );
  assert.equal(collect.status, 0);
  assert.equal(collect.stdout, "");
  assert.equal(stop.status, 0);
  assert.equal(stop.stdout, "");
  rmSync(dir, { recursive: true, force: true });
});

test("a token-file edit on the shipped palette produces no followup", () => {
  const dir = mkdtempSync(join(tmpdir(), "ledgerly-contrast-"));
  const env = { ...process.env, LEDGERLY_CONTRAST_FLAG_DIR: dir };
  const collect = runHook(
    ".cursor/hooks/contrast-collect.sh",
    JSON.stringify({
      conversation_id: "token-edit",
      generation_id: "gen-token",
      file_path: join(root, "app/globals.css"),
      edits: [{ old_string: "--indigo: #4f46e5;", new_string: "--indigo: #4f46e5;" }],
    }),
    env,
  );
  const flag = join(dir, "token-edit");
  assert.equal(collect.status, 0);
  assert.equal(collect.stdout, "");
  assert.equal(readFileSync(flag, "utf8").split("\n")[0], "gen-token");
  const stop = runHook(
    ".cursor/hooks/contrast-check.mjs",
    JSON.stringify({
      conversation_id: "token-edit",
      generation_id: "gen-token",
      status: "completed",
      loop_count: 0,
    }),
    env,
  );
  assert.equal(stop.status, 0);
  assert.equal(stop.stdout, "");
  assert.equal(existsSync(flag), false);
  rmSync(dir, { recursive: true, force: true });
});
