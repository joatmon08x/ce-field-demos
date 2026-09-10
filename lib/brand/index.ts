import { ACTIVE_BRAND_ID } from "@/lib/brand/active";
import { CLINICLY } from "@/lib/brand/profiles/clinicly";
import { PACKETLY } from "@/lib/brand/profiles/packetly";
import { SAASLY } from "@/lib/brand/profiles/saasly";
import {
  BRAND_IDS,
  isBrandId,
  type BrandId,
  type BrandProfile,
  type ExtraAccount,
} from "@/lib/brand/types";

export const BRAND_PROFILES: Record<BrandId, BrandProfile> = {
  clinicly: CLINICLY,
  saasly: SAASLY,
  packetly: PACKETLY,
};

export function getBrand(id: BrandId): BrandProfile {
  return BRAND_PROFILES[id];
}

export function getActiveBrand(): BrandProfile {
  return BRAND_PROFILES[ACTIVE_BRAND_ID];
}

export function parseStartPrompt(text: string): BrandId | null {
  const match = text.match(/\b(clinicly|saasly|packetly)\b/i);
  if (!match) return null;
  const id = match[1].toLowerCase();
  return isBrandId(id) ? id : null;
}

export { ACTIVE_BRAND_ID, BRAND_IDS, isBrandId };
export type { BrandId, BrandProfile, ExtraAccount };
