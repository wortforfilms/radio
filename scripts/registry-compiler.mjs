// Manifest compiler.
//
//   registry (typed modules) → COMPILER → canonical compiled manifest → plugins
//
// The compiler:
//   1. loads + validates the typed registry,
//   2. normalizes defaults (contentType null, stable field order),
//   3. resolves references (contentType, workflow, dependsOn, layout, components),
//   4. flattens layouts into per-route component trees,
//   5. builds the manifest GRAPH (typed nodes + edges) with impact/orphan analysis,
//   6. FREEZES identifiers against registry/ids.lock.json (removing/renaming an
//      id is a build failure — additive evolution is enforced, not hoped for),
//   7. precomputes lookup indexes (byId/byPath/bySection/byContentType/...).
//
// Plugins never read raw registry modules — they consume this compiled object.
// Compile-time only: the runtime consumes generated artifacts, never the registry.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export async function compileManifest(ROOT, { updateLock = false, pluginSources = null } = {}) {
  const registry = await import(pathToFileURL(path.join(ROOT, "apps/radio/registry/index.ts")).href);
  const problems = registry.validateRegistry();
  if (problems.length) {
    throw new Error(`registry INVALID (${problems.length}):\n${problems.join("\n")}`);
  }

  const { allRoutes, SECTIONS, components, layouts, tokens, contentTypes, workflows, workspaceApps, agentCapabilities, agentPolicy } = registry;

  // ---- 2. normalize ----
  const routes = allRoutes.map((route) => ({ ...route, contentType: route.contentType ?? null }));
  const componentById = new Map(components.map((component) => [component.id, component]));
  const layoutById = new Map(layouts.map((layout) => [layout.id, layout]));
  const contentTypeById = new Map(contentTypes.map((contentType) => [contentType.id, contentType]));
  const workflowById = new Map(workflows.map((workflow) => [workflow.id, workflow]));

  // ---- 4. flatten layouts → per-route component trees ----
  const componentTrees = routes.map((route) => {
    const layout = layoutById.get(route.layout);
    return {
      route: route.id,
      path: route.path,
      layout: route.layout,
      contentType: route.contentType,
      regions: (layout?.regions ?? []).map((region) => ({
        region: region.region,
        components: region.components
          .map((componentId) => componentById.get(componentId))
          .filter((component) => component && component.platforms.some((platform) => route.platforms.includes(platform)))
          .map((component) => ({
            id: component.id,
            status: component.status,
            rendersRouteContent: route.contentType ? component.renders.includes(route.contentType) : false
          }))
      }))
    };
  });

  // ---- 3+5. graph: typed nodes + edges ----
  const nodes = [
    ...routes.map((route) => ({ id: `route:${route.id}`, kind: "route", status: route.status })),
    ...components.map((component) => ({ id: `component:${component.id}`, kind: "component", status: component.status })),
    ...layouts.map((layout) => ({ id: `layout:${layout.id}`, kind: "layout", status: "built" })),
    ...contentTypes.map((contentType) => ({ id: `content-type:${contentType.id}`, kind: "content-type", status: contentType.status })),
    ...workflows.map((workflow) => ({ id: `workflow:${workflow.id}`, kind: "workflow", status: "built" })),
    ...workspaceApps.map((app) => ({ id: `app:${app.id}`, kind: "app", status: app.status })),
    { id: "tokens:design", kind: "tokens", status: "built" }
  ];
  const edges = [];
  const addEdge = (from, to, rel) => edges.push({ from, to, rel });
  for (const route of routes) {
    addEdge(`route:${route.id}`, `layout:${route.layout}`, "uses-layout");
    if (route.contentType) addEdge(`route:${route.id}`, `content-type:${route.contentType}`, "presents");
    for (const dep of route.dependsOn) addEdge(`route:${route.id}`, `route:${dep}`, "depends-on");
  }
  for (const layout of layouts) {
    for (const region of layout.regions) {
      for (const componentId of region.components) addEdge(`layout:${layout.id}`, `component:${componentId}`, "renders");
    }
    addEdge(`layout:${layout.id}`, "tokens:design", "styled-by");
  }
  for (const component of components) {
    for (const rendered of component.renders) addEdge(`component:${component.id}`, `content-type:${rendered}`, "renders");
  }
  for (const contentType of contentTypes) {
    addEdge(`content-type:${contentType.id}`, `workflow:${contentType.workflow}`, "governed-by");
    for (const field of contentType.fields) {
      if (field.type === "reference" && field.references) {
        addEdge(`content-type:${contentType.id}`, `content-type:${field.references}`, "references");
      }
    }
  }
  for (const app of workspaceApps) {
    for (const route of routes) {
      if (app.routePrefixes.some((prefix) => route.id === prefix || route.id.startsWith(`${prefix}.`))) {
        addEdge(`app:${app.id}`, `route:${route.id}`, "owns");
      }
    }
  }

  // impact index (reverse adjacency) + orphan detection
  const incoming = new Map(nodes.map((node) => [node.id, []]));
  for (const edge of edges) incoming.get(edge.to)?.push(edge.from);
  const orphans = {
    components: components.filter((component) => !(incoming.get(`component:${component.id}`) || []).length).map((c) => c.id),
    contentTypes: contentTypes.filter((contentType) => !(incoming.get(`content-type:${contentType.id}`) || []).length).map((c) => c.id),
    workflows: workflows.filter((workflow) => !(incoming.get(`workflow:${workflow.id}`) || []).length).map((w) => w.id)
  };
  const graph = {
    counts: { nodes: nodes.length, edges: edges.length },
    nodes,
    edges,
    impact: Object.fromEntries([...incoming.entries()].filter(([, list]) => list.length).map(([id, list]) => [id, list])),
    orphans
  };

  // ---- 6. frozen identifier ledger ----
  const lockPath = path.join(ROOT, "apps/radio/registry/ids.lock.json");
  const currentIds = {
    routes: routes.map((route) => route.id).sort(),
    components: components.map((component) => component.id).sort(),
    contentTypes: contentTypes.map((contentType) => contentType.id).sort(),
    workflows: workflows.map((workflow) => workflow.id).sort(),
    apps: workspaceApps.map((app) => app.id).sort()
  };
  if (fs.existsSync(lockPath) && !updateLock) {
    const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
    const broken = [];
    for (const [kind, lockedIds] of Object.entries(lock.ids || {})) {
      const current = new Set(currentIds[kind] || []);
      for (const id of lockedIds) if (!current.has(id)) broken.push(`${kind}: ${id}`);
    }
    if (broken.length) {
      throw new Error(
        `FROZEN IDENTIFIERS REMOVED (ids are permanent — evolution must be additive):\n${broken.join("\n")}\nIf a removal is truly intended, update apps/radio/registry/ids.lock.json explicitly in the same commit.`
      );
    }
  }
  if (updateLock || !fs.existsSync(lockPath)) {
    fs.writeFileSync(lockPath, `${JSON.stringify({ note: "Permanent identifier ledger — compiler fails if any id disappears.", updatedAt: new Date().toISOString(), ids: currentIds }, null, 2)}\n`);
  }

  // ---- 7. lookup indexes ----
  const indexes = {
    byPath: Object.fromEntries(routes.map((route) => [route.path, route.id])),
    bySection: groupBy(routes, (route) => route.section, (route) => route.id),
    byStatus: groupBy(routes, (route) => route.status, (route) => route.id),
    byLayout: groupBy(routes, (route) => route.layout, (route) => route.id),
    byContentType: groupBy(routes.filter((route) => route.contentType), (route) => route.contentType, (route) => route.id),
    byTag: groupBy(routes.flatMap((route) => route.tags.map((tag) => [tag, route.id])), (pair) => pair[0], (pair) => pair[1]),
    componentUsage: Object.fromEntries(
      components.map((component) => [
        component.id,
        componentTrees.filter((tree) => tree.regions.some((region) => region.components.some((c) => c.id === component.id))).map((tree) => tree.route)
      ])
    )
  };

  const sourceFiles = fs
    .readdirSync(path.join(ROOT, "apps/radio/registry"))
    .filter((file) => file.endsWith(".ts") && !file.startsWith("._"))
    .sort();
  const sourceHash = crypto
    .createHash("sha256")
    .update(sourceFiles.map((file) => fs.readFileSync(path.join(ROOT, "apps/radio/registry", file))).join("\n"))
    .digest("hex");

  const compiled = {
    id: "radio-vaigyaaniq-compiled-manifest",
    compiledAt: new Date().toISOString(),
    schemaVersion: 3,
    sourceHash,
    counts: {
      routes: routes.length,
      components: components.length,
      layouts: layouts.length,
      contentTypes: contentTypes.length,
      workflows: workflows.length,
      apps: workspaceApps.length,
      agentCapabilities: agentCapabilities.length,
      graphNodes: graph.counts.nodes,
      graphEdges: graph.counts.edges
    },
    sections: SECTIONS,
    routes,
    components,
    layouts,
    tokens,
    contentTypes,
    workflows,
    workspaceApps,
    agentCapabilities,
    agentPolicy,
    componentTrees,
    graph,
    indexes,
    // Phase 6: impact preview — which plugins (and hence artifacts) rebuild
    // when each registry source changes. Injected by the runner's dependency model.
    pluginImpact: pluginSources
      ? Object.fromEntries(
          [...new Set(Object.values(pluginSources).flat())].map((source) => [
            source,
            Object.entries(pluginSources)
              .filter(([, sources]) => sources.includes(source))
              .map(([plugin]) => plugin)
          ])
        )
      : null
  };

  return { compiled, registry };
}

function groupBy(list, keyFn, valueFn) {
  const out = {};
  for (const item of list) {
    const key = keyFn(item);
    (out[key] = out[key] || []).push(valueFn(item));
  }
  return out;
}
