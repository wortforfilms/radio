// components plugin: components.json + component-trees.json
// (route → layout → region component trees, annotated with component status
// and filtered to components available on at least one of the route's platforms).
export async function generate(ctx) {
  const { registry, generatedAt } = ctx;
  const { allRoutes, components, layouts } = registry;
  const componentById = new Map(components.map((component) => [component.id, component]));
  const layoutById = new Map(layouts.map((layout) => [layout.id, layout]));

  const componentsOut = { generatedAt, count: components.length, components };
  ctx.artifacts.components = componentsOut;

  const trees = allRoutes.map((route) => {
    const layout = layoutById.get(route.layout);
    return {
      route: route.id,
      path: route.path,
      layout: route.layout,
      contentType: route.contentType ?? null,
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
  const componentTrees = { generatedAt, count: trees.length, trees };
  ctx.artifacts.componentTrees = componentTrees;

  return [
    ["apps/radio/public/registry/components.json", `${JSON.stringify(componentsOut, null, 2)}\n`],
    ["apps/radio/public/registry/component-trees.json", `${JSON.stringify(componentTrees, null, 2)}\n`]
  ];
}
