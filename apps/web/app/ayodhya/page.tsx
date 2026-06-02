import { ayodhyaModules } from "@shared/ayodhya-modules";
import AyodhyaHeader from "../_components/AyodhyaHeader";
import AyodhyaModuleCard from "../_components/AyodhyaModuleCard";

const metrics = [
  ["Modules", ayodhyaModules.length.toString()],
  ["Projects", "Intake"],
  ["PHKD", "On"],
  ["Claims", "Fail Closed"]
];

export default function AyodhyaPage() {
  return (
    <main className="ayodhya-shell">
      <AyodhyaHeader />
      <section className="ayodhya-hero">
        <div>
          <p className="eyebrow">Ayodhya AI</p>
          <h1>Create Epics. Build Worlds. Preserve Civilization.</h1>
          <p>
            A production-oriented creative OS for scripts, storyboards, characters, locations, devotional media, voice, video, PHKD evidence, and verified project operations.
          </p>
          <div className="ayodhya-actions">
            <a href="/projects/new">Start Project</a>
            <a href="/ayodhya/studio">Open Studio</a>
            <a href="/ayodhya/scripts">Script Engine</a>
          </div>
        </div>
        <div className="ayodhya-metrics">
          {metrics.map(([label, value]) => (
            <span key={label}>{label}<b>{value}</b></span>
          ))}
        </div>
      </section>
      <section className="page ayodhya-page">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Creative Runtime</p>
            <h2>Featured Modules</h2>
          </div>
          <span>{ayodhyaModules.length} modules</span>
        </div>
        <p className="reference-feed-note">
          Imported from the Ayodhya AI full application package and adapted into the persistent Vaishviq runtime. Module pages are operational surfaces, not fake production output.
        </p>
        <div className="ayodhya-module-grid">
          {ayodhyaModules.map((module) => (
            <AyodhyaModuleCard key={module.key} module={module} />
          ))}
        </div>
      </section>
    </main>
  );
}
