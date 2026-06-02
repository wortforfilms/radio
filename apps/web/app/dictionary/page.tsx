import { prisma } from "@runtime/db";
import {
  filterUniversalDictionaryEntries,
  getUniversalDictionaryStaticEntries,
  universalDictionaryPhkdNote
} from "@shared/universal-dictionary";
import ScriptRegistryExplorer, { type ScriptRegistryRecord, type ScriptStyleRecord } from "../_components/ScriptRegistryExplorer";

type ScriptStylePayload = {
  code?: string;
  numeric?: string;
  pva?: string | null;
  unicodeVersion?: string | null;
  date?: string | null;
  requestedCapacity?: number;
  sample?: string;
  hindiTransliteration?: string | null;
  sanskritTranslation?: string | null;
  fontStack?: string;
  styleName?: string;
  direction?: "ltr" | "rtl";
};

function readScriptStylePayload(payload: string | null): ScriptStylePayload | null {
  if (!payload) {
    return null;
  }

  try {
    const parsed = JSON.parse(payload) as ScriptStylePayload;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export default async function DictionaryPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params?.q?.trim();
  const staticDictionaryEntries = filterUniversalDictionaryEntries(getUniversalDictionaryStaticEntries(), q);
  const worldTextCount = staticDictionaryEntries.filter((entry) => entry.category === "text").length;
  const lipiCount = staticDictionaryEntries.filter((entry) => entry.category === "lipi").length;
  const entries = await prisma.sanskritLexeme.findMany({
    where: q
      ? {
          OR: [
            { headword: { contains: q } },
            { transliteration: { contains: q } },
            { normalizedHeadword: { contains: q.toLowerCase() } },
            { definition: { contains: q } }
          ]
        }
      : {},
    include: {
      language: true
    },
    orderBy: [{ normalizedHeadword: "asc" }, { sourceDictionary: "asc" }],
    take: 100
  });
  const totalLexemeCount = await prisma.sanskritLexeme.count();
  const atlasEdges = (await prisma.knowledgeEdge.findMany({
    where: {
      type: "belongs_to"
    },
    include: {
      fromNode: true,
      toNode: true
    },
    orderBy: {
      updatedAt: "desc"
    },
    take: 120
  })).filter((edge) => edge.fromNode.type === "SCRIPT" && edge.toNode.type === "LOCATION" && edge.provenanceNote?.includes("World religious atlas"));
  const scriptStyleRecords: ScriptStyleRecord[] = atlasEdges.map((edge) => {
    const payload = readScriptStylePayload(edge.fromNode.payload);
    return {
      id: edge.id,
      label: edge.fromNode.label,
      location: edge.toNode.label,
      sourceCitation: edge.sourceCitation,
      verificationStatus: edge.verificationStatus,
      sample: payload?.sample ?? null,
      hindiTransliteration: payload?.hindiTransliteration ?? null,
      sanskritTranslation: payload?.sanskritTranslation ?? null,
      fontStack: payload?.fontStack ?? null,
      styleName: payload?.styleName ?? null,
      direction: payload?.direction ?? "ltr"
    };
  });
  const isoScriptNodes = await prisma.knowledgeNode.findMany({
    where: {
      id: {
        startsWith: "SCRIPT:ISO15924:"
      }
    },
    orderBy: {
      label: "asc"
    },
    take: 426
  });
  const scriptRegistryRecords: ScriptRegistryRecord[] = isoScriptNodes.map((node) => {
    const payload = readScriptStylePayload(node.payload);
    return {
      id: node.id,
      label: node.label,
      sourceCitation: node.sourceCitation,
      verificationStatus: node.verificationStatus,
      code: payload?.code ?? null,
      numeric: payload?.numeric ?? null,
      pva: payload?.pva ?? null,
      unicodeVersion: payload?.unicodeVersion ?? null,
      date: payload?.date ?? null
    };
  });
  const requestedScriptCapacity = scriptRegistryRecords.length > 0
    ? readScriptStylePayload(isoScriptNodes[0]?.payload ?? null)?.requestedCapacity ?? 426
    : 426;

  return (
    <main>
      <section className="dictionary-hero">
        <div>
          <p className="eyebrow">Universal Dictionary</p>
          <h1>Lexeme, Script, Text, and Lipi Archive</h1>
          <p>
            Search Sanskrit lexemes, world scripts, sacred text catalog records, Lipi civilization associations, samples, transliterations, and source provenance. Claims remain fail-closed until cited and verified.
          </p>
          <form action="/dictionary" className="dictionary-search">
            <label htmlFor="dictionary-q">Search universal dictionary</label>
            <input id="dictionary-q" name="q" placeholder="agni, guru, Hebrew, Cuneiform, Tripitaka, Indus" defaultValue={q ?? ""} />
            <button type="submit">Search</button>
          </form>
        </div>
        <div className="dictionary-stats" aria-label="Dictionary metrics">
          <span>Sanskrit <b>{q ? `${entries.length}/${totalLexemeCount}` : totalLexemeCount}</b></span>
          <span>Scripts <b>{scriptRegistryRecords.length}/{requestedScriptCapacity}</b></span>
          <span>Texts <b>{worldTextCount}</b></span>
          <span>Lipi <b>{lipiCount}</b></span>
        </div>
      </section>

      <section className="page dictionary-page">
        <section className="dictionary-banner">
          <div>
            <p className="section-kicker">Universal Dictionary</p>
            <h2>PHKD Fail-Closed Lexical Hub</h2>
            <p>{universalDictionaryPhkdNote}</p>
          </div>
          <a href="/api/universal-dictionary">Universal API</a>
        </section>

        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Universal Records</p>
            <h2>{q ? `Universal results for ${q}` : "Texts, Scripts, and Lipi Associations"}</h2>
          </div>
          <span>{staticDictionaryEntries.length} records</span>
        </div>
        <div className="dictionary-grid">
          {staticDictionaryEntries.map((entry) => (
            <article className="dictionary-card" key={entry.id}>
              <div>
                <span>{entry.category} / {entry.verificationStatus}</span>
                <h3>{entry.sample ?? entry.term}</h3>
                <strong>{entry.term}</strong>
              </div>
              <p>{entry.definition}</p>
              <dl>
                <div><dt>Language</dt><dd>{entry.language ?? "NULL"}</dd></div>
                <div><dt>Location</dt><dd>{entry.location ?? "NULL"}</dd></div>
                <div><dt>Tradition</dt><dd>{entry.tradition ?? "NULL"}</dd></div>
                <div><dt>PHKD</dt><dd>{entry.phkdNote}</dd></div>
              </dl>
              {entry.sourceCitation ? (
                <a href={entry.sourceCitation} rel="noreferrer" target="_blank">Source</a>
              ) : null}
            </article>
          ))}
        </div>

        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Lexical Records</p>
            <h2>{q ? `Sanskrit results for ${q}` : "Sanskrit Lexeme Archive"}</h2>
          </div>
          <a href="/api/sanskrit-dictionary">API</a>
        </div>
        <p className="reference-feed-note">
          The Sanskrit dictionary stores concise glosses and dictionary-family provenance only. Grammatical detail, etymology, and textual usage should be imported from cited sources before promotion.
        </p>
        <div className="dictionary-grid">
          {entries.map((entry) => (
            <article className="dictionary-card" key={entry.id}>
              <div>
                <span>{entry.sourceDictionary}</span>
                <h3>{entry.headword}</h3>
                <strong>{entry.transliteration ?? entry.normalizedHeadword}</strong>
              </div>
              <p>{entry.definition ?? "Definition unavailable. Import a cited definition before use."}</p>
              <dl>
                <div>
                  <dt>Part of speech</dt>
                  <dd>{entry.partOfSpeech ?? "NULL"}</dd>
                </div>
                <div>
                  <dt>Language</dt>
                  <dd>{entry.language?.name ?? "NULL"}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{entry.verificationStatus}</dd>
                </div>
              </dl>
              {entry.sourceCitation ? (
                <a href={entry.sourceCitation} rel="noreferrer" target="_blank">
                  Source
                </a>
              ) : null}
            </article>
          ))}
        </div>

        <ScriptRegistryExplorer
          registryRecords={scriptRegistryRecords}
          requestedCapacity={requestedScriptCapacity}
          styleRecords={scriptStyleRecords}
        />
      </section>
    </main>
  );
}
