import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const universes = [
  "Universal Knowledge Lineage Explorer",
  "Pitra Universe",
  "Guru Maataa Universe",
  "Rishi Universe",
  "Rishika Universe",
  "Parampara Universe",
  "Civilization Universe",
  "Knowledge Universe",
  "Subject Universe",
  "Text Universe",
  "Timeline Universe",
  "Geography Universe",
  "Knowledge Graph Universe",
  "Education Universe",
  "Research Universe",
  "Community Universe",
  "Media Universe",
  "AI Universe",
  "Observatory Universe",
  "Future Knowledge Universe",
  "Governance Universe",
  "Universal Command Center"
];

const palettes = [
  ["#165b48", "#d8efe5", "#2b9178"],
  ["#84451f", "#f0c082", "#5a2717"],
  ["#35456f", "#d7ddff", "#6a79bc"],
  ["#17636b", "#d0f3f1", "#2aa1aa"],
  ["#7a2e3a", "#f2c4cd", "#b84d62"],
  ["#53642b", "#e4ecb4", "#879a43"],
  ["#285b82", "#cfebff", "#3a8bc1"],
  ["#936219", "#f4d08a", "#bb842c"]
];

const motifByName = {
  "Pitra Universe": "ancestral rings",
  "Guru Maataa Universe": "teacher lamp",
  "Rishi Universe": "sage constellation",
  "Rishika Universe": "scholar lotus",
  "Parampara Universe": "lineage braid",
  "Civilization Universe": "city mandala",
  "Knowledge Graph Universe": "node lattice",
  "Timeline Universe": "time arc",
  "Geography Universe": "terrain grid",
  "AI Universe": "retrieval matrix",
  "Observatory Universe": "signal observatory",
  "Governance Universe": "audit seal",
  "Universal Command Center": "control atlas"
};

const outDir = join(process.cwd(), "apps/web/public/universe-heroes");
await mkdir(outDir, { recursive: true });

await Promise.all(
  universes.map(async (name, index) => {
    const slug = slugify(name);
    const [base, light, accent] = palettes[index % palettes.length];
    const motif = motifByName[name] ?? "knowledge field";
    const svg = renderSvg({ name, slug, base, light, accent, motif, index });
    await writeFile(join(outDir, `${slug}.svg`), svg, "utf8");
  })
);

function slugify(name) {
  return name.toLowerCase().replaceAll("&", "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function renderSvg({ name, slug, base, light, accent, motif, index }) {
  const nodes = Array.from({ length: 18 }, (_, i) => {
    const x = 160 + ((i * 173 + index * 37) % 1420);
    const y = 110 + ((i * 97 + index * 53) % 470);
    const r = 3 + ((i + index) % 6);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${light}" opacity="${0.24 + (i % 4) * 0.08}"/>`;
  }).join("\n");

  const links = Array.from({ length: 17 }, (_, i) => {
    const x1 = 160 + ((i * 173 + index * 37) % 1420);
    const y1 = 110 + ((i * 97 + index * 53) % 470);
    const x2 = 160 + (((i + 1) * 173 + index * 37) % 1420);
    const y2 = 110 + (((i + 1) * 97 + index * 53) % 470);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${light}" stroke-width="1.2" opacity="0.18"/>`;
  }).join("\n");

  const rings = Array.from({ length: 8 }, (_, i) => {
    const cx = 1120 + i * 48;
    const cy = 360 - i * 19;
    const rx = 270 - i * 20;
    const ry = 110 + i * 8;
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${accent}" stroke-width="${2 + (i % 3)}" opacity="${0.14 + i * 0.035}" transform="rotate(${-18 + i * 4} ${cx} ${cy})"/>`;
  }).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="720" viewBox="0 0 1800 720" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(name)} hero banner</title>
  <desc id="desc">Abstract ${escapeXml(motif)} banner for the Vaishviq ${escapeXml(name)} persistence scope.</desc>
  <defs>
    <linearGradient id="bg-${slug}" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="${base}"/>
      <stop offset="54%" stop-color="#101713"/>
      <stop offset="100%" stop-color="${accent}"/>
    </linearGradient>
    <pattern id="grid-${slug}" width="44" height="44" patternUnits="userSpaceOnUse">
      <path d="M44 0H0V44" fill="none" stroke="${light}" stroke-width="1" opacity="0.11"/>
    </pattern>
    <filter id="soft-${slug}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>
  <rect width="1800" height="720" fill="url(#bg-${slug})"/>
  <rect width="1800" height="720" fill="url(#grid-${slug})"/>
  <circle cx="1450" cy="124" r="260" fill="${light}" opacity="0.12" filter="url(#soft-${slug})"/>
  <circle cx="1280" cy="606" r="320" fill="${accent}" opacity="0.14" filter="url(#soft-${slug})"/>
  ${rings}
  ${links}
  ${nodes}
  <path d="M0 560C240 494 366 622 586 548C812 472 936 402 1168 466C1398 530 1562 464 1800 386V720H0Z" fill="#000000" opacity="0.18"/>
  <path d="M102 610C294 510 454 564 612 462C806 336 990 330 1184 406C1394 488 1570 398 1708 310" fill="none" stroke="${light}" stroke-width="3" opacity="0.34"/>
  <text x="104" y="594" fill="${light}" opacity="0.22" font-family="ui-sans-serif, system-ui" font-size="34" font-weight="700" letter-spacing="0">${escapeXml(motif)}</text>
</svg>
`;
}

function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
