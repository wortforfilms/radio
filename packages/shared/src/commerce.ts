// Radio Vaigyaaniq — commerce & entitlement logic (preview / pro / album / all-access).
// Pure, dependency-free. Money is in MINOR units (INR paise, USD cents) — Razorpay-style.
// Mirrors the Prisma models Album / RadioTrack / Purchase / Entitlement.

export type Currency = "INR" | "USD";
export type ProductType = "track" | "album" | "all_access";
export type PurchaseStatus = "created" | "paid" | "failed" | "refunded";

export interface Money {
  /** amount in minor units (paise / cents) */
  minor: number;
  currency: Currency;
}

export interface TrackLike {
  id: string;
  albumId?: string | null;
  /** per-currency price in minor units; falls back to DEFAULT_SINGLE_PRICE */
  priceInr?: number | null;
  priceUsd?: number | null;
  previewSeconds?: number | null;
  /** true only when rights-verified & promoted (mirrors canPlay) */
  published?: boolean | null;
}

export interface AlbumLike {
  id: string;
  trackCount: number;
  /** album charges for (trackCount - freeTracks) singles */
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

/** Defaults (minor units). Single ₹29.00 / $0.99 · All-access ₹299.00 / $9.99. */
export const DEFAULT_SINGLE_PRICE: Record<Currency, number> = { INR: 2900, USD: 99 };
export const ALL_ACCESS_PRICE: Record<Currency, number> = { INR: 29900, USD: 999 };
export const DEFAULT_FREE_TRACKS = 2;
export const DEFAULT_PREVIEW_SECONDS = 45;

const pick = (cur: Currency, inr?: number | null, usd?: number | null): number => {
  const v = cur === "INR" ? inr : usd;
  return v == null ? DEFAULT_SINGLE_PRICE[cur] : v;
};

/** Per-track price in minor units for a currency. */
export function trackPriceMinor(track: TrackLike, currency: Currency): number {
  return pick(currency, track.priceInr, track.priceUsd);
}

/**
 * Album price (cheaper-than-N-singles): charge for (trackCount - freeTracks) singles,
 * minimum one. An explicit album override wins. `singleMinor` lets you pass the real
 * average single price; otherwise the per-currency default is used.
 */
export function albumPriceMinor(album: AlbumLike, currency: Currency, singleMinor?: number): number {
  const override = currency === "INR" ? album.priceInrOverride : album.priceUsdOverride;
  if (override != null) return override;
  const free = album.freeTracks ?? DEFAULT_FREE_TRACKS;
  const billable = Math.max(1, album.trackCount - free);
  const single = singleMinor ?? DEFAULT_SINGLE_PRICE[currency];
  return billable * single;
}

/** What you'd pay buying every track individually. */
export function albumFullPriceMinor(album: AlbumLike, currency: Currency, singleMinor?: number): number {
  const single = singleMinor ?? DEFAULT_SINGLE_PRICE[currency];
  return Math.max(0, album.trackCount) * single;
}

/** Album savings in minor units and as a rounded percentage off the per-track total. */
export function albumSavings(album: AlbumLike, currency: Currency, singleMinor?: number) {
  const full = albumFullPriceMinor(album, currency, singleMinor);
  const price = albumPriceMinor(album, currency, singleMinor);
  const saved = Math.max(0, full - price);
  const pct = full > 0 ? Math.round((saved / full) * 100) : 0;
  return { fullMinor: full, priceMinor: price, savedMinor: saved, percentOff: pct };
}

/** Format minor units as a display string. ₹29.00 / $0.99 */
export function formatMoney(minor: number, currency: Currency): string {
  const symbol = currency === "INR" ? "₹" : "$";
  return symbol + (minor / 100).toFixed(2);
}

/** Does this set of entitlements grant full access to the track? */
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

/**
 * Final playback decision. Fail-closed: a track must be PUBLISHED (rights-verified)
 * AND the user must hold an entitlement. Otherwise the user gets preview only.
 */
export function canPlayFull(entitlements: EntitlementLike[], track: TrackLike): boolean {
  return track.published === true && hasTrackAccess(entitlements, track);
}

/** Preview window (seconds) for an un-entitled listener. */
export function previewSeconds(track: TrackLike): number {
  return track.previewSeconds ?? DEFAULT_PREVIEW_SECONDS;
}

/** Convenience: the access state for a track, for UI. */
export function trackAccessState(
  entitlements: EntitlementLike[],
  track: TrackLike,
): "full" | "preview" | "locked" {
  if (canPlayFull(entitlements, track)) return "full";
  return track.published ? "preview" : "locked";
}

/** Build a Purchase draft (amount + currency) for a product, ready for the payment provider. */
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

// ---------------------------------------------------------------------------
// Account layer: cart, wallet, settings (mirrors Cart/CartItem/Wallet/UserSettings)
// ---------------------------------------------------------------------------

export type WalletKind = "topup" | "debit" | "refund" | "credit" | "adjustment";

export interface CartItemLike {
  productType: ProductType;
  trackId?: string | null;
  albumId?: string | null;
  amountMinor: number;
  currency: Currency;
}

export interface WalletLike {
  currency: Currency;
  balance: number; // minor units
}

/** Build a cart line for a product at current prices. */
export function buildCartItem(
  productType: ProductType,
  currency: Currency,
  opts: { track?: TrackLike; album?: AlbumLike; singleMinor?: number } = {},
): CartItemLike {
  const { minor } = purchaseAmount(productType, currency, opts);
  return {
    productType, currency, amountMinor: minor,
    trackId: opts.track?.id ?? null, albumId: opts.album?.id ?? null,
  };
}

/** Sum of a cart's items in one currency (ignores items in other currencies). */
export function cartSubtotal(items: CartItemLike[], currency: Currency): number {
  return items.filter((i) => i.currency === currency).reduce((s, i) => s + i.amountMinor, 0);
}

/** Checkout summary: subtotal, optional wallet application, amount still due to the provider. */
export function checkoutSummary(
  items: CartItemLike[],
  currency: Currency,
  walletBalanceMinor = 0,
  useWallet = true,
) {
  const subtotal = cartSubtotal(items, currency);
  const walletApplied = useWallet ? Math.min(walletBalanceMinor, subtotal) : 0;
  const dueMinor = subtotal - walletApplied;
  return { subtotalMinor: subtotal, walletAppliedMinor: walletApplied, dueMinor, currency };
}

/** Balance (minor units) for a currency across a user's wallets. */
export function walletBalance(wallets: WalletLike[], currency: Currency): number {
  return wallets.find((w) => w.currency === currency)?.balance ?? 0;
}

export function canAfford(balanceMinor: number, amountMinor: number): boolean {
  return balanceMinor >= amountMinor;
}

/**
 * Apply a wallet movement. Debits must not overdraw (returns ok:false).
 * Returns the new balance and a transaction record skeleton.
 */
export function applyWallet(
  balanceMinor: number,
  kind: WalletKind,
  amountMinor: number, // always positive; sign derived from kind
  currency: Currency,
  reference?: string,
) {
  const debit = kind === "debit";
  const delta = debit ? -amountMinor : amountMinor;
  if (debit && amountMinor > balanceMinor) {
    return { ok: false as const, balanceAfter: balanceMinor, txn: null };
  }
  const balanceAfter = balanceMinor + delta;
  return {
    ok: true as const,
    balanceAfter,
    txn: { kind, amountMinor: delta, currency, balanceAfter, reference: reference ?? null },
  };
}

export interface UserSettingsLike {
  language: "hi" | "en";
  preferredCurrency: Currency;
  audioQuality: "preview" | "standard" | "high";
  autoplay: boolean;
  theme: "dark" | "light";
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingOptIn: boolean;
}

export const DEFAULT_SETTINGS: UserSettingsLike = {
  language: "hi", preferredCurrency: "INR", audioQuality: "standard",
  autoplay: true, theme: "dark", emailNotifications: true,
  pushNotifications: false, marketingOptIn: false,
};
