// platform plugin: platform-map.json + per-platform UI manifests
// (ui-manifest.web/mobile/desktop/tv/car/watch.json) — navigation, routes,
// layouts, and a design-token reference, all filtered to the platform.
const PLATFORMS = ["web", "mobile", "desktop", "tv", "car", "watch", "api", "offline"];
const UI_PLATFORMS = ["web", "mobile", "desktop", "tv", "car", "watch"];

export async function generate(ctx) {
  const { registry, generatedAt, flagVisible, navItem } = ctx;
  const { allRoutes, layouts } = registry;
  const navigable = allRoutes.filter(flagVisible);

  const platformMap = {
    generatedAt,
    platforms: Object.fromEntries(
      PLATFORMS.map((platform) => [platform, allRoutes.filter((route) => route.platforms.includes(platform)).map((route) => route.id)])
    ),
    navigationByPlatform: Object.fromEntries(
      UI_PLATFORMS.map((platform) => [
        platform,
        navigable
          .filter((route) => route.platforms.includes(platform) && (route.navigation.sidebar || route.navigation.header))
          .map(navItem)
      ])
    )
  };
  ctx.artifacts.platformMap = platformMap;

  const files = [["apps/radio/public/registry/platform-map.json", `${JSON.stringify(platformMap, null, 2)}\n`]];

  for (const platform of UI_PLATFORMS) {
    const routes = navigable.filter((route) => route.platforms.includes(platform));
    const usedLayouts = [...new Set(routes.map((route) => route.layout))];
    const manifest = {
      generatedAt,
      platform,
      tokens: "/registry/tokens/",
      counts: { routes: routes.length, layouts: usedLayouts.length },
      navigation: platformMap.navigationByPlatform[platform],
      layouts: layouts.filter((layout) => usedLayouts.includes(layout.id)),
      routes: routes.map((route) => ({
        id: route.id,
        path: route.path,
        title: route.title,
        layout: route.layout,
        status: route.status,
        permissions: route.permissions,
        contentType: route.contentType ?? null
      }))
    };
    files.push([`apps/radio/public/registry/ui-manifest.${platform}.json`, `${JSON.stringify(manifest, null, 2)}\n`]);
  }
  return files;
}
