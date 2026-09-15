import { describe, expect, it } from "vitest";
import {
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
      "Overdue / Needs review filter does not change the list",
    );
    expect(FIELD_DEMO_SUGGESTED_CREDIT_TITLE).toBe(
      "Dispute dsp_1043 claims $400 against a $249 Scale invoice",
    );
    expect(FIELD_DEMO_FILTER_TITLE).toBe("Overdue / Needs review filter does not change the list");
  });
});
