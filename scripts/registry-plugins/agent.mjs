// agent plugin: agent-policy.json (consumed by the orchestrator at runtime as a
// generated artifact — compile-time philosophy preserved) + AGENT.md docs.
const chip = { built: "✅ built", partial: "🟡 partial", planned: "⬜ planned" };

export async function generate(ctx) {
  const { compiled, generatedAt } = ctx;
  const { agentCapabilities, agentPolicy } = compiled;

  const policyOut = {
    generatedAt,
    phkd: {
      failClosed: true,
      note: "The orchestrator refuses any action whose gates don't hold. Planned capabilities (ads, LLM answers, quizzes, composition) return blocked-* statuses until real providers/inventory exist."
    },
    counts: {
      capabilities: agentCapabilities.length,
      built: agentCapabilities.filter((capability) => capability.status === "built").length,
      planned: agentCapabilities.filter((capability) => capability.status === "planned").length
    },
    policy: agentPolicy,
    capabilities: agentCapabilities
  };
  ctx.artifacts.agentPolicy = policyOut;

  const doc = `# Radio as an Agent\n\nGenerated ${generatedAt} from \`registry/agent.ts\` — do not edit by hand.\n\nThe agent is a fail-closed co-pilot: perception (listener context, manifest,\nweather gate) → rule-based cognition (LLM opt-in via \`AGENT_LLM_PROVIDER\`) →\nactions executed by the existing engine. It never fabricates, never bypasses\nrights, never hides monetisation, and always discloses itself.\n\n## Policy\n\n- Disclosure: “${agentPolicy.disclosure}”\n- Personas by daypart: ${Object.entries(agentPolicy.daypartPersona).map(([daypart, persona]) => `${daypart} → ${persona}`).join(" · ")}\n- Stations by daypart: ${Object.entries(agentPolicy.daypartStations).map(([daypart, stations]) => `${daypart} → ${stations.join("/")}`).join(" · ")}\n- Upsell only after ${agentPolicy.upsellAfterPreviews} previews · max ${agentPolicy.maxAnnouncementsPerHour} announcements/hour\n\n### Constitution\n\n${agentPolicy.rules.map((rule) => `- ${rule}`).join("\n")}\n\n## Capabilities\n\n| id | status | gates | personas |\n|---|---|---|---|\n${agentCapabilities.map((capability) => `| \`${capability.id}\` | ${chip[capability.status]} | ${capability.gates.join("; ")} | ${capability.personas.join(", ") || "—"} |`).join("\n")}\n\n## API\n\n- \`POST /agent/decide\` — perception in, validated actions out (radio-backend)\n- \`GET /agent/capabilities\` — this policy document\n`;

  return [
    ["apps/radio/public/registry/agent-policy.json", `${JSON.stringify(policyOut, null, 2)}\n`],
    ["docs/registry/AGENT.md", doc]
  ];
}
