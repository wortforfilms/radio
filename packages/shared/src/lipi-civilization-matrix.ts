export type LipiCivilizationStatus = "verified_catalog" | "research" | "undeciphered" | "association_only";

export type LipiCivilizationMatrixEntry = {
  key: string;
  name: string;
  hkdUri: string;
  status: LipiCivilizationStatus;
  civilizations: string[];
  religions: string[];
  languages: string[];
  scripts: string[];
  texts: string[];
  inscriptions: string[];
  symbols: string[];
  phkdNote: string;
};

export type LipiExplorerPage = {
  key: string;
  name: string;
  path: string;
  description: string;
};

export const lipiPhkdRule = {
  model: "Civilization ↔ Religion ↔ Language ↔ Script ↔ Literature ↔ Inscriptions",
  rejectedModel: "Religion owns Script",
  note: "Scripts are modeled as associated with civilizations, religions, languages, literature, and inscriptions. Ownership claims are fail-closed unless independently cited and verified."
};

export const lipiKnowledgeGraphChain = ["Civilization", "Religion", "Language", "Script", "Glyph", "IPA", "Sound"];

export const lipiExamplePath = {
  civilization: "Buddhist Civilization",
  language: "Pali",
  script: "Brahmi",
  glyph: "𑀅",
  ipa: "/a/"
};

export const lipiCivilizationMatrix: LipiCivilizationMatrixEntry[] = [
  {
    key: "mesopotamian",
    name: "Mesopotamian Civilizations",
    hkdUri: "hkd://lipi/civilization/mesopotamian",
    status: "verified_catalog",
    civilizations: ["Sumerian", "Akkadian", "Babylonian", "Assyrian"],
    religions: [],
    languages: ["Sumerian", "Akkadian"],
    scripts: ["Proto-Cuneiform", "Cuneiform"],
    texts: [],
    inscriptions: [],
    symbols: [],
    phkdNote: "Catalog association only. Do not infer a single religious ownership model for cuneiform transmission."
  },
  {
    key: "egyptian",
    name: "Egyptian Civilization",
    hkdUri: "hkd://lipi/civilization/egyptian",
    status: "verified_catalog",
    civilizations: ["Ancient Egypt"],
    religions: [],
    languages: ["Egyptian", "Coptic"],
    scripts: ["Hieroglyphic", "Hieratic", "Demotic", "Coptic"],
    texts: ["Pyramid Texts", "Book of the Dead", "Temple Inscriptions"],
    inscriptions: ["Temple Inscriptions"],
    symbols: [],
    phkdNote: "Texts and scripts are associated with Egyptian civilization and transmission contexts, not assigned as owned by one religion."
  },
  {
    key: "indus",
    name: "Indus Civilization",
    hkdUri: "hkd://lipi/civilization/indus",
    status: "undeciphered",
    civilizations: ["Indus Civilization"],
    religions: [],
    languages: [],
    scripts: [],
    texts: [],
    inscriptions: [],
    symbols: ["Indus Sign Corpus"],
    phkdNote: "Research/undeciphered. No definitive decipherment should be claimed."
  },
  {
    key: "vedic",
    name: "Vedic / Classical Indic Civilizations",
    hkdUri: "hkd://lipi/civilization/vedic",
    status: "association_only",
    civilizations: ["Vedic", "Classical Indic"],
    religions: ["Vedic traditions", "Hindu traditions", "Buddhist traditions", "Jain traditions"],
    languages: ["Sanskrit", "Prakrit", "Pali"],
    scripts: ["Brahmi", "Kharosthi", "Gupta", "Nagari", "Devanagari"],
    texts: ["Vedas", "Upanishads", "Mahabharata", "Ramayana", "Sutras"],
    inscriptions: [],
    symbols: [],
    phkdNote: "Scripts are associated with civilizations, languages, and textual transmission. Do not model one tradition as owning the scripts."
  },
  {
    key: "buddhist",
    name: "Buddhist Civilizations",
    hkdUri: "hkd://lipi/civilization/buddhist",
    status: "association_only",
    civilizations: ["Buddhist Civilizations"],
    religions: ["Buddhist"],
    languages: ["Pali", "Sanskrit", "Tibetan", "Sinhala", "Burmese", "Thai", "Khmer"],
    scripts: ["Brahmi", "Siddham", "Tibetan", "Sinhala", "Burmese", "Thai", "Khmer"],
    texts: ["Tripitaka", "Mahayana Sutras", "Tantric Texts"],
    inscriptions: [],
    symbols: [],
    phkdNote: "Association graph only. Script use varies by region, language, manuscript, and inscription context."
  },
  {
    key: "jain",
    name: "Jain Traditions",
    hkdUri: "hkd://lipi/civilization/jain",
    status: "association_only",
    civilizations: ["Jain Traditions"],
    religions: ["Jain"],
    languages: ["Prakrit", "Sanskrit"],
    scripts: ["Brahmi", "Nagari", "Jain Nagari", "Sharada"],
    texts: ["Agamas", "Commentaries"],
    inscriptions: [],
    symbols: [],
    phkdNote: "Jain textual and inscriptional transmission is associated with multiple scripts; ownership claims remain closed."
  },
  {
    key: "hebrew",
    name: "Hebrew Traditions",
    hkdUri: "hkd://lipi/civilization/hebrew",
    status: "association_only",
    civilizations: ["Hebrew Traditions"],
    religions: ["Judaism"],
    languages: ["Hebrew", "Aramaic"],
    scripts: ["Paleo-Hebrew", "Hebrew"],
    texts: ["Tanakh", "Talmud"],
    inscriptions: [],
    symbols: [],
    phkdNote: "Script, language, religion, and literature are associated nodes, not collapsed into a single ownership assertion."
  },
  {
    key: "christian",
    name: "Christian Traditions",
    hkdUri: "hkd://lipi/civilization/christian",
    status: "association_only",
    civilizations: ["Christian Traditions"],
    religions: ["Christian"],
    languages: ["Greek", "Latin", "Coptic", "Syriac", "Armenian", "Georgian"],
    scripts: ["Greek", "Latin", "Coptic", "Syriac", "Armenian", "Georgian"],
    texts: ["Bible", "Patristic Literature"],
    inscriptions: [],
    symbols: [],
    phkdNote: "Christian textual traditions use multiple scripts across languages and regions; no script ownership is inferred."
  },
  {
    key: "islamic",
    name: "Islamic Civilizations",
    hkdUri: "hkd://lipi/civilization/islamic",
    status: "association_only",
    civilizations: ["Islamic Civilizations"],
    religions: ["Islam"],
    languages: ["Arabic", "Persian", "Ottoman Turkish", "Urdu"],
    scripts: ["Arabic", "Persian-Arabic", "Ottoman Turkish", "Urdu"],
    texts: ["Qur'an", "Hadith", "Fiqh"],
    inscriptions: [],
    symbols: [],
    phkdNote: "Arabic-script transmission is associated with languages, regions, and manuscript traditions; ownership claims need evidence."
  },
  {
    key: "chinese",
    name: "Chinese Civilization",
    hkdUri: "hkd://lipi/civilization/chinese",
    status: "verified_catalog",
    civilizations: ["Chinese Civilization"],
    religions: ["Confucian", "Daoist", "Buddhist"],
    languages: ["Chinese"],
    scripts: ["Oracle Bone", "Seal Script", "Clerical Script", "Regular Script", "Hanzi"],
    texts: ["Confucian Classics", "Daoist Texts", "Buddhist Canon"],
    inscriptions: [],
    symbols: [],
    phkdNote: "Scripts are modeled across historical writing systems, texts, and inscriptions rather than single-religion ownership."
  },
  {
    key: "japanese",
    name: "Japanese Civilization",
    hkdUri: "hkd://lipi/civilization/japanese",
    status: "association_only",
    civilizations: ["Japanese Civilization"],
    religions: ["Shinto", "Buddhist"],
    languages: ["Japanese"],
    scripts: ["Kanji", "Hiragana", "Katakana"],
    texts: [],
    inscriptions: [],
    symbols: [],
    phkdNote: "Script associations are language/culture/text-context links, not ownership claims."
  },
  {
    key: "korean",
    name: "Korean Civilization",
    hkdUri: "hkd://lipi/civilization/korean",
    status: "verified_catalog",
    civilizations: ["Korean Civilization"],
    religions: [],
    languages: ["Korean"],
    scripts: ["Hanja", "Hangul"],
    texts: [],
    inscriptions: [],
    symbols: [],
    phkdNote: "Catalog association only."
  },
  {
    key: "greco-roman",
    name: "Greco-Roman Civilization",
    hkdUri: "hkd://lipi/civilization/greco-roman",
    status: "verified_catalog",
    civilizations: ["Greek", "Roman"],
    religions: [],
    languages: ["Greek", "Latin"],
    scripts: ["Greek", "Latin"],
    texts: ["Philosophy", "Science", "Law", "History"],
    inscriptions: [],
    symbols: [],
    phkdNote: "Catalog association across language, literature, law, science, and inscriptions."
  }
];

