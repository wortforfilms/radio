import type { AyodhyaModule } from "@shared/ayodhya-modules";

export default function AyodhyaModuleCard({ module }: { module: AyodhyaModule }) {
  return (
    <a className="ayodhya-module-card" href={module.href}>
      <span>{module.icon}</span>
      <strong>{module.name}</strong>
      <p>{module.description}</p>
      <small>{module.actions.join(" / ")}</small>
    </a>
  );
}
