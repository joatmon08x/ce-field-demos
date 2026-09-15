#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { extname, resolve } from "node:path";

async function readHookInput() {
  let input = "";
  for await (const chunk of process.stdin) input += chunk;
  return input.trim() ? JSON.parse(input) : {};
}

const payload = await readHookInput();
const filePath = process.argv[2] ?? payload.file_path;

if (!filePath || ![".ts", ".tsx"].includes(extname(filePath))) process.exit(0);

const absolutePath = resolve(filePath);
if (!existsSync(absolutePath)) process.exit(0);

const unsafeCatalogFormatting =
  /(?:\bcatalogPrice\s*\/\s*100\b|\.toFixed\s*\(\s*2\s*\)|Intl\.NumberFormat|["'`]\$["'`]\s*\+)/;

let insideBlockComment = false;
const violations = [];

for (const [index, line] of readFileSync(absolutePath, "utf8").split("\n").entries()) {
  const trimmed = line.trimStart();
  if (insideBlockComment) {
    if (trimmed.includes("*/")) insideBlockComment = false;
    continue;
  }
  if (trimmed.startsWith("/*")) {
    if (!trimmed.includes("*/")) insideBlockComment = true;
    continue;
  }
  if (trimmed.startsWith("//")) continue;
  if (line.includes("catalogPrice") && unsafeCatalogFormatting.test(line)) {
    violations.push({ line, lineNumber: index + 1 });
  }
}

if (violations.length === 0) process.exit(0);

console.error(`Unsafe catalog-price formatting in ${filePath}:`);
for (const { line, lineNumber } of violations) {
  console.error(`  ${lineNumber}: ${line.trim()}`);
}
console.error("Keep catalog prices in cents and format them with formatUsd(catalogPrice).");
process.exit(1);