export const lipiExplorerPages: LipiExplorerPage[] = [
  { key: "civilization", name: "Civilization Explorer", path: "/lipi/civilization", description: "Browse civilization-script associations and HKD URIs." },
  { key: "religion", name: "Religion Explorer", path: "/lipi/religion", description: "Inspect religion associations without script ownership claims." },
  { key: "language", name: "Language Explorer", path: "/lipi/language", description: "Trace languages associated with scripts and texts." },
  { key: "script", name: "Script Explorer", path: "/lipi/script", description: "Browse script associations across civilizations." },
  { key: "glyph-atlas", name: "Glyph Atlas", path: "/lipi/glyph-atlas", description: "Glyph nodes and sample mappings for future evidence imports." },
  { key: "ipa", name: "IPA Explorer", path: "/lipi/ipa", description: "IPA and sound mappings for verified glyph examples." },
  { key: "timeline", name: "Timeline Explorer", path: "/lipi/timeline", description: "Chronology-oriented script/civilization review." },
  { key: "manuscript", name: "Manuscript Explorer", path: "/lipi/manuscript", description: "Manuscript and literature association surface." },
  { key: "inscription", name: "Inscription Explorer", path: "/lipi/inscription", description: "Inscription and sign corpus association surface." },
  { key: "evidence", name: "Evidence Center", path: "/lipi/evidence", description: "PHKD evidence, decipherment status, and fail-closed notes." },
  { key: "knowledge-graph", name: "Knowledge Graph", path: "/lipi/knowledge-graph", description: "Civilization-religion-language-script-literature graph." }
];

export function getLipiExplorerPage(key: string) {
  return lipiExplorerPages.find((page) => page.key === key);
}

export function getLipiMatrixByExplorer(key: string) {
  if (key === "evidence") {
    return lipiCivilizationMatrix.filter((entry) => entry.status === "undeciphered" || entry.phkdNote.toLowerCase().includes("closed"));
  }
  if (key === "inscription") {
    return lipiCivilizationMatrix.filter((entry) => entry.inscriptions.length > 0 || entry.symbols.length > 0);
  }
  if (key === "manuscript") {
    return lipiCivilizationMatrix.filter((entry) => entry.texts.length > 0);
  }
  return lipiCivilizationMatrix;
}
