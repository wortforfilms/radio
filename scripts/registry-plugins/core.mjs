// core plugin: enriched backwards-compatible route-registry.json (+ mirrors)
// and registry.schema.json (JSON Schema for IDE autocomplete / CI validation).
export async function generate(ctx) {
  const { registry, generatedAt, SITE_ORIGIN, ENABLED_FLAGS } = ctx;
  const { allRoutes, SECTIONS } = registry;
  const emojiBySection = new Map(SECTIONS.map((section) => [section.name, section.emoji]));

  const enriched = {
    id: "radio-vaigyaaniq-route-registry",
    generatedAt,
    schemaVersion: 3,
    $schema: "/registry/registry.schema.json",
    siteOrigin: SITE_ORIGIN,
    phkd: {
      failClosed: true,
      note: "Statuses are evidence-backed: built/partial cite concrete repo artifacts; planned routes render placeholders and never fabricate content, schedules, or claims."
    },
    counts: {
      sections: SECTIONS.length,
      routes: allRoutes.length,
      built: allRoutes.filter((r) => r.status === "built").length,
      partial: allRoutes.filter((r) => r.status === "partial").length,
      planned: allRoutes.filter((r) => r.status === "planned").length,
      dynamic: allRoutes.filter((r) => r.dynamic).length,
      searchable: allRoutes.filter((r) => r.searchable).length,
      apiReferences: allRoutes.reduce((sum, r) => sum + r.api.length, 0),
      components: registry.components.length,
      contentTypes: registry.contentTypes.length,
      workflows: registry.workflows.length,
      workspaceApps: registry.workspaceApps.length
    },
    enabledFlags: [...ENABLED_FLAGS],
    sections: SECTIONS,
    routes: allRoutes.map((route) => ({
      // legacy fields (schemaVersion 1 consumers keep working)
      path: route.path,
      section: route.section,
      emoji: emojiBySection.get(route.section) || route.icon,
      title: route.title,
      status: route.status,
      implementedBy: route.implementedBy,
      description: route.description,
      dynamic: route.dynamic,
      // platform fields
      id: route.id,
      category: route.category,
      layout: route.layout,
      icon: route.icon,
      searchable: route.searchable,
      navigation: route.navigation,
      platforms: route.platforms,
      permissions: route.permissions,
      featureFlags: route.featureFlags,
      api: route.api,
      seo: route.seo,
      analytics: route.analytics,
      evidence: route.evidence,
      dependsOn: route.dependsOn,
      children: route.children,
      tags: route.tags,
      contentType: route.contentType ?? null
    }))
  };
  ctx.artifacts.enriched = enriched;

  const json = `${JSON.stringify(enriched, null, 2)}\n`;
  const stringArray = { type: "array", items: { type: "string" } };
  const schema = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "https://radio.vaigyaaniq/registry.schema.json",
    title: "Radio Vaigyaaniq Route Registry",
    type: "object",
    required: ["id", "generatedAt", "schemaVersion", "phkd", "counts", "sections", "routes"],
    properties: {
      id: { type: "string" },
      generatedAt: { type: "string", format: "date-time" },
      schemaVersion: { type: "integer", minimum: 2 },
      $schema: { type: "string" },
      siteOrigin: { type: "string" },
      phkd: { type: "object", required: ["failClosed"], properties: { failClosed: { const: true }, note: { type: "string" } } },
      counts: { type: "object" },
      enabledFlags: stringArray,
      sections: {
        type: "array",
        items: { type: "object", required: ["name", "emoji"], properties: { name: { type: "string" }, emoji: { type: "string" } } }
      },
      routes: {
        type: "array",
        items: {
          type: "object",
          required: [
            "path", "section", "emoji", "title", "status", "implementedBy", "description", "dynamic",
            "id", "category", "layout", "icon", "searchable", "navigation", "platforms", "permissions",
            "featureFlags", "api", "seo", "analytics", "evidence", "dependsOn", "children", "tags"
          ],
          properties: {
            id: { type: "string", pattern: "^[a-z0-9]+(?:[.\\-][a-z0-9]+)*$" },
            path: { type: "string", pattern: "^/" },
            title: { type: "string" },
            description: { type: "string" },
            section: { type: "string" },
            emoji: { type: "string" },
            category: { type: "string" },
            status: { enum: ["built", "partial", "planned"] },
            layout: { enum: ["landing", "dashboard", "player", "studio", "article", "reader", "fullscreen", "settings", "admin", "modal"] },
            icon: { type: "string" },
            searchable: { type: "boolean" },
            dynamic: { type: "boolean" },
            navigation: {
              type: "object",
              required: ["sidebar", "header", "footer", "breadcrumbs", "commandPalette", "quickAccess", "contextMenu"],
              additionalProperties: { type: "boolean" }
            },
            platforms: { type: "array", items: { enum: ["web", "mobile", "desktop", "tv", "car", "watch", "api", "offline"] }, minItems: 1 },
            permissions: {
              type: "array",
              items: { enum: ["anonymous", "listener", "student", "researcher", "creator", "moderator", "editor", "admin", "superadmin"] },
              minItems: 1
            },
            featureFlags: { type: "array", items: { enum: ["radio2", "premium", "labs", "beta", "events", "academy", "enterprise", "experimental"] } },
            api: {
              type: "array",
              items: {
                type: "object",
                required: ["method", "path", "status"],
                properties: {
                  method: { enum: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
                  path: { type: "string" },
                  status: { enum: ["built", "partial", "planned"] },
                  description: { type: "string" }
                }
              }
            },
            seo: { type: "object", required: ["title", "description", "keywords", "robots"] },
            analytics: { type: "object", required: ["screenName", "event"] },
            implementedBy: stringArray,
            evidence: {
              type: "array",
              items: {
                type: "object",
                required: ["artifact", "kind"],
                properties: { artifact: { type: "string" }, kind: { enum: ["code", "surface", "data", "api", "doc"] }, note: { type: "string" } }
              }
            },
            dependsOn: stringArray,
            children: stringArray,
            tags: stringArray,
            contentType: { type: ["string", "null"] }
          },
          allOf: [
            {
              if: { properties: { status: { const: "planned" } } },
              then: { properties: { implementedBy: { maxItems: 0 } } }
            },
            {
              if: { properties: { status: { enum: ["built", "partial"] } } },
              then: { properties: { evidence: { minItems: 1 } } }
            }
          ]
        }
      }
    }
  };

  return [
    ["apps/radio/lib/route-registry.json", json],
    ["apps/web/public/radio-html/data/route-registry.json", json],
    ["apps/desktop/public/radio-html/data/route-registry.json", json],
    ["apps/radio/public/registry/registry.schema.json", `${JSON.stringify(schema, null, 2)}\n`]
  ];
}
