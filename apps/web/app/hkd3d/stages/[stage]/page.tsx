import { getHkd3dStageByKey, hkd3dStages } from "@shared/hkd3d";
import AyodhyaHeader from "../../../_components/AyodhyaHeader";

type PageProps = {
  params: Promise<{ stage: string }>;
};

export function generateStaticParams() {
  return hkd3dStages.map((stage) => ({ stage: stage.key }));
}

export async function generateMetadata({ params }: PageProps) {
  const { stage: stageKey } = await params;
  const stage = getHkd3dStageByKey(stageKey);
  return {
    title: stage ? `${stage.name} | HKD3D` : "HKD3D Stage"
  };
}

export default async function Hkd3dStagePage({ params }: PageProps) {
  const { stage: stageKey } = await params;
  const stage = getHkd3dStageByKey(stageKey);

  if (!stage) {
    return (
      <main className="ayodhya-shell hkd3d-shell">
        <AyodhyaHeader />
        <section className="page ayodhya-page">
          <h1>HKD3D stage not found</h1>
          <a href="/hkd3d">Return to HKD3D</a>
        </section>
      </main>
    );
  }

  return (
    <main className="ayodhya-shell hkd3d-shell">
      <AyodhyaHeader />
      <section className="hkd3d-hero">
        <div>
          <p className="eyebrow">HKD3D Scope</p>
          <h1>{stage.name}</h1>
          <p>{stage.description}</p>
          <div className="ayodhya-actions">
            <a href="/hkd3d">HKD3D Dashboard</a>
            <a href="/api/hkd3d">API Manifest</a>
          </div>
        </div>
        <div className="ayodhya-metrics">
          <span>Status<b>{stage.status}</b></span>
          <span>Slots<b>{stage.slots.length}</b></span>
          <span>Verified<b>{stage.slots.filter((slot) => slot.verificationState === "verified").length}</b></span>
          <span>PHKD<b>Fail Closed</b></span>
        </div>
      </section>

      <section className="page ayodhya-page">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Capabilities</p>
            <h2>{stage.name} Contract</h2>
          </div>
          <span>{stage.path}</span>
        </div>
        <div className="hkd3d-chip-grid">
          {stage.capabilities.map((capability) => (
            <span key={capability}>{capability}</span>
          ))}
        </div>
      </section>

      <section className="page ayodhya-page">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Asset Slots</p>
            <h2>Evidence Gate</h2>
          </div>
          <span>{stage.slots.length} slots</span>
        </div>
        <div className="hkd3d-stage-grid">
          {stage.slots.map((slot) => (
            <article className="hkd3d-stage-card" key={slot.id}>
              <span>{slot.status}</span>
              <h3>{slot.name}</h3>
              <p>{slot.expectedPath}</p>
              <dl>
                <div><dt>Asset</dt><dd>{slot.assetPath ?? "NULL"}</dd></div>
                <div><dt>Source</dt><dd>{slot.source ?? "NULL"}</dd></div>
                <div><dt>Creator</dt><dd>{slot.creator ?? "NULL"}</dd></div>
                <div><dt>Evidence</dt><dd>{slot.evidence.length}</dd></div>
                <div><dt>Verification</dt><dd>{slot.verificationState}</dd></div>
              </dl>
              <ol>
                {slot.requirements.map((requirement) => (
                  <li key={requirement}>{requirement}</li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
