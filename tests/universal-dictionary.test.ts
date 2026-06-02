import { describe, expect, it } from "vitest";
import {
  filterUniversalDictionaryEntries,
  getUniversalDictionaryStaticEntries,
  universalDictionaryPhkdNote
} from "@shared/universal-dictionary";

describe("Universal dictionary", () => {
  it("combines world texts, scripts, and Lipi associations", () => {
    const entries = getUniversalDictionaryStaticEntries();
    expect(entries.some((entry) => entry.category === "text" && entry.term === "Rigveda Samhita")).toBe(true);
    expect(entries.some((entry) => entry.category === "script" && entry.term === "Arabic")).toBe(true);
    expect(entries.some((entry) => entry.category === "lipi" && entry.term === "Indus Civilization")).toBe(true);
  });

  it("keeps dictionary claims fail-closed", () => {
    expect(universalDictionaryPhkdNote).toContain("fail closed");
    const indus = filterUniversalDictionaryEntries(getUniversalDictionaryStaticEntries(), "Indus");
    expect(indus[0]?.phkdNote).toContain("No definitive decipherment");
  });
});
