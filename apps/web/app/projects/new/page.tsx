type ProjectSearchParams = {
  desc?: string;
  lang?: string;
  src?: string;
  title?: string;
  translit?: string;
  type?: string;
};

function valueOrNull(value: string | undefined) {
  return value?.trim() ? value : "NULL";
}

export default async function NewProjectPage({
  searchParams
}: {
  searchParams?: Promise<ProjectSearchParams>;
}) {
  const params = await searchParams;
  const title = valueOrNull(params?.title);
  const transliteration = valueOrNull(params?.translit);
  const projectType = valueOrNull(params?.type);
  const language = valueOrNull(params?.lang);
  const source = valueOrNull(params?.src);
  const description = valueOrNull(params?.desc);

  return (
    <main>
      <section className="project-intake-hero">
        <div>
          <p className="eyebrow">Ayodhya AI</p>
          <h1>{title}</h1>
          <p>
            Project intake is ready. Query parameters are decoded into a PHKD-safe creative brief without claiming authorship, provenance, or publication status.
          </p>
        </div>
        <div className="project-intake-stats" aria-label="Project intake metrics">
          <span>Type <b>{projectType}</b></span>
          <span>Language <b>{language}</b></span>
          <span>Source <b>{source}</b></span>
        </div>
      </section>

      <section className="page project-intake-page">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">New Project</p>
            <h2>Creative Brief</h2>
          </div>
          <a href="/dashboard">Dashboard</a>
        </div>
        <p className="reference-feed-note">
          This surface stores the incoming project brief as visible intake data only. Save/persistence can be added after a verified project schema and source policy are defined.
        </p>

        <div className="project-intake-grid">
          <article className="project-intake-card">
            <span>Title</span>
            <strong>{title}</strong>
          </article>
          <article className="project-intake-card">
            <span>Transliteration</span>
            <strong>{transliteration}</strong>
          </article>
          <article className="project-intake-card">
            <span>Type</span>
            <strong>{projectType}</strong>
          </article>
          <article className="project-intake-card">
            <span>Language</span>
            <strong>{language}</strong>
          </article>
          <article className="project-intake-card">
            <span>Source</span>
            <strong>{source}</strong>
          </article>
        </div>

        <section className="project-lyrics-panel">
          <div className="reference-feed-head">
            <div>
              <p className="section-kicker">Lyrics / Description</p>
              <h2>Decoded Input</h2>
            </div>
            <span>{description === "NULL" ? 0 : description.length} chars</span>
          </div>
          <pre>{description}</pre>
        </section>
      </section>
    </main>
  );
}
