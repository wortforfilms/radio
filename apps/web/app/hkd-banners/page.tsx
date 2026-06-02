import { hkdHeroBannerProvenance, hkdHeroBanners } from "@shared/hkd-hero-banners";
import HkdBannerGrid from "./HkdBannerGrid";

export default function HkdBannersPage() {
  return (
    <main className="hkd-banner-shell">
      <section className="hkd-banner-hero">
        <div>
          <p className="eyebrow">Maataa • HKD • Three.js Universe</p>
          <h1>HKD Sharp Diffusion Hero Banners</h1>
          <p>
            Absorbed from the provided preview HTML into a local Three.js runtime surface. Diffusion language and banner taxonomy are preserved, while CDN imports, heavy blur, and static preview assumptions are removed.
          </p>
        </div>
        <div className="dictionary-stats" aria-label="HKD banner metrics">
          <span>Banners <b>{hkdHeroBanners.length}</b></span>
          <span>Status <b>Scaffold</b></span>
          <span>PHKD <b>On</b></span>
          <span>Source <b>Local</b></span>
        </div>
      </section>
      <section className="page hkd-banner-page">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Absorbed Preview</p>
            <h2>Hero Banner Registry</h2>
          </div>
          <span>{hkdHeroBannerProvenance}</span>
        </div>
        <p className="reference-feed-note">
          These are UI banner scaffolds and local Three.js procedural scenes. They are not production brand approvals, final renders, or external asset claims.
        </p>
        <HkdBannerGrid banners={hkdHeroBanners} />
      </section>
    </main>
  );
}
