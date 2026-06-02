-- Sanskrit dictionary persistence.
-- Lexical records preserve source provenance and stay UNVERIFIED until a curator verifies the dictionary citation.
PRAGMA foreign_keys=OFF;

CREATE TABLE "SanskritLexeme" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "nodeId" TEXT,
  "headword" TEXT NOT NULL,
  "transliteration" TEXT,
  "normalizedHeadword" TEXT NOT NULL,
  "sourceDictionary" TEXT NOT NULL,
  "definition" TEXT,
  "partOfSpeech" TEXT,
  "languageId" TEXT,
  "provenanceNote" TEXT,
  "sourceCitation" TEXT,
  "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "SanskritLexeme_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "SanskritLexeme_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "SanskritLexeme_nodeId_key" ON "SanskritLexeme"("nodeId");
CREATE UNIQUE INDEX "SanskritLexeme_normalizedHeadword_sourceDictionary_key" ON "SanskritLexeme"("normalizedHeadword","sourceDictionary");
CREATE INDEX "SanskritLexeme_headword_idx" ON "SanskritLexeme"("headword");
CREATE INDEX "SanskritLexeme_transliteration_idx" ON "SanskritLexeme"("transliteration");
CREATE INDEX "SanskritLexeme_sourceDictionary_idx" ON "SanskritLexeme"("sourceDictionary");
CREATE INDEX "SanskritLexeme_languageId_idx" ON "SanskritLexeme"("languageId");
CREATE INDEX "SanskritLexeme_verificationStatus_idx" ON "SanskritLexeme"("verificationStatus");

PRAGMA foreign_keys=ON;
