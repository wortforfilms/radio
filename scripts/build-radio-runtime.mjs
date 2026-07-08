import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const WEB = path.join(ROOT, "apps/web/public/radio-html/data");
const DESK = path.join(ROOT, "apps/desktop/public/radio-html/data");
const LYRICS_DIR = path.join(ROOT, "_radio_index/suno_backup/lyrics");

const cat = JSON.parse(fs.readFileSync(path.join(WEB, "suno-library-catalog.json"), "utf8"));
const tracks = cat.tracks || [];

const GENRES = [
  ["Sufi & Qawwali", /(sufi|qawwali|qawali)/i],
  ["Sanatan & Devotional", /(bhajan|mantra|vedic|sanskrit|sanatan|chant|aarti|shankh|\bom\b|shiv|ram|krishna|hanuman|durga|kabir|bhakti)/i],
  ["Hip-Hop & Rap", /(rap|hip[- ]?hop|drill|trap|phonk|boom bap|808)/i],
  ["Folk & Regional", /(folk|ragni|haryanvi|rajasthani|bhojpuri|banjara|jugni|punjabi|nautanki|desi)/i],
  ["Classical & Raga", /(raga|raag|classical|sarod|sitar|tabla|dhrupad|thumri|santoor|sarangi|bansuri)/i],
  ["Electronic & Fusion", /(edm|trance|electronic|synth|techno|lo[- ]?fi|ambient|future|cyber|neon|fusion)/i],
];
const fmt = s => { if(s==null) return ""; s=Math.round(s); return Math.floor(s/60)+":"+String(s%60).padStart(2,"0"); };
const norm = s => (s||"").toLowerCase().replace(/\[[^\]]*\]/g," ").replace(/[^\p{L}\p{N}]+/gu," ").replace(/\s+/g," ").trim();
function readLyrics(id){
  try{
    const raw = fs.readFileSync(path.join(LYRICS_DIR, id+".txt"),"utf8");
    const i = raw.indexOf("LYRICS:");
    const body = i>=0 ? raw.slice(i+7) : raw;
    return body.trim().slice(0,3500);
  }catch{ return ""; }
}
function genreOf(t){
  const hay = (t.styles||"")+" "+(t.title||"");
  for(const [name,re] of GENRES) if(re.test(hay)) return name;
  return "Cinematic & Other";
}

// dedup by lyrics (fallback title) -> canonical = highest plays, then longest
const groups = new Map();
for(const t of tracks){
  const key = norm(readLyricsKey(t)) || ("t:"+norm(t.title)) || t.sunoId;
  if(!groups.has(key)) groups.set(key,[]);
  groups.get(key).push(t);
}
function readLyricsKey(t){ return t._lk !== undefined ? t._lk : (t._lk = readLyrics(t.sunoId)); }
const canonical = g => [...g].sort((a,b)=>(b.playCount||0)-(a.playCount||0)||(b.durationSeconds||0)-(a.durationSeconds||0)||(b.createdAt||"").localeCompare(a.createdAt||""))[0];

const shows = {};
let songCount=0;
for(const g of groups.values()){
  const best = canonical(g);
  const genre = genreOf(best);
  (shows[genre] = shows[genre] || []).push({
    t: best.title || "(untitled)",
    a: best.publicPath || best.audioPath,
    c: best.coverPublicPath || best.coverPath,
    d: best.duration || fmt(best.durationSeconds),
    ly: readLyrics(best.sunoId),
    theme: genre,
    versions: g.length
  });
  songCount++;
}
const showOrder = ["Sufi & Qawwali","Sanatan & Devotional","Hip-Hop & Rap","Folk & Regional","Classical & Raga","Electronic & Fusion","Cinematic & Other"];
const heroFor = "/radio-html/assets/images/radio-vaigyaaniq-runtime-hero.svg";
const showsArr = showOrder.filter(n=>shows[n]).map(name=>({
  name, count: shows[name].length, hero: heroFor,
  songs: shows[name].sort((a,b)=>(b.versions||1)-(a.versions||1))
}));

const newCatalog = {
  artist: "P.H.K.D. / VESAHE",
  total_songs: songCount,
  total_clips: tracks.length,
  source: "/radio-html/data/suno-library-catalog.json",
  sourceStatus: "wired",
  shows: showsArr
};

for(const dir of [WEB, DESK]){
  const f = path.join(dir, "radio-runtime-data.json");
  let doc; try{ doc = JSON.parse(fs.readFileSync(f,"utf8")); }catch{ doc = {id:"radio-vaigyaaniq-runtime-data",verificationState:"wired"}; }
  doc.catalog = newCatalog;
  doc.generatedAt = new Date().toISOString();
  fs.writeFileSync(f, JSON.stringify(doc,null,2));
  console.log("wrote", path.relative(ROOT,f));
}
console.log(`songs=${songCount} clips=${tracks.length} shows=${showsArr.length}`);
showsArr.forEach(s=>console.log(`  ${s.name}: ${s.count}`));
