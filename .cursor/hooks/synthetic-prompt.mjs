#!/usr/bin/env node
// beforeSubmitPrompt: block live credentials and non-.example emails.
// Fieldnote addresses end in .example. Anything else is outside the synthetic set.
// Credential hits are reported by kind, not by value. Fails open on unreadable
// input so a payload change cannot lock the composer.

import { pathToFileURL } from "node:url";

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

// High-confidence shapes only. A discussion of "api keys" should still send.
const SECRET_RULES = [
  ["private key", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/],
  ["GitHub token", /\bgh[pousr]_[A-Za-z0-9]{20,}\b/],
  ["Slack token", /\bxox[baprs]-[A-Za-z0-9-]{10,}/],
  ["provider secret key", /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{10,}\b/],
  ["SendGrid key", /\bSG\.[A-Za-z0-9_-]{20,}\b/],
];

export function isSyntheticEmail(address) {
  const domain = address.split("@").pop().toLowerCase().replace(/\.$/, "");
  return domain === "example" || domain.endsWith(".example");
}

export function findEmails(prompt) {
  const found = [];
  for (const match of prompt.match(EMAIL_RE) ?? []) {
    if (!isSyntheticEmail(match) && !found.includes(match)) found.push(match);
  }
  return found;
}

export function findSecrets(prompt) {
  return SECRET_RULES.filter(([, pattern]) => pattern.test(prompt)).map(([label]) => label);
}

function userMessage(emails, secrets) {
  const parts = [];
  if (emails.length > 0) {
    let shown = emails.slice(0, 5).join(", ");
    if (emails.length > 5) shown += `, and ${emails.length - 5} more`;
    parts.push(`This prompt includes ${shown}. Addresses stay on the synthetic set and end in .example.`);
  }
  if (secrets.length > 0) {
    parts.push(`This prompt includes a live credential (${secrets.join(", ")}). Remove it before sending.`);
  }
  return parts.join(" ");
}

export function checkPrompt(input) {
  const prompt = input && typeof input === "object" ? input.prompt : undefined;
  if (typeof prompt !== "string" || prompt.trim() === "") return { continue: true };

  const emails = findEmails(prompt);
  const secrets = findSecrets(prompt);
  if (emails.length === 0 && secrets.length === 0) return { continue: true };

  return { continue: false, user_message: userMessage(emails, secrets) };
}

async function main() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;

  let input = {};
  try {
    input = raw.trim() ? JSON.parse(raw) : {};
  } catch {
    input = {};
  }
  process.stdout.write(JSON.stringify(checkPrompt(input)));
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await main();
}
