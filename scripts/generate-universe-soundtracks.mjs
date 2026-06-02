import { copyFile, mkdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

const soundtracks = [
  ["universal-knowledge-lineage-explorer", "रेडियो सनातन वैज्ञानिक (Radio Sanatan Vaigyanik - Current).mp3", "Radio Sanatan Vaigyanik"],
  ["pitra-universe", "ॐ पितरों को बुलाओ (Om Pitron Ko Bulao).mp3", "Om Pitron Ko Bulao"],
  ["guru-maataa-universe", "माता (Mata).mp3", "Mata"],
  ["rishi-universe", "ॐ अग्निमीळे पुरोहितं (Om Agnimile Purohitam).mp3", "Om Agnimile Purohitam"],
  ["rishika-universe", "सुनो री सखियों (Suno Ri Sakhiyon).mp3", "Suno Ri Sakhiyon"],
  ["parampara-universe", "बडी़ पुरानी बात है (Badi Purani Baat Hai - Sarod).mp3", "Badi Purani Baat Hai"],
  ["civilization-universe", "यही भारत की पहचान (Yahi Bharat Ki Pehchaan).mp3", "Yahi Bharat Ki Pehchaan"],
  ["knowledge-universe", "सत्य सनातन वैज्ञानिक का ज्ञान (Satya Sanatan Vaigyanik Ka Gyan).mp3", "Satya Sanatan Vaigyanik Ka Gyan"],
  ["subject-universe", "सन्दर्भ की परिभाषा (Sandarbh Ki Paribhasha).mp3", "Sandarbh Ki Paribhasha"],
  ["text-universe", "तमसो मा ज्योतिर्गमय (Tamaso Ma Jyotirgamaya).mp3", "Tamaso Ma Jyotirgamaya"],
  ["timeline-universe", "फ़्रीक्वेंसी ऑफ़ फ्यूचर-पास्ट (Frequency of Future-Past).mp3", "Frequency of Future-Past"],
  ["geography-universe", "धरती का नून (Dharti Ka Noon).mp3", "Dharti Ka Noon"],
  ["knowledge-graph-universe", "रेखाएँ (Rekhayein).mp3", "Rekhayein"],
  ["education-universe", "नचिकेता (Nachiketa).mp3", "Nachiketa"],
  ["research-universe", "अंतर्मन (Antarman).mp3", "Antarman"],
  ["community-universe", "मेरे यार प्यारे (Mere Yaar Pyaare).mp3", "Mere Yaar Pyaare"],
  ["media-universe", "कॉस्मिक चैंट (Cosmic Chant - Intro).mp3", "Cosmic Chant"],
  ["ai-universe", "न्यूरल जोगी (Neural Jogi).mp3", "Neural Jogi"],
  ["observatory-universe", "ब्रह्मांड जागरण (Cosmic Awakening).mp3", "Cosmic Awakening"],
  ["future-knowledge-universe", "फ्यूचर-पास्ट क्लीयरेंस (Future-Past Clearance).mp3", "Future-Past Clearance"],
  ["governance-universe", "आवाजों़ की अदालत (Aawazon Ki Adaalat).mp3", "Aawazon Ki Adaalat"],
  ["universal-command-center", "दिव्य शंखनाद (Divya Shankhnaad).mp3", "Divya Shankhnaad"]
];

const outDir = join(process.cwd(), "apps/web/public/universe-soundtracks");
await mkdir(outDir, { recursive: true });

const manifest = [];

for (const [slug, source, title] of soundtracks) {
  const sourcePath = join(process.cwd(), source);
  await stat(sourcePath);
  const target = `${slug}.mp3`;
  await copyFile(sourcePath, join(outDir, target));
  manifest.push({
    slug,
    title,
    path: `/universe-soundtracks/${target}`,
    sourceFile: source
  });
}

await writeFile(join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
