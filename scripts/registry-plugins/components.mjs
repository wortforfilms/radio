// components plugin: components.json + component-trees.json.
// Trees are flattened by the COMPILER (single source); this plugin only emits.
export async function generate(ctx) {
  const { registry, compiled, generatedAt } = ctx;
  const { components } = registry;

  const componentsOut = { generatedAt, count: components.length, components };
  ctx.artifacts.components = componentsOut;

  const componentTrees = { generatedAt, count: compiled.componentTrees.length, trees: compiled.componentTrees };
  ctx.artifacts.componentTrees = componentTrees;

  return [
    ["apps/radio/public/registry/components.json", `${JSON.stringify(componentsOut, null, 2)}\n`],
    ["apps/radio/public/registry/component-trees.json", `${JSON.stringify(componentTrees, null, 2)}\n`]
  ];
}
