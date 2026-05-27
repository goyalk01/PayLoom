import { timingSafeEqual } from "crypto";

/**
 * Timing-safe string comparison.
 * Prevents timing side-channel attacks when comparing secrets or signatures.
 */
export const safeCompare = (left: string, right: string): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(left), Buffer.from(right));
};
