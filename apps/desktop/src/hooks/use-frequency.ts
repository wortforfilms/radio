// Frequency tuner state. HONEST: Radio Vaigyaaniq holds no broadcast licence —
// the dial is a decorative candidate display (102.5 MHz default) that maps dial
// positions onto the REAL station lanes; it never claims FM transmission.
import { useCallback } from "react";
import { setPlayerState, usePlayerStore } from "../store/player-store";

export const FM_MIN = 88.0;
export const FM_MAX = 108.0;

export function useFrequency(stationSlugs: string[]) {
  const { frequencyMHz, stationSlug } = usePlayerStore();

  const tune = useCallback(
    (mhz: number) => {
      const clamped = Math.round(Math.min(FM_MAX, Math.max(FM_MIN, mhz)) * 10) / 10;
      // map the dial position onto a station lane (equal slices of the band)
      const slice = (FM_MAX - FM_MIN) / Math.max(1, stationSlugs.length);
      const index = Math.min(stationSlugs.length - 1, Math.floor((clamped - FM_MIN) / slice));
      setPlayerState({ frequencyMHz: clamped, stationSlug: stationSlugs[index] ?? null });
    },
    [stationSlugs]
  );

  /** Angle for the dial needle: FM band mapped to 270° sweep. */
  const needleDeg = ((frequencyMHz - FM_MIN) / (FM_MAX - FM_MIN)) * 270 - 135;

  return { frequencyMHz, stationSlug, tune, needleDeg };
}
