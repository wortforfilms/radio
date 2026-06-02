import { PrismaClient } from "@prisma/client";
import { iso15924Scripts, iso15924SourceCitation, requestedScriptCapacity } from "@shared/iso15924-scripts";
import { referenceCorpus, type ReferenceCorpusItem } from "@shared/reference-corpus";
import { sanskritDictionarySeed } from "@shared/sanskrit-dictionary";
import { worldReligiousTexts, worldScriptEntries } from "@shared/world-religious-atlas";
import {
  civilizationTaxonomy,
  knowledgeDomains,
  relationshipTaxonomy,
  rishikaSeedNames,
  saptarishiSeedNames,
  seedProvenanceNote,
  subjectTaxonomy
} from "@shared/taxonomy";

process.env.DATABASE_URL ??= "file:./dev.db";

const prisma = new PrismaClient();

async function node(type: string, label: string) {
  return prisma.knowledgeNode.upsert({
    where: { id: `${type}:${label}` },
    update: {},
    create: {
      id: `${type}:${label}`,
      type,
      label,
      provenanceNote: seedProvenanceNote,
      verificationStatus: "UNVERIFIED"
    }
  });
}

function subjectSlugForReference(item: ReferenceCorpusItem) {
  if (["Veda", "Samhita", "Brahmana", "Aranyaka", "Upanishad", "Vedanga"].includes(item.category)) {
    return "veda";
  }

  if (item.category === "Itihasa") {
    return "itihasa";
  }

  if (item.category === "Purana") {
    return "purana";
  }

  return "textual-studies";
}

async function locationNode(name: string, sourceCitation: string) {
  const createdNode = await prisma.knowledgeNode.upsert({
    where: { id: `LOCATION:${name}` },
    update: {
      sourceCitation,
      provenanceNote: "World religious atlas location label. Broad location association only; not an origin claim.",
      verificationStatus: "UNVERIFIED"
    },
    create: {
      id: `LOCATION:${name}`,
      type: "LOCATION",
      label: name,
      sourceCitation,
      provenanceNote: "World religious atlas location label. Broad location association only; not an origin claim.",
      verificationStatus: "UNVERIFIED"
    }
  });

  await prisma.location.upsert({
    where: { nodeId: createdNode.id },
    update: {
      name,
      sourceCitation,
      provenanceNote: "World religious atlas location label. Broad location association only; not an origin claim.",
      verificationStatus: "UNVERIFIED"
    },
    create: {
      name,
      nodeId: createdNode.id,
      sourceCitation,
      provenanceNote: "World religious atlas location label. Broad location association only; not an origin claim.",
      verificationStatus: "UNVERIFIED"
    }
  });

  return createdNode;
}

