import { PRODUCT } from "@/lib/brand";

/** Fake signed-in operator. No auth, no real people. */
export const DEMO_OPERATOR = {
  name: "Avery Quinn",
  role: "Billing ops",
  initials: "AQ",
  workspace: PRODUCT.workspaceName,
  email: "avery.quinn@packetline.example",
} as const;
