export const metadata = { title: "Radio Vaigyaaniq" };

// Standalone Radio landing. Surfaces are the static /radio-html pages synced from the
// monorepo; tools and the payment API ship inside this app.
export default function RadioHome() {
  const surfaces: [string, string, string, string][] = [
    ["STN", "Stations", "Multi-station, multi-language lineup — Sanaatana Vaigyaniq, Kabir Clubbing, Ameerpur, Gurukul.", "/radio-html/Radio_Stations.html"],
    ["CAT", "Catalogue", "Cover-art gallery of the full indexed library with live search and preview badges.", "/radio-html/Radio_Catalogue.html"],
    ["APP", "Full App", "Standalone runtime mock — landing, visualizer, lyrics, storyboard.", "/radio-html/Radio_Vaigyaaniq_Full_App.html"],
    ["SURF", "All Surfaces", "Landing, runtime, visualizer, lyrics, TTS, gift, storyboard, evidence.", "/radio-html/surfaces/index.html"],
    ["ONB", "Track Onboarding", "Asset intake, credits, rights closure, station assignment — fail-closed canPlay.", "/radio-html/Track_Onboarding.html"],
    ["PAY", "Pricing & Checkout", "Preview free, Pro unlock, album bundle, all-access, ₹/$ ledger.", "/radio-html/Radio_Pricing_Checkout.html"],
    ["ACCT", "Account & Wallet", "Account, cart, per-currency wallet, settings.", "/radio-html/Radio_Account.html"],
    ["STAT", "Completion Status", "Release-readiness matrix (Phases 0–7).", "/radio-html/Radio_Completion_Status.html"],
  ];

  return (
    <>
      <header className="topbar">
        <div className="mark">RV</div>
        <div>
          <h1>Radio Vaigyaaniq</h1>
          <small>Independent broadcast app · standalone build</small>
        </div>
      </header>
      <main className="shell">
        <section className="hero">
          <span className="freq">102.5 MHz</span>
          <h2>Discover the Science, Tune into the Future.</h2>
          <p>
            Live listening, cinematic audio visualization, persona announcements, and
            provenance-first media workflows — extracted into a self-contained app with its
            own commerce backend. Playback stays fail-closed until rights and entitlement pass.
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

        <p className="foot">
          Radio Vaigyaaniq · P.H.K.D. / VESAHE Film Solutions Private Limited. Run{" "}
          <code>npm run assets:sync</code> to populate <code>/radio-html</code> surfaces.
        </p>
      </main>
    </>
  );
}
