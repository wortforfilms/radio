import { lipiCivilizationMatrix } from "./lipi-civilization-matrix";
import { worldReligiousTexts, worldScriptEntries } from "./world-religious-atlas";

export type UniversalDictionaryCategory = "lexeme" | "script" | "text" | "civilization" | "lipi";

export type UniversalDictionaryEntry = {
  id: string;
  term: string;
  category: UniversalDictionaryCategory;
  language: string | null;
  location: string | null;
  tradition: string | null;
  definition: string;
  sourceCitation: string | null;
  verificationStatus: "UNKNOWN" | "UNVERIFIED" | "VERIFIED" | "DISPUTED" | "REJECTED";
  phkdNote: string;
  sample?: string | null;
  transliteration?: string | null;
};

export const universalDictionaryPhkdNote =
  "Universal dictionary records are catalog associations, glosses, and provenance pointers. Etymology, authorship, decipherment, and ownership claims fail closed without cited verification.";

export function getUniversalDictionaryStaticEntries(): UniversalDictionaryEntry[] {
  const textEntries: UniversalDictionaryEntry[] = worldReligiousTexts.map((text) => ({
    id: `text:${text.title.toLowerCase().replaceAll(" ", "-")}`,
    term: text.title,
    category: "text",
    language: text.language,
    location: text.location,
    tradition: text.tradition,
    definition: text.summary,
    sourceCitation: text.sourceCitation,
    verificationStatus: "UNVERIFIED",
    phkdNote: "Catalog-level world text reference. Do not infer authorship, edition, translation, or doctrinal claims from this record."
  }));

  const scriptEntries: UniversalDictionaryEntry[] = worldScriptEntries.map((script) => ({
    id: `script:${script.name.toLowerCase().replaceAll(" ", "-")}`,
    term: script.name,
    category: "script",
    language: null,
    location: script.location,
    tradition: null,
    definition: script.summary,
    sourceCitation: script.sourceCitation,
    verificationStatus: "UNVERIFIED",
    phkdNote: "Script reference node with Unicode source provenance. Association is not ownership.",
    sample: script.sample,
    transliteration: script.hindiTransliteration
  }));

  const lipiEntries: UniversalDictionaryEntry[] = lipiCivilizationMatrix.map((entry) => ({
    id: `lipi:${entry.key}`,
    term: entry.name,
    category: "lipi",
    language: entry.languages.join(", ") || null,
    location: null,
    tradition: entry.religions.join(", ") || null,
    definition: `${entry.hkdUri}. Scripts: ${entry.scripts.join(", ") || "NULL"}. Texts: ${entry.texts.join(", ") || "NULL"}.`,
    sourceCitation: null,
    verificationStatus: entry.status === "undeciphered" ? "UNKNOWN" : "UNVERIFIED",
    phkdNote: entry.phkdNote
  }));

  return [...textEntries, ...scriptEntries, ...lipiEntries];
}

export function filterUniversalDictionaryEntries(entries: UniversalDictionaryEntry[], query?: string) {
  const normalized = query?.trim().toLowerCase();
  if (!normalized) {
    return entries;
  }
  return entries.filter((entry) =>
    [
      entry.term,
      entry.category,
      entry.language,
      entry.location,
      entry.tradition,
      entry.definition,
      entry.sample,
      entry.transliteration,
      entry.phkdNote
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(normalized)
  );
}
