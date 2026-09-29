import { describe, expect, it } from "vitest";
import {
  COLLECTIONS_COMMAND_CENTER_ISSUES,
  COLLECTIONS_COMMAND_CENTER_LINEAR,
  collectionsCommandCenterDescription,
  FIELD_DEMO_FILTER_TITLE,
  FIELD_DEMO_ISSUES,
  FIELD_DEMO_SUGGESTED_CREDIT_TITLE,
  LINEAR_FIELD_DEMOS_PROJECT,
} from "@/lib/runbooks/linear-field-demos";

describe("ce-field-demos Linear book", () => {
  it("keeps the three scoped issues and catalog prices", () => {
    expect(LINEAR_FIELD_DEMOS_PROJECT.name).toBe("ce-field-demos");
    expect(LINEAR_FIELD_DEMOS_PROJECT.catalogPricesUsd).toEqual(["$49", "$99", "$249"]);
    expect(FIELD_DEMO_ISSUES.map((issue) => issue.slug)).toEqual([
      "suggested-credit-v1",
      "filter-pills",
      "email-on-invoice",
    ]);
    expect(FIELD_DEMO_ISSUES[1]?.title).toBe(
      "Clicking Overdue or Needs review does not filter the queue",
    );
    expect(FIELD_DEMO_SUGGESTED_CREDIT_TITLE).toBe(
      "Suggested credit on dsp_1043 shows $400 instead of the $249 Scale cap",
    );
    expect(FIELD_DEMO_FILTER_TITLE).toBe(
      "Clicking Overdue or Needs review does not filter the queue",
    );
    expect(FIELD_DEMO_ISSUES.map((issue) => issue.previousTitles?.[0])).toEqual([
      "Dispute dsp_1043 claims $400 against a $249 Scale invoice",
      "Overdue / Needs review filter does not change the list",
      "Change customer email on invoice detail",
    ]);
  });

  it("keeps Collections Command Center slices out of FIELD_DEMO_ISSUES and tags their Linear bodies", () => {
    expect(COLLECTIONS_COMMAND_CENTER_ISSUES.map((issue) => issue.slug)).toEqual([
      "overdue-book",
      "full-payment",
      "reject-other-amount",
      "collection-note",
      "note-edit-window",
      "nudge-sent",
      "nudge-failed",
      "collections-kpi",
      "amount-mask",
    ]);
    const fieldTitles = new Set(FIELD_DEMO_ISSUES.map((issue) => issue.title));
    expect(COLLECTIONS_COMMAND_CENTER_LINEAR.state).toBe("Todo");
    expect(COLLECTIONS_COMMAND_CENTER_LINEAR.priority).toBe(3);
    expect(COLLECTIONS_COMMAND_CENTER_LINEAR.note).toContain("Collections Command Center feature");
    for (const [index, issue] of COLLECTIONS_COMMAND_CENTER_ISSUES.entries()) {
      expect(fieldTitles.has(issue.title)).toBe(false);
      const description = collectionsCommandCenterDescription(issue);
      expect(description.startsWith(COLLECTIONS_COMMAND_CENTER_LINEAR.note)).toBe(true);
      expect(description).toContain(`Slice ${index + 1} of ${COLLECTIONS_COMMAND_CENTER_ISSUES.length}`);
      const covers = issue.covers.map((id) => id.replaceAll("-", "\u2011")).join(", ");
      expect(description).toContain(`Covers ${covers}`);
      expect(description).not.toMatch(/FR-\d/);
      expect(description).toContain("## Acceptance");
      expect(description).not.toMatch(/\$(79|199)\b/);
    }
    const covered = COLLECTIONS_COMMAND_CENTER_ISSUES.flatMap((issue) => [...issue.covers]);
    expect(covered).toEqual([
      "FR-1",
      "FR-2",
      "FR-3",
      "FR-4",
      "FR-12",
      "FR-13",
      "FR-15",
      "FR-16",
      "FR-17",
      "FR-18",
      "FR-14",
      "FR-5",
      "FR-6",
      "FR-7",
      "FR-8",
      "FR-9",
      "FR-10",
      "FR-11",
      "FR-19",
      "FR-20",
      "FR-21",
      "FR-22",
      "FR-23",
      "FR-24",
    ]);
  });
});