async function main() {
  for (const [key, label, inverseKey] of relationshipTaxonomy) {
    await prisma.relationship.upsert({
      where: { key },
      update: {},
      create: {
        key,
        label,
        inverseKey,
        description: "Relationship taxonomy entry. Edges using this relationship fail closed unless verified with provenance.",
        requiresCitation: true,
        failClosed: true
      }
    });
  }

  const civilizationIds = new Map<string, string>();
  for (const [name, parentName] of civilizationTaxonomy) {
    const createdNode = await node("CIVILIZATION", name);
    const parentId = parentName ? civilizationIds.get(parentName) ?? null : null;
    const civilization = await prisma.civilization.upsert({
      where: { name },
      update: {},
      create: {
        name,
        nodeId: createdNode.id,
        parentId,
        provenanceNote: seedProvenanceNote,
        verificationStatus: "UNVERIFIED"
      }
    });
    civilizationIds.set(name, civilization.id);
  }

  for (const domain of knowledgeDomains) {
    const slug = domain.toLowerCase().replaceAll(" ", "-");
    const createdNode = await node("SUBJECT", domain);
    await prisma.subject.upsert({
      where: { slug },
      update: {},
      create: {
        name: domain,
        slug,
        nodeId: createdNode.id,
        provenanceNote: seedProvenanceNote,
        verificationStatus: "UNVERIFIED"
      }
    });
  }

  const subjectIds = new Map<string, string>();
  for (const [name, parentName] of subjectTaxonomy) {
    const slug = name.toLowerCase().replaceAll(" ", "-");
    const createdNode = await node("SUBJECT", name);
    const subject = await prisma.subject.upsert({
      where: { slug },
      update: {},
      create: {
        name,
        slug,
        nodeId: createdNode.id,
        parentId: parentName ? subjectIds.get(parentName) ?? null : null,
        provenanceNote: seedProvenanceNote,
        verificationStatus: "UNVERIFIED"
      }
    });
    subjectIds.set(name, subject.id);
  }

  for (const name of saptarishiSeedNames) {
    const createdNode = await node("RISHI", name);
    await prisma.rishi.upsert({
      where: { nodeId: createdNode.id },
      update: {},
      create: {
        name,
        nodeId: createdNode.id,
        provenanceNote: seedProvenanceNote,
        verificationStatus: "UNVERIFIED"
      }
    });
  }

  for (const name of rishikaSeedNames) {
    const createdNode = await node("RISHIKA", name);
    await prisma.rishika.upsert({
      where: { nodeId: createdNode.id },
      update: {},
      create: {
        name,
        nodeId: createdNode.id,
        provenanceNote: seedProvenanceNote,
        verificationStatus: "UNVERIFIED"
      }
    });
  }

  const sanskritNode = await node("LANGUAGE", "Sanskrit");
  const sanskrit = await prisma.language.upsert({
    where: { name: "Sanskrit" },
    update: {
      nodeId: sanskritNode.id,
      isoCode: "sa",
      script: "Devanagari",
      provenanceNote: seedProvenanceNote,
      verificationStatus: "UNVERIFIED"
    },
    create: {
      name: "Sanskrit",
      nodeId: sanskritNode.id,
      isoCode: "sa",
      script: "Devanagari",
      provenanceNote: seedProvenanceNote,
      verificationStatus: "UNVERIFIED"
    }
  });

  for (const item of referenceCorpus) {
    const textNode = await prisma.knowledgeNode.upsert({
      where: { id: `TEXT:${item.title}` },
      update: {
        summary: item.summary,
        sourceCitation: item.sourceCitation,
        provenanceNote: "Reference corpus seed. Citation is a catalog/source URL only; no verse-level claim or lineage claim is imported.",
        verificationStatus: "UNVERIFIED"
      },
      create: {
        id: `TEXT:${item.title}`,
        type: "TEXT",
        label: item.title,
        summary: item.summary,
        sourceCitation: item.sourceCitation,
        provenanceNote: "Reference corpus seed. Citation is a catalog/source URL only; no verse-level claim or lineage claim is imported.",
        verificationStatus: "UNVERIFIED"
      }
    });
    const subject = await prisma.subject.findUnique({ where: { slug: subjectSlugForReference(item) } });

    await prisma.text.upsert({
      where: { nodeId: textNode.id },
      update: {
        title: item.title,
        languageId: sanskrit.id,
        subjectId: subject?.id ?? null,
        summary: item.summary,
        contentMarkdown: `Category: ${item.category}\n\nReference feed entry. This record stores catalog/source provenance only and imports no verse text, translation text, authorship claim, or lineage claim.`,
        provenanceNote: "Reference corpus seed. Citation is a catalog/source URL only; no verse-level claim or lineage claim is imported.",
        sourceCitation: item.sourceCitation,
        verificationStatus: "UNVERIFIED"
      },
      create: {
        title: item.title,
        nodeId: textNode.id,
        languageId: sanskrit.id,
        subjectId: subject?.id ?? null,
        summary: item.summary,
        contentMarkdown: `Category: ${item.category}\n\nReference feed entry. This record stores catalog/source provenance only and imports no verse text, translation text, authorship claim, or lineage claim.`,
        provenanceNote: "Reference corpus seed. Citation is a catalog/source URL only; no verse-level claim or lineage claim is imported.",
        sourceCitation: item.sourceCitation,
        verificationStatus: "UNVERIFIED"
      }
    });
  }

  for (const entry of sanskritDictionarySeed) {
    const lexemeNode = await prisma.knowledgeNode.upsert({
      where: { id: `SANSKRIT_LEXEME:${entry.normalizedHeadword}` },
      update: {
        label: `${entry.headword} (${entry.transliteration})`,
        summary: entry.definition,
        sourceCitation: entry.sourceCitation,
        provenanceNote: "Sanskrit dictionary seed. Definitions are concise dictionary glosses with source-family provenance; use citation review before promoting to VERIFIED.",
        verificationStatus: "UNVERIFIED"
      },
      create: {
        id: `SANSKRIT_LEXEME:${entry.normalizedHeadword}`,
        type: "SANSKRIT_LEXEME",
        label: `${entry.headword} (${entry.transliteration})`,
        summary: entry.definition,
        sourceCitation: entry.sourceCitation,
        provenanceNote: "Sanskrit dictionary seed. Definitions are concise dictionary glosses with source-family provenance; use citation review before promoting to VERIFIED.",
        verificationStatus: "UNVERIFIED"
      }
    });

    await prisma.sanskritLexeme.upsert({
      where: {
        normalizedHeadword_sourceDictionary: {
          normalizedHeadword: entry.normalizedHeadword,
          sourceDictionary: entry.sourceDictionary
        }
      },
      update: {
        nodeId: lexemeNode.id,
        headword: entry.headword,
        transliteration: entry.transliteration,
        definition: entry.definition,
        partOfSpeech: entry.partOfSpeech,
        languageId: sanskrit.id,
        provenanceNote: "Sanskrit dictionary seed. Definitions are concise dictionary glosses with source-family provenance; use citation review before promoting to VERIFIED.",
        sourceCitation: entry.sourceCitation,
        verificationStatus: "UNVERIFIED"
      },
      create: {
        nodeId: lexemeNode.id,
        headword: entry.headword,
        transliteration: entry.transliteration,
        normalizedHeadword: entry.normalizedHeadword,
        sourceDictionary: entry.sourceDictionary,
        definition: entry.definition,
        partOfSpeech: entry.partOfSpeech,
        languageId: sanskrit.id,
        provenanceNote: "Sanskrit dictionary seed. Definitions are concise dictionary glosses with source-family provenance; use citation review before promoting to VERIFIED.",
        sourceCitation: entry.sourceCitation,
        verificationStatus: "UNVERIFIED"
      }
    });
  }

  const textualStudies = await prisma.subject.findUnique({ where: { slug: "textual-studies" } });
  for (const entry of worldReligiousTexts) {
    const textNode = await prisma.knowledgeNode.upsert({
      where: { id: `WORLD_TEXT:${entry.title}` },
      update: {
        type: "TEXT",
        label: entry.title,
        summary: entry.summary,
        sourceCitation: entry.sourceCitation,
        provenanceNote: "World religious atlas seed. Location edge is a broad association only, not a claim of authorship, origin, ownership, or exclusive tradition.",
        verificationStatus: "UNVERIFIED"
      },
      create: {
        id: `WORLD_TEXT:${entry.title}`,
        type: "TEXT",
        label: entry.title,
        summary: entry.summary,
        sourceCitation: entry.sourceCitation,
        provenanceNote: "World religious atlas seed. Location edge is a broad association only, not a claim of authorship, origin, ownership, or exclusive tradition.",
        verificationStatus: "UNVERIFIED"
      }
    });
    const location = await locationNode(entry.location, entry.sourceCitation);
    const language = entry.language
      ? await prisma.language.upsert({
          where: { name: entry.language },
          update: {},
          create: {
            name: entry.language,
            provenanceNote: "World religious atlas language label. Verification requires citation review.",
            verificationStatus: "UNVERIFIED"
          }
        })
      : null;

    await prisma.text.upsert({
      where: { nodeId: textNode.id },
      update: {
        title: entry.title,
        languageId: language?.id ?? null,
        subjectId: textualStudies?.id ?? null,
        summary: entry.summary,
        contentMarkdown: `Tradition: ${entry.tradition}\nLocation: ${entry.location}\n\nWorld religious atlas entry. Broad location association only; no authorship, origin, ownership, or exclusive lineage claim imported.`,
        provenanceNote: "World religious atlas seed. Broad location association only; no authorship, origin, ownership, or exclusive lineage claim imported.",
        sourceCitation: entry.sourceCitation,
        verificationStatus: "UNVERIFIED"
      },
      create: {
        title: entry.title,
        nodeId: textNode.id,
        languageId: language?.id ?? null,
        subjectId: textualStudies?.id ?? null,
        summary: entry.summary,
        contentMarkdown: `Tradition: ${entry.tradition}\nLocation: ${entry.location}\n\nWorld religious atlas entry. Broad location association only; no authorship, origin, ownership, or exclusive lineage claim imported.`,
        provenanceNote: "World religious atlas seed. Broad location association only; no authorship, origin, ownership, or exclusive lineage claim imported.",
        sourceCitation: entry.sourceCitation,
        verificationStatus: "UNVERIFIED"
      }
    });

    await prisma.knowledgeEdge.upsert({
      where: {
        type_fromNodeId_toNodeId: {
          type: "belongs_to",
          fromNodeId: textNode.id,
          toNodeId: location.id
        }
      },
      update: {
        label: "broad location association",
        sourceCitation: entry.sourceCitation,
        provenanceNote: "World religious atlas seed. Broad association only; not an origin, authorship, ownership, or exclusive lineage claim.",
        verificationStatus: "UNVERIFIED"
      },
      create: {
        type: "belongs_to",
        fromNodeId: textNode.id,
        toNodeId: location.id,
        label: "broad location association",
        sourceCitation: entry.sourceCitation,
        provenanceNote: "World religious atlas seed. Broad association only; not an origin, authorship, ownership, or exclusive lineage claim.",
        verificationStatus: "UNVERIFIED"
      }
    });
  }

  for (const entry of worldScriptEntries) {
    const scriptPayload = JSON.stringify({
      location: entry.location,
      sample: entry.sample,
      hindiTransliteration: entry.hindiTransliteration,
      sanskritTranslation: entry.sanskritTranslation,
      fontStack: entry.fontStack,
      styleName: entry.styleName,
      direction: entry.direction
    });
    const scriptNode = await prisma.knowledgeNode.upsert({
      where: { id: `SCRIPT:${entry.name}` },
      update: {
        type: "SCRIPT",
        label: entry.name,
        summary: entry.summary,
        payload: scriptPayload,
        sourceCitation: entry.sourceCitation,
        provenanceNote: "World religious atlas script node. Broad script/location association only; not an origin or ownership claim.",
        verificationStatus: "UNVERIFIED"
      },
      create: {
        id: `SCRIPT:${entry.name}`,
        type: "SCRIPT",
        label: entry.name,
        summary: entry.summary,
        payload: scriptPayload,
        sourceCitation: entry.sourceCitation,
        provenanceNote: "World religious atlas script node. Broad script/location association only; not an origin or ownership claim.",
        verificationStatus: "UNVERIFIED"
      }
    });
    const location = await locationNode(entry.location, entry.sourceCitation);
    await prisma.knowledgeEdge.upsert({
      where: {
        type_fromNodeId_toNodeId: {
          type: "belongs_to",
          fromNodeId: scriptNode.id,
          toNodeId: location.id
        }
      },
      update: {
        label: "broad script location association",
        sourceCitation: entry.sourceCitation,
        provenanceNote: "World religious atlas seed. Broad script/location association only; not an origin or ownership claim.",
        verificationStatus: "UNVERIFIED"
      },
      create: {
        type: "belongs_to",
        fromNodeId: scriptNode.id,
        toNodeId: location.id,
        label: "broad script location association",
        sourceCitation: entry.sourceCitation,
        provenanceNote: "World religious atlas seed. Broad script/location association only; not an origin or ownership claim.",
        verificationStatus: "UNVERIFIED"
      }
    });
  }

  for (const script of iso15924Scripts) {
    const payload = JSON.stringify({
      code: script.code,
      numeric: script.numeric,
      pva: script.pva,
      unicodeVersion: script.unicodeVersion,
      date: script.date,
      requestedCapacity: requestedScriptCapacity,
      location: null,
      origin: null,
      lineage: null
    });

    await prisma.knowledgeNode.upsert({
      where: { id: `SCRIPT:ISO15924:${script.code}` },
      update: {
        type: "SCRIPT",
        label: script.name,
        summary: `ISO 15924 script code ${script.code}. Code registration metadata only; no origin, ownership, location, or lineage claim imported.`,
        payload,
        sourceCitation: iso15924SourceCitation,
        provenanceNote: "ISO 15924 script registry seed. Only code/name metadata is sourced; historical, geographic, authorship, and lineage claims remain null.",
        verificationStatus: "VERIFIED"
      },
      create: {
        id: `SCRIPT:ISO15924:${script.code}`,
        type: "SCRIPT",
        label: script.name,
        summary: `ISO 15924 script code ${script.code}. Code registration metadata only; no origin, ownership, location, or lineage claim imported.`,
        payload,
        sourceCitation: iso15924SourceCitation,
        provenanceNote: "ISO 15924 script registry seed. Only code/name metadata is sourced; historical, geographic, authorship, and lineage claims remain null.",
        verificationStatus: "VERIFIED"
      }
    });
  }

  await prisma.auditLog.create({
    data: {
      action: "created",
      entityType: "SeedDataset",
      entityId: "initial-taxonomies",
      reason: "Initial PHKD-safe taxonomy seed. No lineage claims were verified or cited."
    }
  });

  await prisma.auditLog.create({
    data: {
      action: "created",
      entityType: "ReferenceCorpus",
      entityId: "vedic-and-related-text-reference-feed",
      reason: `Seeded ${referenceCorpus.length} catalog-level text reference records with source citations. No verse-level claims, authorship claims, or lineage claims were verified.`,
      citation: "https://vedicheritage.gov.in/samhitas/; https://www.sacred-texts.com/hin/"
    }
  });

  await prisma.auditLog.create({
    data: {
      action: "created",
      entityType: "SanskritDictionary",
      entityId: "starter-sanskrit-lexeme-feed",
      reason: `Seeded ${sanskritDictionarySeed.length} Sanskrit dictionary entries as UNVERIFIED lexeme records with dictionary source provenance.`,
      citation: "https://www.sanskrit-lexicon.uni-koeln.de/"
    }
  });

  await prisma.auditLog.create({
    data: {
      action: "created",
      entityType: "WorldReligiousAtlas",
      entityId: "texts-scripts-locations",
      reason: `Seeded ${worldReligiousTexts.length} world religious text records, ${worldScriptEntries.length} script nodes with broad location associations, and ${iso15924Scripts.length}/${requestedScriptCapacity} sourced ISO 15924 script registry entries. No origin, authorship, ownership, or lineage claims were verified.`,
      citation: "https://www.britannica.com/; https://www.unicode.org/charts/; https://unicode.org/iso15924/iso15924.txt"
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    process.exit(1);
  });
