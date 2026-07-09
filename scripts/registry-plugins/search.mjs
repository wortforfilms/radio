// search plugin: generated search index (public, flag-visible, searchable routes).
export async function generate(ctx) {
  const { registry, generatedAt, flagVisible } = ctx;
  const entries = registry.allRoutes
    .filter((route) => route.searchable && flagVisible(route))
    .map((route) => ({
      id: route.id,
      title: route.title,
      description: route.description,
      keywords: route.seo.keywords,
      section: route.section,
      tags: route.tags,
      url: route.path,
      status: route.status
    }));
  const searchIndex = { generatedAt, count: entries.length, entries };
  ctx.artifacts.search = searchIndex;
  return [["apps/radio/public/registry/search.json", `${JSON.stringify(searchIndex, null, 2)}\n`]];
}
