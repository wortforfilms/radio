// workspace plugin: workspace.json — the multi-app map (Radio, NLM, CIC, Lipi,
// Corpus, Shree Kautilya, Maataa, Academy, Investors Hub) with honest statuses
// and route-prefix ownership over the shared registry.
export async function generate(ctx) {
  const { registry, generatedAt } = ctx;
  const { workspaceApps, allRoutes } = registry;

  const workspace = {
    generatedAt,
    note: "One root registry; app registries own route-id prefixes. Statuses evidence-backed — only artifacts that exist are cited.",
    counts: {
      apps: workspaceApps.length,
      built: workspaceApps.filter((app) => app.status === "built").length,
      partial: workspaceApps.filter((app) => app.status === "partial").length,
      planned: workspaceApps.filter((app) => app.status === "planned").length
    },
    apps: workspaceApps.map((app) => ({
      ...app,
      ownedRoutes: allRoutes
        .filter((route) => app.routePrefixes.some((prefix) => route.id === prefix || route.id.startsWith(`${prefix}.`)))
        .map((route) => route.id)
    }))
  };
  ctx.artifacts.workspace = workspace;

  return [["apps/radio/public/registry/workspace.json", `${JSON.stringify(workspace, null, 2)}\n`]];
}
