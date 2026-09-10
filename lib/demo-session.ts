import { getActiveBrand } from "@/lib/brand";

/** Fake signed-in operator. No auth, no real people. */
export const DEMO_OPERATOR = {
  name: "Avery Quinn",
  role: getActiveBrand().operatorRole,
  initials: "AQ",
  workspace: getActiveBrand().workspaceName,
  email: getActiveBrand().operatorEmail,
} as const;
