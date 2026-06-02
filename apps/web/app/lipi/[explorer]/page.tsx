import {
  getLipiExplorerPage,
  getLipiMatrixByExplorer,
  lipiExplorerPages,
  lipiPhkdRule
} from "@shared/lipi-civilization-matrix";

type PageProps = {
  params: Promise<{ explorer: string }>;
};

export function generateStaticParams() {
  return lipiExplorerPages.map((page) => ({ explorer: page.key }));
}

export async function generateMetadata({ params }: PageProps) {
  const { explorer } = await params;
  const page = getLipiExplorerPage(explorer);
  return {
    title: page ? `${page.name} | Lipi Matrix` : "Lipi Explorer"
  };
}

export default async function LipiExplorerPage({ params }: PageProps) {
  const { explorer } = await params;
  const page = getLipiExplorerPage(explorer);
  const records = getLipiMatrixByExplorer(explorer);

  if (!page) {
    return (
      <main>
        <section className="page lipi-page">
          <h1>Lipi explorer not found</h1>
          <a href="/lipi">Return to Lipi Matrix</a>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="lipi-hero">
        <div>
          <p className="eyebrow">Lipi Explorer</p>
          <h1>{page.name}</h1>
          <p>{page.description}</p>
          <div className="ayodhya-actions">
            <a href="/lipi">Lipi Matrix</a>
            <a href="/api/lipi">API</a>
          </div>
        </div>
        <div className="ayodhya-metrics">
          <span>Records<b>{records.length}</b></span>
          <span>Model<b>Association</b></span>
          <span>Rejected<b>Ownership</b></span>
          <span>PHKD<b>Fail Closed</b></span>
        </div>
      </section>
      <section className="page lipi-page">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Evidence Boundary</p>
            <h2>{lipiPhkdRule.model}</h2>
          </div>
          <span>{lipiPhkdRule.rejectedModel}</span>
        </div>
        <div className="lipi-matrix-grid">
          {records.map((entry) => (
            <article className="lipi-card" key={entry.key}>
              <span>{entry.status}</span>
              <strong>{entry.name}</strong>
              <p>{entry.hkdUri}</p>
              <dl>
                <div><dt>Civilizations</dt><dd>{entry.civilizations.join(", ") || "NULL"}</dd></div>
                <div><dt>Religions</dt><dd>{entry.religions.join(", ") || "NULL"}</dd></div>
                <div><dt>Languages</dt><dd>{entry.languages.join(", ") || "NULL"}</dd></div>
                <div><dt>Scripts</dt><dd>{entry.scripts.join(", ") || "NULL"}</dd></div>
                <div><dt>Texts</dt><dd>{entry.texts.join(", ") || "NULL"}</dd></div>
                <div><dt>Symbols</dt><dd>{entry.symbols.join(", ") || "NULL"}</dd></div>
                <div><dt>PHKD</dt><dd>{entry.phkdNote}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
