// content plugin: content-types.json, cms-schemas.json (admin-panel-consumable
// form schemas), workflows.json (editorial + rights-closure lifecycles).
export async function generate(ctx) {
  const { registry, generatedAt } = ctx;
  const { contentTypes, workflows, allRoutes } = registry;

  const contentTypesOut = {
    generatedAt,
    count: contentTypes.length,
    contentTypes,
    routesByContentType: Object.fromEntries(
      contentTypes.map((contentType) => [
        contentType.id,
        allRoutes.filter((route) => route.contentType === contentType.id).map((route) => route.id)
      ])
    )
  };
  ctx.artifacts.contentTypes = contentTypesOut;

  // CMS form schemas derived from content-type fields (widget per field type).
  const WIDGET = {
    string: "text",
    text: "textarea",
    richtext: "richtext",
    number: "number",
    boolean: "checkbox",
    date: "datetime",
    duration: "number",
    url: "url",
    asset: "file",
    reference: "relation",
    "cue-list": "cue-editor",
    money: "money"
  };
  const cmsSchemas = {
    generatedAt,
    note: "Generated from registry content types. The admin panel stays fail-closed: publish transitions require the workflow gates below.",
    schemas: contentTypes.map((contentType) => ({
      id: contentType.id,
      label: contentType.name,
      status: contentType.status,
      workflow: contentType.workflow,
      fields: contentType.fields.map((field) => ({
        name: field.name,
        label: field.name.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()),
        widget: WIDGET[field.type] || "text",
        required: field.required,
        ...(field.references ? { relation: field.references } : {}),
        ...(field.description ? { hint: field.description } : {})
      }))
    }))
  };

  const workflowsOut = { generatedAt, count: workflows.length, workflows };
  ctx.artifacts.workflows = workflowsOut;

  return [
    ["apps/radio/public/registry/content-types.json", `${JSON.stringify(contentTypesOut, null, 2)}\n`],
    ["apps/radio/public/registry/cms-schemas.json", `${JSON.stringify(cmsSchemas, null, 2)}\n`],
    ["apps/radio/public/registry/workflows.json", `${JSON.stringify(workflowsOut, null, 2)}\n`]
  ];
}
