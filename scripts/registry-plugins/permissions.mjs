// permissions plugin: role definitions + inheritance + role↔route matrices.
export const ROLES = ["anonymous", "listener", "student", "researcher", "creator", "moderator", "editor", "admin", "superadmin"];
export const INHERITS = {
  anonymous: [],
  listener: ["anonymous"],
  student: ["listener", "anonymous"],
  researcher: ["listener", "anonymous"],
  creator: ["listener", "anonymous"],
  moderator: ["listener", "anonymous"],
  editor: ["creator", "listener", "anonymous"],
  admin: ["editor", "moderator", "creator", "listener", "anonymous"],
  superadmin: ["admin", "editor", "moderator", "creator", "listener", "anonymous"]
};

export async function generate(ctx) {
  const { registry, generatedAt } = ctx;
  const { allRoutes } = registry;
  const permissions = {
    generatedAt,
    roles: ROLES,
    inherits: INHERITS,
    byRoute: Object.fromEntries(allRoutes.map((route) => [route.id, route.permissions])),
    byRole: Object.fromEntries(
      ROLES.map((role) => [
        role,
        allRoutes
          .filter((route) => route.permissions.some((needed) => needed === role || INHERITS[role].includes(needed)))
          .map((route) => route.id)
      ])
    )
  };
  ctx.artifacts.permissions = permissions;
  return [["apps/radio/public/registry/permissions.json", `${JSON.stringify(permissions, null, 2)}\n`]];
}
