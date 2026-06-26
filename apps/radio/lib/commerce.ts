// Radio Vaigyaaniq — commerce & entitlement logic (vendored, self-contained).
// Money is in MINOR units (INR paise, USD cents) — Razorpay-style.
export type Currency = "INR" | "USD";
export type ProductType = "track" | "album" | "all_access";
export type PurchaseStatus = "created" | "paid" | "failed" | "refunded";

export interface Money { minor: number; currency: Currency; }

export interface TrackLike {
  id: string;
  albumId?: string | null;
  priceInr?: number | null;
  priceUsd?: number | null;
  previewSeconds?: number | null;
  published?: boolean | null;
}

export interface AlbumLike {
  id: string;
  trackCount: number;
  freeTracks?: number | null;
  priceInrOverride?: number | null;
  priceUsdOverride?: number | null;
}

export interface EntitlementLike {
  scope: ProductType;
  trackId?: string | null;
  albumId?: string | null;
  active?: boolean | null;
}

export const DEFAULT_SINGLE_PRICE: Record<Currency, number> = { INR: 2900, USD: 99 };
export const ALL_ACCESS_PRICE: Record<Currency, number> = { INR: 29900, USD: 999 };
export const DEFAULT_FREE_TRACKS = 2;
export const DEFAULT_PREVIEW_SECONDS = 45;

const pick = (cur: Currency, inr?: number | null, usd?: number | null): number => {
  const v = cur === "INR" ? inr : usd;
  return v == null ? DEFAULT_SINGLE_PRICE[cur] : v;
};

export function trackPriceMinor(track: TrackLike, currency: Currency): number {
  return pick(currency, track.priceInr, track.priceUsd);
}

export function albumPriceMinor(album: AlbumLike, currency: Currency, singleMinor?: number): number {
  const override = currency === "INR" ? album.priceInrOverride : album.priceUsdOverride;
  if (override != null) return override;
  const free = album.freeTracks ?? DEFAULT_FREE_TRACKS;
  const billable = Math.max(1, album.trackCount - free);
  const single = singleMinor ?? DEFAULT_SINGLE_PRICE[currency];
  return billable * single;
}

export function albumFullPriceMinor(album: AlbumLike, currency: Currency, singleMinor?: number): number {
  const single = singleMinor ?? DEFAULT_SINGLE_PRICE[currency];
  return Math.max(0, album.trackCount) * single;
}

export function albumSavings(album: AlbumLike, currency: Currency, singleMinor?: number) {
  const full = albumFullPriceMinor(album, currency, singleMinor);
  const price = albumPriceMinor(album, currency, singleMinor);
  const saved = Math.max(0, full - price);
  const pct = full > 0 ? Math.round((saved / full) * 100) : 0;
  return { fullMinor: full, priceMinor: price, savedMinor: saved, percentOff: pct };
}

export function formatMoney(minor: number, currency: Currency): string {
  const symbol = currency === "INR" ? "₹" : "$";
  return symbol + (minor / 100).toFixed(2);
}

export function hasTrackAccess(
  entitlements: EntitlementLike[],
  track: Pick<TrackLike, "id" | "albumId">,
): boolean {
  return entitlements.some((e) => {
    if (e.active === false) return false;
    if (e.scope === "all_access") return true;
    if (e.scope === "album") return !!track.albumId && e.albumId === track.albumId;
    if (e.scope === "track") return e.trackId === track.id;
    return false;
  });
}

export function canPlayFull(entitlements: EntitlementLike[], track: TrackLike): boolean {
  return track.published === true && hasTrackAccess(entitlements, track);
}

export function previewSeconds(track: TrackLike): number {
  return track.previewSeconds ?? DEFAULT_PREVIEW_SECONDS;
}

export function trackAccessState(
  entitlements: EntitlementLike[],
  track: TrackLike,
): "full" | "preview" | "locked" {
  if (canPlayFull(entitlements, track)) return "full";
  return track.published ? "preview" : "locked";
}

export function purchaseAmount(
  productType: ProductType,
  currency: Currency,
  opts: { track?: TrackLike; album?: AlbumLike; singleMinor?: number } = {},
): Money {
  let minor = 0;
  if (productType === "track" && opts.track) minor = trackPriceMinor(opts.track, currency);
  else if (productType === "album" && opts.album) minor = albumPriceMinor(opts.album, currency, opts.singleMinor);
  else if (productType === "all_access") minor = ALL_ACCESS_PRICE[currency];
  return { minor, currency };
}
