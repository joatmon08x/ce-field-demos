import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";

const hook = join(process.cwd(), "hooks/check-money-formatting.mjs");
const temporaryDirectories: string[] = [];

function runHook(source: string) {
  const directory = mkdtempSync(join(tmpdir(), "ledgerly-money-hook-"));
  temporaryDirectories.push(directory);
  const filePath = join(directory, "example.tsx");
  writeFileSync(filePath, source);

  return spawnSync(process.execPath, [hook], {
    cwd: process.cwd(),
    encoding: "utf8",
    input: JSON.stringify({ file_path: filePath }),
  });
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

describe("money-formatting afterFileEdit hook", () => {
  it("allows the staged comment and formatUsd", () => {
    const result = runHook(`
      // let capUsd = "$" + (catalogPrice / 100).toFixed(2);
      /*
       * let oldCapUsd = "$" + (catalogPrice / 100).toFixed(2);
       */
      const capUsd = formatUsd(catalogPrice);
    `);

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
  });

  it("rejects manual formatting of catalog prices", () => {
    const result = runHook(
      'let capUsd = "$" + (catalogPrice / 100).toFixed(2);\n',
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Unsafe catalog-price formatting");
    expect(result.stderr).toContain(
      "Keep catalog prices in cents and format them with formatUsd(catalogPrice).",
    );
  });
});
