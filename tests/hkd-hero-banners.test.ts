import { describe, expect, it } from "vitest";
import { hkdHeroBannerProvenance, hkdHeroBanners } from "@shared/hkd-hero-banners";

describe("HKD hero banner registry", () => {
  it("absorbs all preview banner concepts with local provenance", () => {
    expect(hkdHeroBanners).toHaveLength(15);
    expect(hkdHeroBannerProvenance).toContain("preview (17).html");
    expect(hkdHeroBanners.map((banner) => banner.key)).toContain("lipi");
    expect(hkdHeroBanners.every((banner) => banner.status === "absorbed_scaffold")).toBe(true);
  });
});
