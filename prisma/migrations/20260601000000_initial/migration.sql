-- Initial SQLite migration for the Vaishviq Knowledge Runtime.
-- Generated from prisma/schema.prisma; keep claims nullable and unverified unless cited.
PRAGMA foreign_keys=OFF;

CREATE TABLE "KnowledgeNode" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "type" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "summary" TEXT,
  "payload" TEXT,
  "provenanceNote" TEXT,
  "sourceCitation" TEXT,
  "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "KnowledgeEdge" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "type" TEXT NOT NULL,
  "fromNodeId" TEXT NOT NULL,
  "toNodeId" TEXT NOT NULL,
  "label" TEXT,
  "confidence" REAL,
  "provenanceNote" TEXT,
  "sourceCitation" TEXT,
  "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
  "createdById" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "KnowledgeEdge_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "KnowledgeEdge_toNodeId_fkey" FOREIGN KEY ("toNodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "KnowledgeEdge_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Pitra" ("id" TEXT NOT NULL PRIMARY KEY, "nodeId" TEXT, "name" TEXT NOT NULL, "alternateNames" TEXT, "description" TEXT, "provenanceNote" TEXT, "sourceCitation" TEXT, "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "Pitra_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE);
CREATE TABLE "GuruMaataa" ("id" TEXT NOT NULL PRIMARY KEY, "nodeId" TEXT, "name" TEXT NOT NULL, "alternateNames" TEXT, "description" TEXT, "provenanceNote" TEXT, "sourceCitation" TEXT, "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "GuruMaataa_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE);
CREATE TABLE "Rishi" ("id" TEXT NOT NULL PRIMARY KEY, "nodeId" TEXT, "name" TEXT NOT NULL, "alternateNames" TEXT, "gotra" TEXT, "periodLabel" TEXT, "description" TEXT, "provenanceNote" TEXT, "sourceCitation" TEXT, "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "Rishi_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE);
CREATE TABLE "Rishika" ("id" TEXT NOT NULL PRIMARY KEY, "nodeId" TEXT, "name" TEXT NOT NULL, "alternateNames" TEXT, "periodLabel" TEXT, "description" TEXT, "provenanceNote" TEXT, "sourceCitation" TEXT, "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "Rishika_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE);
CREATE TABLE "Civilization" ("id" TEXT NOT NULL PRIMARY KEY, "nodeId" TEXT, "name" TEXT NOT NULL, "parentId" TEXT, "description" TEXT, "provenanceNote" TEXT, "sourceCitation" TEXT, "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "Civilization_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "Civilization_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Civilization" ("id") ON DELETE SET NULL ON UPDATE CASCADE);
CREATE TABLE "Subject" ("id" TEXT NOT NULL PRIMARY KEY, "nodeId" TEXT, "name" TEXT NOT NULL, "slug" TEXT NOT NULL, "parentId" TEXT, "civilizationId" TEXT, "description" TEXT, "provenanceNote" TEXT, "sourceCitation" TEXT, "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "Subject_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "Subject_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Subject" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "Subject_civilizationId_fkey" FOREIGN KEY ("civilizationId") REFERENCES "Civilization" ("id") ON DELETE SET NULL ON UPDATE CASCADE);
CREATE TABLE "Language" ("id" TEXT NOT NULL PRIMARY KEY, "nodeId" TEXT, "name" TEXT NOT NULL, "isoCode" TEXT, "script" TEXT, "provenanceNote" TEXT, "sourceCitation" TEXT, "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "Language_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE);
CREATE TABLE "Text" ("id" TEXT NOT NULL PRIMARY KEY, "nodeId" TEXT, "title" TEXT NOT NULL, "alternateTitles" TEXT, "languageId" TEXT, "subjectId" TEXT, "civilizationId" TEXT, "periodLabel" TEXT, "summary" TEXT, "contentMarkdown" TEXT, "provenanceNote" TEXT, "sourceCitation" TEXT, "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "Text_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "Text_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "Text_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "Text_civilizationId_fkey" FOREIGN KEY ("civilizationId") REFERENCES "Civilization" ("id") ON DELETE SET NULL ON UPDATE CASCADE);
CREATE TABLE "Location" ("id" TEXT NOT NULL PRIMARY KEY, "nodeId" TEXT, "name" TEXT NOT NULL, "latitude" REAL, "longitude" REAL, "parentId" TEXT, "provenanceNote" TEXT, "sourceCitation" TEXT, "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "Location_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "Location_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE);
CREATE TABLE "Institution" ("id" TEXT NOT NULL PRIMARY KEY, "nodeId" TEXT, "name" TEXT NOT NULL, "locationId" TEXT, "description" TEXT, "provenanceNote" TEXT, "sourceCitation" TEXT, "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "Institution_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "Institution_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE);
CREATE TABLE "TimelineEvent" ("id" TEXT NOT NULL PRIMARY KEY, "nodeId" TEXT, "title" TEXT NOT NULL, "startDate" DATETIME, "endDate" DATETIME, "periodLabel" TEXT, "locationId" TEXT, "description" TEXT, "provenanceNote" TEXT, "sourceCitation" TEXT, "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "TimelineEvent_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "TimelineEvent_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE);
CREATE TABLE "Discovery" ("id" TEXT NOT NULL PRIMARY KEY, "nodeId" TEXT, "name" TEXT NOT NULL, "subjectId" TEXT, "description" TEXT, "provenanceNote" TEXT, "sourceCitation" TEXT, "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "Discovery_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE);
CREATE TABLE "Innovation" ("id" TEXT NOT NULL PRIMARY KEY, "nodeId" TEXT, "name" TEXT NOT NULL, "subjectId" TEXT, "description" TEXT, "provenanceNote" TEXT, "sourceCitation" TEXT, "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "Innovation_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE);
CREATE TABLE "MediaAsset" ("id" TEXT NOT NULL PRIMARY KEY, "nodeId" TEXT, "title" TEXT NOT NULL, "uri" TEXT, "mediaType" TEXT, "checksum" TEXT, "provenanceNote" TEXT, "sourceCitation" TEXT, "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "MediaAsset_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE);
CREATE TABLE "ResearchPaper" ("id" TEXT NOT NULL PRIMARY KEY, "nodeId" TEXT, "title" TEXT NOT NULL, "abstract" TEXT, "doi" TEXT, "url" TEXT, "subjectId" TEXT, "institutionId" TEXT, "provenanceNote" TEXT, "sourceCitation" TEXT, "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "ResearchPaper_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "ResearchPaper_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "ResearchPaper_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE SET NULL ON UPDATE CASCADE);
CREATE TABLE "Course" ("id" TEXT NOT NULL PRIMARY KEY, "nodeId" TEXT, "title" TEXT NOT NULL, "subjectId" TEXT, "institutionId" TEXT, "syllabusMarkdown" TEXT, "provenanceNote" TEXT, "sourceCitation" TEXT, "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "Course_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "Course_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "Course_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE SET NULL ON UPDATE CASCADE);
CREATE TABLE "Lineage" ("id" TEXT NOT NULL PRIMARY KEY, "nodeId" TEXT, "name" TEXT NOT NULL, "rootNodeId" TEXT, "description" TEXT, "provenanceNote" TEXT, "sourceCitation" TEXT, "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "Lineage_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "KnowledgeNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE);
CREATE TABLE "Relationship" ("id" TEXT NOT NULL PRIMARY KEY, "key" TEXT NOT NULL, "label" TEXT NOT NULL, "inverseKey" TEXT, "description" TEXT, "requiresCitation" BOOLEAN NOT NULL DEFAULT true, "failClosed" BOOLEAN NOT NULL DEFAULT true, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL);
CREATE TABLE "User" ("id" TEXT NOT NULL PRIMARY KEY, "email" TEXT, "name" TEXT, "role" TEXT NOT NULL DEFAULT 'curator', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL);
CREATE TABLE "AuditLog" ("id" TEXT NOT NULL PRIMARY KEY, "action" TEXT NOT NULL, "entityType" TEXT NOT NULL, "entityId" TEXT NOT NULL, "userId" TEXT, "before" TEXT, "after" TEXT, "reason" TEXT, "citation" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE);

CREATE UNIQUE INDEX "KnowledgeEdge_type_fromNodeId_toNodeId_key" ON "KnowledgeEdge"("type","fromNodeId","toNodeId");
CREATE INDEX "KnowledgeNode_type_idx" ON "KnowledgeNode"("type");
CREATE INDEX "KnowledgeNode_label_idx" ON "KnowledgeNode"("label");
CREATE INDEX "KnowledgeEdge_type_idx" ON "KnowledgeEdge"("type");
CREATE INDEX "KnowledgeEdge_fromNodeId_idx" ON "KnowledgeEdge"("fromNodeId");
CREATE INDEX "KnowledgeEdge_toNodeId_idx" ON "KnowledgeEdge"("toNodeId");
CREATE UNIQUE INDEX "Pitra_nodeId_key" ON "Pitra"("nodeId");
CREATE UNIQUE INDEX "GuruMaataa_nodeId_key" ON "GuruMaataa"("nodeId");
CREATE UNIQUE INDEX "Rishi_nodeId_key" ON "Rishi"("nodeId");
CREATE UNIQUE INDEX "Rishika_nodeId_key" ON "Rishika"("nodeId");
CREATE UNIQUE INDEX "Civilization_nodeId_key" ON "Civilization"("nodeId");
CREATE UNIQUE INDEX "Civilization_name_key" ON "Civilization"("name");
CREATE UNIQUE INDEX "Subject_nodeId_key" ON "Subject"("nodeId");
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");
CREATE UNIQUE INDEX "Subject_slug_key" ON "Subject"("slug");
CREATE UNIQUE INDEX "Language_nodeId_key" ON "Language"("nodeId");
CREATE UNIQUE INDEX "Language_name_key" ON "Language"("name");
CREATE UNIQUE INDEX "Language_isoCode_key" ON "Language"("isoCode");
CREATE UNIQUE INDEX "Text_nodeId_key" ON "Text"("nodeId");
CREATE UNIQUE INDEX "Location_nodeId_key" ON "Location"("nodeId");
CREATE UNIQUE INDEX "Institution_nodeId_key" ON "Institution"("nodeId");
CREATE UNIQUE INDEX "TimelineEvent_nodeId_key" ON "TimelineEvent"("nodeId");
CREATE UNIQUE INDEX "Discovery_nodeId_key" ON "Discovery"("nodeId");
CREATE UNIQUE INDEX "Innovation_nodeId_key" ON "Innovation"("nodeId");
CREATE UNIQUE INDEX "MediaAsset_nodeId_key" ON "MediaAsset"("nodeId");
CREATE UNIQUE INDEX "ResearchPaper_nodeId_key" ON "ResearchPaper"("nodeId");
CREATE UNIQUE INDEX "Course_nodeId_key" ON "Course"("nodeId");
CREATE UNIQUE INDEX "Lineage_nodeId_key" ON "Lineage"("nodeId");
CREATE UNIQUE INDEX "Relationship_key_key" ON "Relationship"("key");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType","entityId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

PRAGMA foreign_keys=ON;
