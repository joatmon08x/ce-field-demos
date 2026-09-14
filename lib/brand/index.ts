import { ACTIVE_BRAND_ID, SHIPPED_DEFAULT_BRAND_ID } from "@/lib/brand/active";
import { MEDLY } from "@/lib/brand/profiles/medly";
import { ROUTERLY } from "@/lib/brand/profiles/routerly";
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
  routerly: ROUTERLY,
};

export function getBrand(id: BrandId): BrandProfile {
  return BRAND_PROFILES[id];
}

export function getActiveBrand(): BrandProfile {
  return BRAND_PROFILES[ACTIVE_BRAND_ID];
}

export function parseStartPrompt(text: string): BrandId | null {
  const match = text.match(/\b(medly|saasly|routerly)\b/i);
  if (!match) return null;
  const id = match[1].toLowerCase();
  return isBrandId(id) ? id : null;
}

export { ACTIVE_BRAND_ID, BRAND_IDS, isBrandId, SHIPPED_DEFAULT_BRAND_ID };
export type { BrandId, BrandProfile, ExtraAccount };
