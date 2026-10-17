#!/usr/bin/env node
// stop hook: WCAG 4.5:1 contrast for shared color tokens.
// Runs only after contrast-collect.sh has flagged an edit to app/globals.css.
// No CE Demo Builder accessibility library is in this repo, so the ratio math lives here.

import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const TOKEN_FILE = "app/globals.css";
export const MIN_CONTRAST = 4.5;

// Reading-text pairs. Each foreground is rendered on that background in the app.
export const TEXT_PAIRS = [
  ["--foreground", "--background"],
  ["--muted-foreground", "--background"],
  ["--muted-foreground", "--card"],
  ["--card-foreground", "--card"],
  ["--popover-foreground", "--popover"],
  ["--primary-foreground", "--primary"],
  ["--secondary-foreground", "--secondary"],
  ["--accent-foreground", "--accent"],
  ["--sidebar-foreground", "--sidebar"],
];

export function flagDir() {
  if (process.env.LEDGERLY_CONTRAST_FLAG_DIR) return process.env.LEDGERLY_CONTRAST_FLAG_DIR;
  return join(tmpdir(), "ledgerly-contrast-flags");
}

export function safeConversationId(conversationId) {
  const raw = typeof conversationId === "string" && conversationId.trim() ? conversationId.trim() : "default";
  const safe = raw.replace(/[^A-Za-z0-9._-]/g, "_");
  if (safe === "." || safe === "..") return "default";
  return safe;
}

export function flagPath(conversationId) {
  return join(flagDir(), safeConversationId(conversationId));
}

function channel(hex, offset) {
  const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex) {
  return 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5);
}

export function normalizeHex(value) {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!match) return null;
  let hex = match[1].toLowerCase();
  if (hex.length === 3) hex = [...hex].map((char) => char + char).join("");
  return `#${hex}`;
}

// WCAG 2 contrast ratio. `foreground` and `background` are #rgb or #rrggbb.
export function contrastRatio(foreground, background) {
  const fg = normalizeHex(foreground);
  const bg = normalizeHex(background);
  if (!fg || !bg) return null;
  const lighter = Math.max(relativeLuminance(fg), relativeLuminance(bg));
  const darker = Math.min(relativeLuminance(fg), relativeLuminance(bg));
  return (lighter + 0.05) / (darker + 0.05);
}

function extractBlock(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`(?:^|[\\n\\r])\\s*${escaped}\\s*\\{`).exec(css);
  if (!match) return "";
  let index = match.index + match[0].length;
  let depth = 1;
  let body = "";
  while (index < css.length && depth > 0) {
    const char = css[index];
    if (char === "{") depth += 1;
    else if (char === "}") depth -= 1;
    if (depth > 0) body += char;
    index += 1;
  }
  return body;
}

function parseDeclarations(block) {
  const decls = new Map();
  for (const match of block.matchAll(/(--[A-Za-z0-9-]+)\s*:\s*([^;]+);/g)) {
    decls.set(match[1], match[2].trim());
  }
  return decls;
}

function colorAlias(raw) {
  const alias = raw.match(/^var\(\s*(--[A-Za-z0-9-]+)\s*\)$/);
  return alias ? alias[1] : null;
}

function resolveColor(decls, name, seen = new Set()) {
  if (seen.has(name)) return null;
  const raw = decls.get(name);
  if (!raw) return null;
  const direct = normalizeHex(raw);
  if (direct) return direct;
  const alias = colorAlias(raw);
  if (!alias) return null;
  seen.add(name);
  return resolveColor(decls, alias, seen);
}

function terminalValue(decls, name, seen = new Set()) {
  if (seen.has(name)) return decls.get(name) ?? name;
  const raw = decls.get(name);
  if (!raw) return name;
  const alias = colorAlias(raw);
  if (!alias) return raw;
  seen.add(name);
  return terminalValue(decls, alias, seen);
}

