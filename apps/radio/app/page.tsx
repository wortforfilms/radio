export const metadata = { title: "Radio Vaigyaaniq" };

// Standalone Radio landing. Surfaces are the static /radio-html pages synced from the
// monorepo; tools and the payment API ship inside this app.
export default function RadioHome() {
  const surfaces: [string, string, string, string][] = [
    ["STN", "Stations", "Multi-station, multi-language lineup derived from the local catalogue — live-stream URLs stay NULL until verified.", "/radio-html/Radio_Stations.html"],
    ["CAT", "Catalogue", "Cover-art gallery of the indexed library with search and preview/locked badges.", "/radio-html/Radio_Catalogue.html"],
    ["APP", "Full App", "Standalone runtime mock — landing, visualizer, lyrics, storyboard.", "/radio-html/Radio_Vaigyaaniq_Full_App.html"],
    ["SURF", "All Surfaces", "Landing, runtime, visualizer, lyrics, TTS, gift, storyboard, evidence.", "/radio-html/surfaces/index.html"],
    ["ONB", "Track Onboarding", "Asset intake, credits, rights closure, station assignment — fail-closed canPlay.", "/radio-html/Track_Onboarding.html"],
    ["PAY", "Pricing & Checkout", "Preview free, server-priced unlocks, album bundle, all-access, ₹/$ ledger, and a ₹10 proof lane for real settlement testing.", "/radio-html/Radio_Pricing_Checkout.html"],
    ["ACCT", "Account & Wallet", "Account, cart, per-currency wallet, settings.", "/radio-html/Radio_Account.html"],
    ["STAT", "Completion Status", "Release-readiness matrix (Phases 0–7).", "/radio-html/Radio_Completion_Status.html"],
  ];

  return (
    <>
      <header className="topbar">
        <div className="mark">RV</div>
        <div>
          <h1>Radio Vaigyaaniq</h1>
          <small>Independent broadcast app · controlled preview build</small>
        </div>
      </header>
      <main className="shell">
        <section className="hero">
          <span className="freq">102.5 MHz</span>
          <h2>Discover the Science, Tune into the Future.</h2>
          <p>
            Local preview listening, cinematic audio visualization, persona announcements, and
            provenance-first media workflows — extracted into a self-contained app with its
            own commerce backend. Live streams stay NULL, and playback stays fail-closed until
            rights and entitlement pass.
          </p>
        </section>

        <h2 className="section">Surfaces &amp; tools</h2>
        <div className="grid">
          {surfaces.map(([tag, title, desc, href]) => (
            <a className="card" key={title} href={href}>
              <div className="tag">{tag}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </a>
          ))}
        </div>

        <h2 className="section">API</h2>
        <div className="grid">
          <div className="card">
            <div className="tag">POST</div>
            <h3>/api/payments/order</h3>
            <p>Server-priced Razorpay order + Purchase record.</p>
          </div>
          <div className="card">
            <div className="tag">POST</div>
            <h3>/api/payments/webhook</h3>
            <p>Signature-verified capture → entitlement + receipt.</p>
          </div>
        </div>

        <h2 className="section">Ecosystem</h2>
        <div className="grid">
          <a className="card" href="/ecosystem">
            <div className="tag">MAP</div>
            <h3>Full route map</h3>
            <p>197 routes across 20 sections — radio, podcasts, research, academy, studio, CMS — each with an honest built / partial / planned status.</p>
          </a>
          <a className="card" href="/radio">
            <div className="tag">📻</div>
            <h3>Radio section</h3>
            <p>Runtime engine, now playing, schedule, archive, offline downloads, and explicit live-stream NULL state.</p>
          </a>
          <a className="card" href="/premium">
            <div className="tag">💎</div>
            <h3>Premium</h3>
            <p>₹29 tracks, ₹299 all-access — server-priced, webhook-verified.</p>
          </a>
        </div>

        <p className="foot">
          Radio Vaigyaaniq · P.H.K.D. / VESAHE Film Solutions Private Limited. Run{" "}
          <code>npm run assets:sync</code> to populate <code>/radio-html</code> surfaces.
        </p>
      </main>
    </>
  );
}
