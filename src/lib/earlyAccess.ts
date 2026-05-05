import { Episode } from "./types";

export const isInEarlyAccess = (ep: Pick<Episode, "early_access_until">): boolean => {
  if (!ep.early_access_until) return false;
  return new Date(ep.early_access_until).getTime() > Date.now();
};

/**
 * Determines if an episode should be locked behind VIP for the given user.
 * - Permanent VIP (is_vip=true) => locked unless user is VIP
 * - Early access window active => locked unless user is VIP, becomes free after
 */
export const isEpisodeLocked = (
  ep: Pick<Episode, "is_vip" | "early_access_until">,
  userIsVip: boolean
): boolean => {
  if (userIsVip) return false;
  if (ep.is_vip) return true;
  return isInEarlyAccess(ep);
};

export const formatCountdown = (target: string): string => {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return "0s";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (d > 0) return `${d}k ${h}s`;
  if (h > 0) return `${h}s ${m}d`;
  if (m > 0) return `${m}d ${s}son`;
  return `${s}son`;
};
