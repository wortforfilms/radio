// deployment plugin (Phase 8): environment configs + Infrastructure-as-Code,
// all derived from registry metadata. Secrets are NEVER emitted — env names only.
const ENVIRONMENTS = {
  development: { enabledFlags: ["premium", "labs", "beta", "events", "academy", "experimental"] },
  preview: { enabledFlags: ["premium", "beta", "events", "academy"] },
  production: { enabledFlags: ["premium"] }
};

export async function generate(ctx) {
  const { registry, generatedAt } = ctx;
  const { allRoutes, workspaceApps } = registry;

  const files = [];
  for (const [environment, config] of Object.entries(ENVIRONMENTS)) {
    const enabled = new Set(config.enabledFlags);
    const visible = allRoutes.filter((route) => route.featureFlags.every((flag) => enabled.has(flag)));
    files.push([
      `apps/radio/public/registry/env-config.${environment}.json`,
      `${JSON.stringify(
        {
          generatedAt,
          environment,
          enabledFlags: config.enabledFlags,
          counts: { visibleRoutes: visible.length, hiddenRoutes: allRoutes.length - visible.length },
          hiddenRoutes: allRoutes.filter((route) => !visible.includes(route)).map((route) => route.id),
          requiredSecrets: [
            // env names only — values live in the platform's secret manager
            "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET",
            "ADMIN_PASSWORD", "WEATHER_API_KEY",
            "AGENT_LLM_PROVIDER", "AGENT_LLM_API_KEY",
            "CONTENTGEN_PROVIDER", "CONTENTGEN_API_KEY"
          ]
        },
        null,
        2
      )}\n`
    ]);
  }

  // Terraform JSON derived from platform metadata: one service per built app,
  // static hosting for web surfaces. Placeholder-free: regions/sizes are vars.
  const builtApps = workspaceApps.filter((app) => app.status !== "planned");
  const infra = {
    "//": `Generated ${generatedAt} from registry workspace/platform metadata — do not edit. Apply with terraform; values via variables, secrets via your secret manager.`,
    variable: {
      region: { type: "string" },
      instance_size: { type: "string", default: "small" }
    },
    resource: {
      generic_service: Object.fromEntries(
        builtApps.map((app) => [
          app.id.replace(/-/g, "_"),
          {
            "//": `${app.name} (${app.status}) — owns route prefixes: ${app.routePrefixes.join(", ") || "n/a"}`,
            name: `vaigyaaniq-${app.id}`,
            size: "${var.instance_size}",
            region: "${var.region}",
            env_from_secrets: ["ADMIN_PASSWORD", "AGENT_LLM_API_KEY", "RAZORPAY_KEY_SECRET"]
          }
        ])
      ),
      static_site: {
        radio_surfaces: {
          "//": "radio-html surfaces + generated registry artifacts (sitemap, feeds, explorer)",
          name: "vaigyaaniq-radio-static",
          build_command: "npm run radio:registry -- --force",
          publish_dir: "apps/radio/public"
        }
      }
    }
  };
  files.push(["apps/radio/public/registry/infra.tf.json", `${JSON.stringify(infra, null, 2)}\n`]);

  // Preview deployments: PR → preview env with the preview flag set.
  files.push([
    "vercel.json",
    `${JSON.stringify(
      {
        "//": "Preview deployments for registry PRs. REGISTRY_FLAGS drives flag-gated visibility per environment (see env-config.*.json).",
        buildCommand: "npm run radio:registry -- --force",
        outputDirectory: "apps/radio/public",
        env: { REGISTRY_FLAGS: "premium,beta,events,academy" }
      },
      null,
      2
    )}\n`
  ]);

  return files;
}
