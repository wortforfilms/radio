// docs plugin: generated Markdown documentation (never hand-maintained).
// Consumes earlier plugins' artifacts via ctx.artifacts.
const chip = { built: "✅ built", partial: "🟡 partial", planned: "⬜ planned" };

export async function generate(ctx) {
  const { registry, generatedAt, ENABLED_FLAGS, artifacts } = ctx;
  const { allRoutes, SECTIONS, components, contentTypes, workflows } = registry;
  const { navigation, permissions, apiMap, search } = artifacts;
  const enriched = artifacts.enriched;

  const routesMd = `# Routes\n\nGenerated ${generatedAt} from \`apps/radio/registry\` — do not edit by hand.\n\nTotal **${allRoutes.length}** routes · ${enriched.counts.built} built · ${enriched.counts.partial} partial · ${enriched.counts.planned} planned.\n\n${SECTIONS.map((section) => {
    const rows = allRoutes.filter((route) => route.section === section.name);
    return `## ${section.emoji} ${section.name}\n\n| id | path | status | layout | content type | permissions | flags |\n|---|---|---|---|---|---|---|\n${rows
      .map(
        (route) =>
          `| \`${route.id}\` | \`${route.path}\` | ${chip[route.status]} | ${route.layout} | ${route.contentType || "—"} | ${route.permissions.join(", ")} | ${route.featureFlags.join(", ") || "—"} |`
      )
      .join("\n")}\n`;
  }).join("\n")}`;

  const navigationMd = `# Navigation\n\nGenerated ${generatedAt}. Flag-hidden routes excluded (enabled: ${[...ENABLED_FLAGS].join(", ") || "none"}).\n\n${["sidebar", "header", "footer", "quickAccess", "commandPalette"]
    .map((zone) => `## ${zone}\n\n${navigation[zone].map((item) => `- ${item.icon} [\`${item.id}\`](${item.path}) — ${item.title} (${item.status})`).join("\n")}\n`)
    .join("\n")}\n## Hidden by feature flags\n\n${navigation.hiddenByFlags.map((entry) => `- \`${entry.id}\` (needs: ${entry.featureFlags.join(", ")})`).join("\n")}\n`;

  const permissionsMd = `# Permissions\n\nGenerated ${generatedAt}.\n\nRoles: ${permissions.roles.join(" · ")}\n\n| role | accessible routes |\n|---|---|\n${permissions.roles
    .map((role) => `| ${role} | ${permissions.byRole[role].length} |`)
    .join("\n")}\n\n## Non-public routes\n\n| route | requires |\n|---|---|\n${allRoutes
    .filter((route) => !route.permissions.includes("anonymous"))
    .map((route) => `| \`${route.id}\` | ${route.permissions.join(", ")} |`)
    .join("\n")}\n`;

  const apiMapMd = `# API Map\n\nGenerated ${generatedAt}. Statuses are honest — planned endpoints do not exist yet. OpenAPI: \`registry/openapi.json\` · SDK: \`apps/radio/lib/sdk.ts\`.\n\n| endpoint | status | used by |\n|---|---|---|\n${Object.entries(apiMap.byEndpoint)
    .map(([endpoint, meta]) => `| \`${endpoint}\` | ${chip[meta.status]} | ${meta.usedBy.map((id) => `\`${id}\``).join(", ")} |`)
    .join("\n")}\n`;

  const searchIndexMd = `# Search Index\n\nGenerated ${generatedAt}. ${search.count} searchable public routes → \`registry/search.json\`.\n\n| id | url | section | keywords |\n|---|---|---|---|\n${search.entries
    .map((entry) => `| \`${entry.id}\` | ${entry.url} | ${entry.section} | ${entry.keywords.slice(0, 6).join(", ")} |`)
    .join("\n")}\n`;

  const tree = allRoutes
    .slice()
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((route) => `${"  ".repeat(Math.max(0, route.path.split("/").filter(Boolean).length - 1))}- \`${route.path}\` (${route.id}, ${route.status})`)
    .join("\n");
  const siteStructureMd = `# Site Structure\n\nGenerated ${generatedAt}.\n\n${tree}\n`;

  const componentsMd = `# Components\n\nGenerated ${generatedAt} from \`registry/components.ts\` — statuses evidence-backed.\n\n| id | category | status | platforms | renders | implemented by |\n|---|---|---|---|---|---|\n${components
    .map(
      (component) =>
        `| \`${component.id}\` | ${component.category} | ${chip[component.status]} | ${component.platforms.join(", ")} | ${component.renders.join(", ") || "—"} | ${component.implementedBy.map((a) => `\`${a}\``).join(", ") || "—"} |`
    )
    .join("\n")}\n\nRoute → layout → component trees: \`registry/component-trees.json\`.\n`;

  const workflowsMd = `# Content Types & Workflows\n\nGenerated ${generatedAt}.\n\n## Content types\n\n| id | status | workflow | fields |\n|---|---|---|---|\n${contentTypes
    .map((contentType) => `| \`${contentType.id}\` | ${chip[contentType.status]} | ${contentType.workflow} | ${contentType.fields.length} |`)
    .join("\n")}\n\n${workflows
    .map(
      (workflow) =>
        `## Workflow: ${workflow.name}\n\n${workflow.description}\n\nStates: ${workflow.states.join(" → ")}\n\n| from | to | requires | roles |\n|---|---|---|---|\n${workflow.transitions
          .map((transition) => `| ${transition.from} | ${transition.to} | ${transition.requires.join("; ") || "—"} | ${transition.roles.join(", ")} |`)
          .join("\n")}`
    )
    .join("\n\n")}\n`;

  return [
    ["docs/registry/ROUTES.md", routesMd],
    ["docs/registry/NAVIGATION.md", navigationMd],
    ["docs/registry/PERMISSIONS.md", permissionsMd],
    ["docs/registry/API_MAP.md", apiMapMd],
    ["docs/registry/SEARCH_INDEX.md", searchIndexMd],
    ["docs/registry/SITE_STRUCTURE.md", siteStructureMd],
    ["docs/registry/COMPONENTS.md", componentsMd],
    ["docs/registry/CONTENT_WORKFLOWS.md", workflowsMd]
  ];
}
