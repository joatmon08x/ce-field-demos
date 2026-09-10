/**
 * Extra book accounts seeded alongside the ten core customers.
 * Owned by the active brand profile. Same ids on every reseed.
 */

import { getActiveBrand } from "@/lib/brand";

export type { ExtraAccount } from "@/lib/brand/types";

export const EXTRA_ACCOUNTS = getActiveBrand().extraAccounts;
