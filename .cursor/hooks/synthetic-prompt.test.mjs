import assert from "node:assert/strict";
import { test } from "node:test";
import { checkPrompt } from "./synthetic-prompt.mjs";

test("allows seed .example addresses", () => {
  assert.deepEqual(checkPrompt({ prompt: "Nudge billing@acmenorth.example about the Scale invoice." }), {
    continue: true,
  });
});

test("blocks an address outside the synthetic set", () => {
  const result = checkPrompt({ prompt: "Send the nudge to collections@realvendor.io." });
  assert.equal(result.continue, false);
  assert.match(result.user_message, /collections@realvendor\.io/);
});

test("treats example.com as outside the synthetic set", () => {
  assert.equal(checkPrompt({ prompt: "Use ops@example.com." }).continue, false);
});

test("names the credential kind without echoing the value", () => {
  const result = checkPrompt({ prompt: "Key AKIAIOSFODNN7EXAMPLE for pay@silverpine.example" });
  assert.equal(result.continue, false);
  assert.match(result.user_message, /AWS access key/);
  assert.doesNotMatch(result.user_message, /AKIAIOSFODNN7EXAMPLE/);
});

test("allows a prompt with no address or credential", () => {
  assert.deepEqual(checkPrompt({ prompt: "Record a full check payment on the overdue invoice." }), {
    continue: true,
  });
});

test("fails open on a missing prompt", () => {
  assert.deepEqual(checkPrompt({}), { continue: true });
});
