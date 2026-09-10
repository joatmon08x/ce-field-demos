import { ACTIVE_BRAND_ID } from "@/lib/brand/active";
import { MEDLY } from "@/lib/brand/profiles/medly";
import { ROUTELY } from "@/lib/brand/profiles/routely";
import { SAASLY } from "@/lib/brand/profiles/saasly";
import {
  BRAND_IDS,
  isBrandId,
  type BrandId,
  type BrandProfile,
  type ExtraAccount,
} from "@/lib/brand/types";

export const BRAND_PROFILES: Record<BrandId, BrandProfile> = {
  medly: MEDLY,
  saasly: SAASLY,
  routely: ROUTELY,
};

export function getBrand(id: BrandId): BrandProfile {
  return BRAND_PROFILES[id];
}

export function getActiveBrand(): BrandProfile {
  return BRAND_PROFILES[ACTIVE_BRAND_ID];
}

export function parseStartPrompt(text: string): BrandId | null {
  const match = text.match(/\b(medly|saasly|routely)\b/i);
  if (!match) return null;
  const id = match[1].toLowerCase();
  return isBrandId(id) ? id : null;
}

export { ACTIVE_BRAND_ID, BRAND_IDS, isBrandId };
export type { BrandId, BrandProfile, ExtraAccount };
