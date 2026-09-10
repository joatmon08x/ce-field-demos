"use client";

import { useEffect, useState } from "react";
import {
  getSuggestedCredit,
  type SuggestedCreditResponse,
} from "@/lib/disputes/suggested-credit-api";
import { formatUsd } from "@/lib/money";
import { cn } from "@/lib/utils";

type SuggestedCreditProps = {
  disputeId: string;
  catalogPriceCents: number;
  planName: string;
};

export function SuggestedCredit({
  disputeId,
  catalogPriceCents,
  planName,
}: SuggestedCreditProps) {
  const [credit, setCredit] = useState<SuggestedCreditResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    getSuggestedCredit(disputeId)
      .then((result) => {
        if (active) setCredit(result);
      })
      .catch(() => {
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, [disputeId]);

  const overCatalog =
    credit !== null && credit.suggestedCreditCents > catalogPriceCents;

  return (
    <div
      className={cn(
        "rounded-md px-3 py-2",
        error || overCatalog ? "bg-danger-soft" : "bg-indigo-soft",
      )}
    >
      <p
        className={cn(
          "text-lg font-semibold tracking-tight",
          error || overCatalog ? "text-danger" : "text-foreground",
        )}
      >
        {error
          ? "Suggested credit unavailable"
          : credit === null
            ? "Loading suggested credit…"
            : `Suggested credit ${formatUsd(credit.suggestedCreditCents)}`}
      </p>
      <p
        className={cn(
          "text-xs",
          error || overCatalog ? "text-danger" : "text-muted-foreground",
        )}
      >
        {error
          ? "The credit policy API could not be reached."
          : credit === null
            ? "Loading credit policy."
            : overCatalog
              ? `Above the ${planName} catalog price of ${formatUsd(catalogPriceCents)}. Source: suggested-credit API ${credit.apiVersion}.`
              : `Within the ${planName} catalog price of ${formatUsd(catalogPriceCents)}. Source: suggested-credit API ${credit.apiVersion}.`}
      </p>
    </div>
  );
}
