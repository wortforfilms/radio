// seo plugin: sitemap.xml, robots.txt, rss.xml, atom.xml, feed.json + a
// dependency-graph.json artifact (kept here to preserve the v2 output set).
export async function generate(ctx) {
  const { registry, generatedAt, SITE_ORIGIN, flagVisible, isPublic, indexable, xmlEscape } = ctx;
  const { allRoutes } = registry;

  const publicRoutes = allRoutes.filter((route) => isPublic(route) && indexable(route) && flagVisible(route));
  ctx.artifacts.publicRoutes = publicRoutes;

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicRoutes
  .map(
    (route) =>
      `  <url><loc>${SITE_ORIGIN}${xmlEscape(route.path)}</loc><changefreq>${route.status === "built" ? "daily" : "weekly"}</changefreq><priority>${route.path === "/" ? "1.0" : route.status === "built" ? "0.8" : "0.5"}</priority></url>`
  )
  .join("\n")}
</urlset>
`;
  const disallowed = ["/admin", "/cms", "/studio", "/analytics", "/api/", "/profile", "/settings", "/notifications", "/bookmarks", "/history", "/downloads"];
  const robots = `# Generated from the route registry — do not edit by hand.
User-agent: *
${disallowed.map((prefix) => `Disallow: ${prefix}`).join("\n")}
Allow: /

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;
  const feedRoutes = publicRoutes.filter((route) => route.status !== "planned").slice(0, 50);
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>Radio Vaigyaaniq — Ecosystem</title>
  <link>${SITE_ORIGIN}</link>
  <description>Live sections of the Radio Vaigyaaniq platform (information-architecture feed; statuses evidence-backed).</description>
  <lastBuildDate>${new Date(generatedAt).toUTCString()}</lastBuildDate>
${feedRoutes
  .map(
    (route) =>
      `  <item><title>${xmlEscape(route.title)}</title><link>${SITE_ORIGIN}${xmlEscape(route.path)}</link><guid isPermaLink="false">${route.id}</guid><description>${xmlEscape(route.description)}</description></item>`
  )
  .join("\n")}
</channel></rss>
`;
  const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Radio Vaigyaaniq — Ecosystem</title>
  <id>${SITE_ORIGIN}/</id>
  <link href="${SITE_ORIGIN}/atom.xml" rel="self"/>
  <updated>${generatedAt}</updated>
${feedRoutes
  .map(
    (route) =>
      `  <entry><title>${xmlEscape(route.title)}</title><id>${route.id}</id><link href="${SITE_ORIGIN}${xmlEscape(route.path)}"/><updated>${generatedAt}</updated><summary>${xmlEscape(route.description)}</summary></entry>`
  )
  .join("\n")}
</feed>
`;
  const jsonFeed = {
    version: "https://jsonfeed.org/version/1.1",
    title: "Radio Vaigyaaniq — Ecosystem",
    home_page_url: SITE_ORIGIN,
    feed_url: `${SITE_ORIGIN}/feed.json`,
    description: "Live sections of the Radio Vaigyaaniq platform (IA feed; statuses evidence-backed).",
    items: feedRoutes.map((route) => ({
      id: route.id,
      url: `${SITE_ORIGIN}${route.path}`,
      title: route.title,
      content_text: route.description,
      tags: route.tags
    }))
  };

  // dependency graph (v2 output preserved)
  const edges = allRoutes.flatMap((route) => route.dependsOn.map((dep) => ({ from: route.id, to: dep })));
  const order = [];
  const marked = new Set();
  const visit = (id) => {
    if (marked.has(id)) return;
    marked.add(id);
    for (const edge of edges) if (edge.from === id) visit(edge.to);
    order.push(id);
  };
  for (const route of allRoutes) visit(route.id);
  const dependencyGraph = {
    generatedAt,
    nodes: allRoutes.filter((r) => r.dependsOn.length || edges.some((e) => e.to === r.id)).map((r) => r.id),
    edges,
    topologicalOrder: order.filter((id) => edges.some((e) => e.from === id || e.to === id)),
    cycles: []
  };

  return [
    ["apps/radio/public/sitemap.xml", sitemap],
    ["apps/radio/public/robots.txt", robots],
    ["apps/radio/public/rss.xml", rss],
    ["apps/radio/public/atom.xml", atom],
    ["apps/radio/public/feed.json", `${JSON.stringify(jsonFeed, null, 2)}\n`],
    ["apps/radio/public/registry/dependency-graph.json", `${JSON.stringify(dependencyGraph, null, 2)}\n`]
  ];
}
