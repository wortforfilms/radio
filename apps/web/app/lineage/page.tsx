import { prisma } from "@runtime/db";
import { getExplorerGraph } from "@graph/index";
import ScriptRegistryExplorer, { type ScriptRegistryRecord, type ScriptStyleRecord } from "../_components/ScriptRegistryExplorer";
import Timeline3D from "./Timeline3D";

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

export default async function LineagePage() {
  const graph = await getExplorerGraph(prisma);
  const lineageEdges = graph.edges.filter((edge) => ["teacher_of", "student_of", "continued", "preserved", "influenced"].includes(edge.type));
  const textReferences = await prisma.text.findMany({
    where: {
      sourceCitation: {
        not: null
      }
    },
    include: {
      language: true,
      subject: true
    },
    orderBy: {
      title: "asc"
    },
    take: 80
  });
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
  })).filter((edge) => ["TEXT", "SCRIPT"].includes(edge.fromNode.type) && edge.toNode.type === "LOCATION");
  const religiousAtlasEdges = atlasEdges.filter((edge) => edge.provenanceNote?.includes("World religious atlas"));
  const scriptStyleCards = religiousAtlasEdges
    .filter((edge) => edge.fromNode.type === "SCRIPT")
    .map((edge) => ({
      edge,
      payload: readScriptStylePayload(edge.fromNode.payload)
    }));
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
  const isoScriptCards = isoScriptNodes.map((node) => ({
    node,
    payload: readScriptStylePayload(node.payload)
  }));
  const requestedScriptCapacity = isoScriptCards[0]?.payload?.requestedCapacity ?? 426;
  const scriptStyleRecords: ScriptStyleRecord[] = scriptStyleCards.map(({ edge, payload }) => ({
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
  }));
  const scriptRegistryRecords: ScriptRegistryRecord[] = isoScriptCards.map(({ node, payload }) => ({
    id: node.id,
    label: node.label,
    sourceCitation: node.sourceCitation,
    verificationStatus: node.verificationStatus,
    code: payload?.code ?? null,
    numeric: payload?.numeric ?? null,
    pva: payload?.pva ?? null,
    unicodeVersion: payload?.unicodeVersion ?? null,
    date: payload?.date ?? null
  }));
  const nodes = graph.nodes.map((node) => ({
    id: node.id,
    label: node.label,
    type: node.type,
    verificationStatus: node.verificationStatus
  }));

  return (
    <main>
      <Timeline3D nodes={nodes} edgeCount={lineageEdges.length} />
      <section className="page">
      <section className="dictionary-banner">
        <div>
          <p className="section-kicker">Sanskrit Dictionary</p>
          <h2>Trace words beside lineages</h2>
          <p>
            Lexemes now persist as cited dictionary records, so Sanskrit terms can be searched without converting glosses into lineage claims.
          </p>
        </div>
        <a href="/dictionary">Open dictionary</a>
      </section>
      <div className="graph">
        <aside className="card">
          <h2>Explorers</h2>
          <div className="list">
            <a href="/api/knowledge-graph">Node explorer</a>
            <a href="/api/knowledge-graph?type=teacher_of">Lineage explorer</a>
            <a href="/api/knowledge-graph?type=influenced">Influence explorer</a>
            <a href="/api/timeline">Timeline explorer</a>
            <a href="/api/civilizations">Civilization explorer</a>
            <a href="/api/subjects">Subject explorer</a>
          </div>
        </aside>
        <section className="card">
          <h2>Graph Snapshot</h2>
          <p className="muted">{graph.nodes.length} nodes and {lineageEdges.length} lineage/influence edges loaded.</p>
          <div className="list">
            {graph.nodes.slice(0, 40).map((node) => (
              <div key={node.id}>
                <strong>{node.label}</strong> <span className="muted">{node.type} / {node.verificationStatus}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="reference-feed">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Text Universe Reference Feed</p>
            <h2>Vedas and Related Materials</h2>
          </div>
          <span>{textReferences.length} catalog records</span>
        </div>
        <p className="reference-feed-note">
          These entries store source provenance only. Verse text, translations, authorship links, and lineage claims remain closed until supplied with verifiable citations.
        </p>
        <div className="reference-grid">
          {textReferences.map((reference) => (
            <a
              className="reference-card"
              href={reference.sourceCitation ?? "/api/texts"}
              key={reference.id}
              rel="noreferrer"
              target="_blank"
            >
              <span>{reference.subject?.name ?? "Textual Studies"} / {reference.language?.name ?? "Unknown language"}</span>
              <strong>{reference.title}</strong>
              <p>{reference.summary ?? "Catalog-level reference record with no verse-level claims imported."}</p>
              <small>{reference.verificationStatus}</small>
            </a>
          ))}
        </div>
      </section>
      <section className="atlas-feed">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">World Atlas</p>
            <h2>Religious Texts, Scripts, and Locations</h2>
          </div>
          <span>{religiousAtlasEdges.length} cited associations</span>
        </div>
        <p className="reference-feed-note">
          These are broad text/script/location associations for exploration. They are not origin, authorship, ownership, or exclusive lineage claims.
        </p>
        <div className="atlas-grid">
          {religiousAtlasEdges.map((edge) => (
            <a className="atlas-card" href={edge.sourceCitation ?? "/api/knowledge-graph"} key={edge.id} rel="noreferrer" target="_blank">
              <span>{edge.fromNode.type} / {edge.verificationStatus}</span>
              <strong>{edge.fromNode.label}</strong>
              <p>{edge.fromNode.summary ?? "Catalog-level world atlas reference."}</p>
              <small>{edge.toNode.label}</small>
            </a>
          ))}
        </div>
      </section>
      <section className="script-style-panel">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Script Typography</p>
            <h2>Font Options and Script Styles</h2>
          </div>
          <span>{scriptStyleCards.length} script render profiles</span>
        </div>
        <p className="reference-feed-note">
          These profiles store display samples, writing direction, and fallback font stacks only. They do not verify paleographic period, authorship, origin, or exclusive lineage.
        </p>
        <div className="script-style-grid">
          {scriptStyleCards.map(({ edge, payload }) => (
            <article className="script-style-card" key={edge.id}>
              <span>{payload?.styleName ?? edge.fromNode.label}</span>
              <strong dir={payload?.direction ?? "ltr"} style={{ fontFamily: payload?.fontStack ?? undefined }}>
                {payload?.sample ?? edge.fromNode.label}
              </strong>
              <p>{edge.fromNode.label} / {edge.toNode.label}</p>
              <small>{payload?.fontStack ?? "System fallback font stack"}</small>
            </article>
          ))}
        </div>
      </section>
      <ScriptRegistryExplorer
        registryRecords={scriptRegistryRecords}
        requestedCapacity={requestedScriptCapacity}
        styleRecords={scriptStyleRecords}
      />
      </section>
    </main>
  );
}
