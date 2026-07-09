import { notFound } from "next/navigation";
import { bySection, childrenOf, matchRoute, routeRegistry, type RegistryRoute } from "@/lib/routes";

// Registry-driven catch-all for the full ecosystem IA (~195 routes, 20 sections).
// Real pages (/, /api/payments/*) and static surfaces (/radio-html/*) take
// precedence over this route; everything else resolves here. PHKD fail-closed:
// planned routes render an honest placeholder — never fabricated content.

export const dynamicParams = true;

export function generateStaticParams() {
  // Pre-render the static (non-dynamic) registry routes.
  return routeRegistry.routes
    .filter((route) => !route.dynamic && route.path !== "/")
    .map((route) => ({ slug: route.path.split("/").filter(Boolean) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const match = matchRoute(`/${slug.join("/")}`);
  return { title: match ? `${match.route.title} · Radio Vaigyaaniq` : "Radio Vaigyaaniq" };
}

const STATUS_LABEL: Record<RegistryRoute["status"], string> = {
  built: "BUILT",
  partial: "PARTIAL",
  planned: "PLANNED · NULL"
};

function StatusChip({ status }: { status: RegistryRoute["status"] }) {
  return <span className={`chip chip-${status}`}>{STATUS_LABEL[status]}</span>;
}

function artifactHref(artifact: string): string | null {
  if (artifact.startsWith("radio-html/")) return `/${artifact.split("#")[0]}`;
  return null;
}

export default async function EcosystemRoute({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const pathname = `/${slug.join("/")}`;
  const match = matchRoute(pathname);
  if (!match) notFound();
  const { route, params: routeParams } = match;
  const children = childrenOf(route.path);
  const isEcosystemHub = route.path === "/ecosystem";
  const sections = isEcosystemHub ? bySection() : null;
  // Layout selection via registry metadata (schemaVersion 2), never URL parsing.
  const layout = (route as { layout?: string }).layout ?? "landing";

  return (
    <main className="shell route-shell" data-layout={layout}>
      <nav className="crumbs">
        <a href="/">Radio Vaigyaaniq</a>
        <span>
          {route.emoji} {route.section}
        </span>
      </nav>

      <header className="route-head">
        <h1>{route.title}</h1>
        <StatusChip status={route.status} />
        <span className="chip">{layout}</span>
      </header>
      <p className="route-path">
        <code>{route.path}</code>
        {Object.entries(routeParams).map(([key, value]) => (
          <code key={key}>
            {key} = {value}
          </code>
        ))}
      </p>
      <p className="route-desc">{route.description}</p>

      {route.implementedBy.length > 0 && (
        <section className="panel">
          <h2>Implemented by</h2>
          <ul>
            {route.implementedBy.map((artifact) => {
              const href = artifactHref(artifact);
              return (
                <li key={artifact}>{href ? <a href={href}>{artifact}</a> : <code>{artifact}</code>}</li>
              );
            })}
          </ul>
        </section>
      )}

      {route.status === "planned" && (
        <section className="panel guard">
          <h2>Fail-closed placeholder</h2>
          <p>
            This route is part of the production information architecture but has no implementation
            yet. Nothing is fabricated here — no content, schedules, or claims will appear until real,
            verified data exists. {routeRegistry.phkd.note}
          </p>
        </section>
      )}

      {children.length > 0 && (
        <section className="panel">
          <h2>In this section</h2>
          <div className="route-grid">
            {children.map((child) => (
              <a className="route-card" href={child.path} key={child.path}>
                <b>{child.title}</b>
                <code>{child.path}</code>
                <StatusChip status={child.status} />
              </a>
            ))}
          </div>
        </section>
      )}

      {sections && (
        <section className="panel">
          <h2>
            Full ecosystem map · {routeRegistry.counts.routes} routes ·{" "}
            {routeRegistry.counts.built} built / {routeRegistry.counts.partial} partial /{" "}
            {routeRegistry.counts.planned} planned
          </h2>
          {[...sections.entries()].map(([name, sectionRoutes]) => (
            <details key={name} open={name === "Radio"}>
              <summary>
                {sectionRoutes[0].emoji} {name} ({sectionRoutes.length})
              </summary>
              <div className="route-grid">
                {sectionRoutes.map((sectionRoute) => (
                  <a className="route-card" href={sectionRoute.path} key={sectionRoute.path}>
                    <b>{sectionRoute.title}</b>
                    <code>{sectionRoute.path}</code>
                    <StatusChip status={sectionRoute.status} />
                  </a>
                ))}
              </div>
            </details>
          ))}
        </section>
      )}

      <footer className="route-foot">
        Registry generated {routeRegistry.generatedAt} · statuses are evidence-backed (see{" "}
        <code>scripts/build-route-registry.mjs</code>)
      </footer>
    </main>
  );
}
