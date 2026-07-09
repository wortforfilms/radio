// tokens plugin: colors/spacing/typography/icons/motion.json + tokens.css —
// one design-token source driving web, mobile, desktop, TV, and watch.
export async function generate(ctx) {
  const { registry, generatedAt } = ctx;
  const { tokens } = registry;
  const wrap = (name, value) => `${JSON.stringify({ generatedAt, [name]: value }, null, 2)}\n`;

  const css = `/* GENERATED from apps/radio/registry/tokens.ts — do not edit. */
:root {
${Object.entries(tokens.colors).map(([key, value]) => `  --color-${key}: ${value};`).join("\n")}
${Object.entries(tokens.spacing).map(([key, value]) => `  --space-${key}: ${value};`).join("\n")}
${Object.entries(tokens.typography.fonts).map(([key, value]) => `  --font-${key}: ${value};`).join("\n")}
${Object.entries(tokens.typography.sizes).map(([key, value]) => `  --text-${key}: ${value};`).join("\n")}
${Object.entries(tokens.motion.durations).map(([key, value]) => `  --duration-${key}: ${value};`).join("\n")}
${Object.entries(tokens.motion.easings).map(([key, value]) => `  --ease-${key}: ${value};`).join("\n")}
}
`;

  return [
    ["apps/radio/public/registry/tokens/colors.json", wrap("colors", tokens.colors)],
    ["apps/radio/public/registry/tokens/spacing.json", wrap("spacing", tokens.spacing)],
    ["apps/radio/public/registry/tokens/typography.json", wrap("typography", tokens.typography)],
    ["apps/radio/public/registry/tokens/icons.json", wrap("icons", tokens.icons)],
    ["apps/radio/public/registry/tokens/motion.json", wrap("motion", tokens.motion)],
    ["apps/radio/public/registry/tokens/tokens.css", css],
    // Phase 5: ship the same artifacts inside the workspace tokens package.
    ["packages/ui-tokens/dist/tokens.css", css],
    ["packages/ui-tokens/dist/tokens.json", `${JSON.stringify({ generatedAt, ...tokens }, null, 2)}\n`]
  ];
}
