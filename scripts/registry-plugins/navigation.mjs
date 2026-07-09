// navigation plugin: sidebar/header/footer/quickAccess/commandPalette/contextMenu
// + breadcrumb chains. Flag-hidden routes never appear.
export async function generate(ctx) {
  const { registry, generatedAt, ENABLED_FLAGS, flagVisible, navItem } = ctx;
  const { allRoutes, byPath } = registry;
  const navigable = allRoutes.filter(flagVisible);

  const parentChain = (route) => {
    const chain = [];
    const parts = route.path.split("/").filter(Boolean);
    for (let index = 1; index < parts.length; index += 1) {
      const ancestor = byPath.get(`/${parts.slice(0, index).join("/")}`);
      if (ancestor) chain.push(ancestor.id);
    }
    return chain;
  };

  const navigation = {
    generatedAt,
    enabledFlags: [...ENABLED_FLAGS],
    sidebar: navigable.filter((r) => r.navigation.sidebar).map(navItem),
    header: navigable.filter((r) => r.navigation.header).map(navItem),
    footer: navigable.filter((r) => r.navigation.footer).map(navItem),
    quickAccess: navigable.filter((r) => r.navigation.quickAccess).map(navItem),
    commandPalette: navigable.filter((r) => r.navigation.commandPalette).map(navItem),
    contextMenu: navigable.filter((r) => r.navigation.contextMenu).map((r) => r.id),
    breadcrumbs: Object.fromEntries(
      navigable.filter((r) => r.navigation.breadcrumbs).map((r) => [r.id, parentChain(r)])
    ),
    hiddenByFlags: allRoutes.filter((r) => !flagVisible(r)).map((r) => ({ id: r.id, featureFlags: r.featureFlags }))
  };
  ctx.artifacts.navigation = navigation;

  return [["apps/radio/public/registry/navigation.json", `${JSON.stringify(navigation, null, 2)}\n`]];
}
