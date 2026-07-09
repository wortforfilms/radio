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

  const doc = `# Radio as an Agent\n\nGenerated ${generatedAt} from \`registry/agent.ts\` — do not edit by hand.\n\nThe agent is a fail-closed co-pilot: perception (listener context, manifest,\nweather gate) → cognition (rules + learned weights; LLM opt-in via\n\`AGENT_LLM_PROVIDER\`) → actions executed by the existing engine. It never\nfabricates, never bypasses rights, never hides monetisation, always discloses.\n\n## Policy\n\n- Disclosure: “${agentPolicy.disclosure}” · LLM: “${agentPolicy.llmDisclosure}”\n- Personas by daypart: ${Object.entries(agentPolicy.daypartPersona).map(([daypart, persona]) => `${daypart} → ${persona}`).join(" · ")}\n- Stations by daypart: ${Object.entries(agentPolicy.daypartStations).map(([daypart, stations]) => `${daypart} → ${stations.join("/")}`).join(" · ")}\n- Upsell only after ${agentPolicy.upsellAfterPreviews} previews · max ${agentPolicy.maxAnnouncementsPerHour} announcements/hour\n- Learning: ${agentPolicy.learning.enabled ? `enabled — rate ${agentPolicy.learning.adjustmentRate}, min weight ${agentPolicy.learning.minWeight}` : "disabled"} (weekly: \`node apps/radio-backend/learning.js\`, cron \`0 3 * * 1\`; rights expiry daily: \`node apps/radio-backend/rights-ledger.js\`, cron \`0 2 * * *\`)\n\n### Constitution\n\n${agentPolicy.rules.map((rule) => `- ${rule}`).join("\n")}\n\n## Capabilities\n\n| id | status | gates | personas |\n|---|---|---|---|\n${agentCapabilities.map((capability) => `| \`${capability.id}\` | ${chip[capability.status]} | ${capability.gates.join("; ")} | ${capability.personas.join(", ") || "—"} |`).join("\n")}\n\n## API\n\n- \`POST /agent/decide\` — perception in, validated actions out (weights + personalisation applied)\n- \`POST /agent/ask\` — Phase-2 cognition (sources-only, disclosed)\n- \`POST /api/agent/feedback\` — 👍/👎 → immutable ledger → weekly weight adjustment\n- \`POST /agent/compose\` (admin) — generation lane, everything unpublished pending rights\n- \`GET /agent/capabilities\` — this policy document\n`;

  return [
    ["apps/radio/public/registry/agent-policy.json", `${JSON.stringify(policyOut, null, 2)}\n`],
    ["docs/registry/AGENT.md", doc]
  ];
}