export function themeDeclarations(css) {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const root = parseDeclarations(extractBlock(stripped, ":root"));
  const dark = parseDeclarations(extractBlock(stripped, ".dark"));
  return {
    light: root,
    dark: new Map([...root, ...dark]),
  };
}

export function checkTokenContrast(css) {
  const themes = themeDeclarations(css);
  const violations = [];
  for (const theme of ["light", "dark"]) {
    const decls = themes[theme];
    for (const [foreground, background] of TEXT_PAIRS) {
      if (!decls.has(foreground) || !decls.has(background)) continue;
      const foregroundValue = resolveColor(decls, foreground);
      const backgroundValue = resolveColor(decls, background);
      if (!foregroundValue || !backgroundValue) {
        violations.push({
          theme,
          foreground,
          foregroundValue: foregroundValue ?? terminalValue(decls, foreground),
          background,
          backgroundValue: backgroundValue ?? terminalValue(decls, background),
          ratio: null,
        });
        continue;
      }
      const ratio = contrastRatio(foregroundValue, backgroundValue);
      if (ratio == null || ratio >= MIN_CONTRAST) continue;
      violations.push({
        theme,
        foreground,
        foregroundValue,
        background,
        backgroundValue,
        ratio,
      });
    }
  }
  return { violations };
}

export function formatRatio(ratio) {
  const hundredths = Math.round(ratio * 100) / 100;
  if (ratio < MIN_CONTRAST && hundredths >= MIN_CONTRAST) {
    return `${(Math.floor(ratio * 1000) / 1000).toFixed(3)}:1`;
  }
  return `${hundredths.toFixed(2)}:1`;
}

export function formatFollowup(violations) {
  const lines = violations.map((item) => {
    const pair = `${item.theme} ${item.foreground} (${item.foregroundValue}) on ${item.background} (${item.backgroundValue})`;
    if (item.ratio == null) return `- ${pair} does not resolve to hex`;
    return `- ${pair} is ${formatRatio(item.ratio)}`;
  });
  const intro =
    violations.some((item) => item.ratio != null)
      ? `WCAG contrast in ${TOKEN_FILE} is below ${MIN_CONTRAST}:1.`
      : `A reading-text token in ${TOKEN_FILE} is not a hex color.`;
  return [intro, ...lines, "Adjust those token pairs so normal text stays at or above 4.5:1."].join("\n");
}

export function decideStop(input, { flagText, css }) {
  if (flagText == null) return { output: null, consume: false };

  const flagGeneration = flagText.split("\n")[0] ?? "";
  const stopGeneration = input && typeof input.generation_id === "string" ? input.generation_id : "";
  if (flagGeneration && stopGeneration && flagGeneration !== stopGeneration) {
    return { output: null, consume: false };
  }

  const status = input && typeof input.status === "string" ? input.status : "completed";
  const loopCount = input && typeof input.loop_count === "number" ? input.loop_count : 0;
  if (status !== "completed" || loopCount >= 1) return { output: null, consume: true };

  const { violations } = checkTokenContrast(css);
  if (violations.length === 0) return { output: null, consume: true };
  return { output: { followup_message: formatFollowup(violations) }, consume: true };
}

async function readStdin() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  return raw;
}

async function main() {
  let input = {};
  try {
    const raw = (await readStdin()).trim();
    input = raw ? JSON.parse(raw) : {};
  } catch {
    return;
  }

  const path = flagPath(input.conversation_id);
  if (!existsSync(path)) return;

  let flagText = "";
  let css = "";
  try {
    flagText = readFileSync(path, "utf8");
    css = readFileSync(join(process.cwd(), TOKEN_FILE), "utf8");
  } catch {
    return;
  }

  const decision = decideStop(input, { flagText, css });
  if (decision.consume) {
    try {
      unlinkSync(path);
    } catch {
      // The flag is a hint. A missing file on the next stop exits immediately.
    }
  }
  if (decision.output) process.stdout.write(`${JSON.stringify(decision.output)}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await main();
}
