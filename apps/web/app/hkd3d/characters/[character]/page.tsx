import { getHkd3dCharacterByKey, hkd3dCharacters } from "@shared/hkd3d";
import AyodhyaHeader from "../../../_components/AyodhyaHeader";

type PageProps = {
  params: Promise<{ character: string }>;
};

export function generateStaticParams() {
  return hkd3dCharacters.map((character) => ({ character: character.key }));
}

export async function generateMetadata({ params }: PageProps) {
  const { character: characterKey } = await params;
  const character = getHkd3dCharacterByKey(characterKey);
  return {
    title: character ? `${character.name} | HKD3D Character` : "HKD3D Character"
  };
}

export default async function Hkd3dCharacterPage({ params }: PageProps) {
  const { character: characterKey } = await params;
  const character = getHkd3dCharacterByKey(characterKey);

  if (!character) {
    return (
      <main className="ayodhya-shell hkd3d-shell">
        <AyodhyaHeader />
        <section className="page ayodhya-page">
          <h1>HKD3D character not found</h1>
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
          <p className="eyebrow">HKD3D Character Slot</p>
          <h1>{character.name}</h1>
          <p>
            Character scaffold for model, textures, rig, animations, and metadata. No completed character asset is claimed until all required scopes have verified evidence.
          </p>
          <div className="ayodhya-actions">
            <a href="/hkd3d">HKD3D Dashboard</a>
            <a href="/projects/new">Import Evidence</a>
          </div>
        </div>
        <div className="ayodhya-metrics">
          <span>Status<b>{character.status}</b></span>
          <span>Verification<b>{character.verificationState}</b></span>
          <span>Required<b>{character.requiredScopes.length}</b></span>
          <span>PHKD<b>Fail Closed</b></span>
        </div>
      </section>

      <section className="page ayodhya-page">
        <div className="reference-feed-head">
          <div>
            <p className="section-kicker">Assembly</p>
            <h2>{character.name} Required Scopes</h2>
          </div>
          <span>{character.path}</span>
        </div>
        <div className="hkd3d-stage-grid">
          {character.requiredScopes.map((scope) => (
            <article className="hkd3d-stage-card" key={scope}>
              <span>blocked</span>
              <h3>{scope}</h3>
              <p>NULL until source, creator, asset path, and verification evidence are registered.</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
