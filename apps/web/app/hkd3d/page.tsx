import { getHkd3dMetrics, hkd3dAppSurfaces, hkd3dCharacters, hkd3dStages, hkd3dWorkflows } from "@shared/hkd3d";
import AyodhyaHeader from "../_components/AyodhyaHeader";
import Hkd3dViewer from "./Hkd3dViewer";

export default function Hkd3dPage() {
  const metrics = getHkd3dMetrics();

  return (
    <main className="ayodhya-shell hkd3d-shell">
      <AyodhyaHeader />
      <section className="hkd3d-hero">
        <div>
          <p className="eyebrow">HKD3D Human Runtime</p>
          <h1>Evidence-Gated Human, Avatar, and Character Pipeline</h1>
          <p>
            Anatomy, PBR texture slots, rig scopes, facial runtime, clothing, hair, lighting, scene composition, and export planning for Ayodhya AI. No model, rig, animation, texture, scan quality, render quality, or performance claim is marked production ready without verified evidence.
          </p>
          <div className="ayodhya-actions">
            <a href="/api/hkd3d">API Manifest</a>
            <a href="/projects/new">Import Project</a>
            <a href="#designer">Designer Runtime</a>
          </div>
        </div>
        <div className="ayodhya-metrics">
          <span>Stages<b>{metrics.stageCount}</b></span>
          <span>Asset Slots<b>{metrics.assetSlotCount}</b></span>
          <span>Verified Assets<b>{metrics.verifiedAssetCount}</b></span>
          <span>PHKD<b>Fail Closed</b></span>
        </div>
      </section>

      <section className="page ayodhya-page">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Three.js Viewer</p>
            <h2>Human Runtime Control Surface</h2>
          </div>
          <span>{metrics.blockedAssetCount} blocked slots</span>
        </div>
        <p className="reference-feed-note">
          The canvas renders a diagnostic humanoid rig proxy only. It is a viewer and lighting runtime scaffold, not a completed HKD3D human model.
        </p>
        <Hkd3dViewer stages={hkd3dStages} />
      </section>

      <section className="page ayodhya-page">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Pipeline</p>
            <h2>HKD3D Stack</h2>
          </div>
          <span>{hkd3dStages.length} scopes</span>
        </div>
        <div className="hkd3d-stage-grid">
          {hkd3dStages.map((stage) => (
            <article className="hkd3d-stage-card" key={stage.key}>
              <span>{stage.status}</span>
              <h3>{stage.name}</h3>
              <p>{stage.description}</p>
              <dl>
                <div><dt>Path</dt><dd>{stage.path}</dd></div>
                <div><dt>Slots</dt><dd>{stage.slots.length}</dd></div>
                <div><dt>Verified</dt><dd>{stage.slots.filter((slot) => slot.verificationState === "verified").length}</dd></div>
              </dl>
              <a href={`/hkd3d/stages/${stage.key}`}>Open Scope</a>
            </article>
          ))}
        </div>
      </section>

      <section className="page ayodhya-page">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Workflows</p>
            <h2>Evidence-Gated Operations</h2>
          </div>
          <span>{hkd3dWorkflows.length} workflows</span>
        </div>
        <div className="hkd3d-stage-grid">
          {hkd3dWorkflows.map((workflow) => (
            <article className="hkd3d-stage-card" key={workflow.key}>
              <span>workflow</span>
              <h3>{workflow.name}</h3>
              <ol>
                {workflow.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <section className="page ayodhya-page" id="designer">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Designer Dashboard</p>
            <h2>Runtime Apps</h2>
          </div>
          <span>{hkd3dAppSurfaces.length} surfaces</span>
        </div>
        <div className="hkd3d-app-grid">
          {hkd3dAppSurfaces.map((surface) => (
            <article className="ayodhya-operation-card" key={surface.key}>
              <span>{surface.path}</span>
              <strong>{surface.name}</strong>
              <p>{surface.modules.join(", ")}</p>
              <a href={surface.route}>Open Surface</a>
            </article>
          ))}
        </div>
      </section>

      <section className="page ayodhya-page">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Ayodhya Characters</p>
            <h2>Character Slots</h2>
          </div>
          <span>{hkd3dCharacters.length} characters</span>
        </div>
        <div className="hkd3d-character-grid">
          {hkd3dCharacters.map((character) => (
            <article className="project-intake-card" key={character.key}>
              <span>{character.status}</span>
              <strong>{character.name}</strong>
              <p>{character.path}</p>
              <small>{character.requiredScopes.join(" / ")}</small>
              <a href={`/hkd3d/characters/${character.key}`}>Open Character</a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
