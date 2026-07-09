// Workflow registry. Two lifecycles:
//   editorial      — the standard Draft → … → Archived pipeline for content types
//   rights-closure — the EXISTING PHKD lane for radio tracks, encoded as-is:
//                    publishing requires a verified rights proof (admin intent
//                    alone never publishes; see build-radio-engine-manifest.mjs)
import type { WorkflowDefinition } from "./types.ts";

export const workflows: WorkflowDefinition[] = [
  {
    id: "editorial",
    name: "Editorial",
    description: "Standard content lifecycle for podcasts, articles, events, courses.",
    states: ["draft", "review", "approved", "scheduled", "published", "archived"],
    initial: "draft",
    transitions: [
      { from: "draft", to: "review", requires: ["content-complete"], roles: ["creator", "editor"] },
      { from: "review", to: "approved", requires: ["reviewer-signoff"], roles: ["editor", "moderator"] },
      { from: "review", to: "draft", requires: [], roles: ["editor", "moderator"] },
      { from: "approved", to: "scheduled", requires: ["publish-window-set"], roles: ["editor"] },
      { from: "approved", to: "published", requires: [], roles: ["editor", "admin"] },
      { from: "scheduled", to: "published", requires: ["publish-window-reached"], roles: ["editor", "admin"] },
      { from: "published", to: "archived", requires: [], roles: ["editor", "admin"] },
      { from: "archived", to: "draft", requires: [], roles: ["admin"] }
    ]
  },
  {
    id: "rights-closure",
    name: "Rights Closure (PHKD)",
    description: "Fail-closed track lane: no publish without a verified rights proof + entitlement gates.",
    states: ["draft", "rights-review", "rights-verified", "published", "archived"],
    initial: "draft",
    transitions: [
      { from: "draft", to: "rights-review", requires: ["rights-proof-uploaded"], roles: ["editor", "admin"] },
      {
        from: "rights-review",
        to: "rights-verified",
        requires: ["radio:rights:closure verifier pass"],
        roles: ["admin"]
      },
      {
        from: "rights-verified",
        to: "published",
        requires: ["admin publish intent", "verified rights proof (enforced by manifest builder)"],
        roles: ["admin", "superadmin"]
      },
      { from: "published", to: "archived", requires: [], roles: ["admin"] }
    ]
  }
];
