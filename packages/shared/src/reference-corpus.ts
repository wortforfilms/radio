export type ReferenceCorpusItem = {
  title: string;
  category: "Veda" | "Samhita" | "Brahmana" | "Aranyaka" | "Upanishad" | "Vedanga" | "Itihasa" | "Gita" | "Purana" | "Other";
  language: string;
  sourceCitation: string;
  summary: string;
};

const vedicSamhitasCatalog = "https://vedicheritage.gov.in/samhitas/";
const sacredTextsHinduCatalog = "https://www.sacred-texts.com/hin/";

export const referenceCorpus: ReferenceCorpusItem[] = [
  {
    title: "Rigveda Samhita",
    category: "Veda",
    language: "Sanskrit",
    sourceCitation: "https://vedicheritage.gov.in/samhitas/rigveda/",
    summary: "Reference record for Rigveda Samhita materials cataloged by the Vedic Heritage Portal."
  },
  {
    title: "Samaveda Samhitas",
    category: "Veda",
    language: "Sanskrit",
    sourceCitation: vedicSamhitasCatalog,
    summary: "Reference record for Samaveda Samhita traditions listed in the Vedic Heritage Portal Samhitas catalog."
  },
  {
    title: "Samaveda Kauthuma Samhita",
    category: "Samhita",
    language: "Sanskrit",
    sourceCitation: vedicSamhitasCatalog,
    summary: "Catalog-level reference record for the Kauthuma recension of the Samaveda Samhita."
  },
  {
    title: "Samaveda Jaiminiya Samhita",
    category: "Samhita",
    language: "Sanskrit",
    sourceCitation: vedicSamhitasCatalog,
    summary: "Catalog-level reference record for the Jaiminiya recension of the Samaveda Samhita."
  },
  {
    title: "Samaveda Ranayaniya Samhita",
    category: "Samhita",
    language: "Sanskrit",
    sourceCitation: vedicSamhitasCatalog,
    summary: "Catalog-level reference record for the Ranayaniya recension of the Samaveda Samhita."
  },
  {
    title: "Yajurveda Samhitas",
    category: "Veda",
    language: "Sanskrit",
    sourceCitation: "https://vedicheritage.gov.in/samhitas/yajurveda/",
    summary: "Reference record for Yajurveda Samhita divisions and ritual-text context."
  },
  {
    title: "Vajasaneyi Samhita Madhyandina",
    category: "Samhita",
    language: "Sanskrit",
    sourceCitation: vedicSamhitasCatalog,
    summary: "Catalog-level reference record for the Madhyandina branch listed in Yajurveda Samhita traditions."
  },
  {
    title: "Vajasaneyi Samhita Kanva",
    category: "Samhita",
    language: "Sanskrit",
    sourceCitation: vedicSamhitasCatalog,
    summary: "Catalog-level reference record for the Kanva branch of the Vajasaneyi Samhita."
  },
  {
    title: "Taittiriya Samhita",
    category: "Samhita",
    language: "Sanskrit",
    sourceCitation: vedicSamhitasCatalog,
    summary: "Catalog-level reference record for Taittiriya Samhita listed under Krishna Yajurveda Samhita traditions."
  },
  {
    title: "Atharvaveda Samhitas",
    category: "Veda",
    language: "Sanskrit",
    sourceCitation: "https://vedicheritage.gov.in/samhitas/atharvaveda-samhitas/",
    summary: "Reference record for Atharvaveda Samhita materials and recensions."
  },
  {
    title: "Atharvaveda Shaunaka Samhita",
    category: "Samhita",
    language: "Sanskrit",
    sourceCitation: "https://vedicheritage.gov.in/samhitas/atharvaveda-samhitas/atharvaveda-shaunaka-samhita/",
    summary: "Reference record for Atharvaveda Shaunaka Samhita."
  },
  {
    title: "Aitareya Brahmana",
    category: "Brahmana",
    language: "Sanskrit",
    sourceCitation: vedicSamhitasCatalog,
    summary: "Catalog-level reference record for Aitareya Brahmana listed in Vedic text traditions."
  },
  {
    title: "Kausitaki Shankhayana Brahmana",
    category: "Brahmana",
    language: "Sanskrit",
    sourceCitation: vedicSamhitasCatalog,
    summary: "Catalog-level reference record for Kausitaki or Shankhayana Brahmana listed under Rigveda Brahmana traditions."
  },
  {
    title: "Shatapatha Brahmana",
    category: "Brahmana",
    language: "Sanskrit",
    sourceCitation: sacredTextsHinduCatalog,
    summary: "Reference record for the Satapatha Brahmana translation collection listed by Sacred Texts."
  },
  {
    title: "Taittiriya Brahmana",
    category: "Brahmana",
    language: "Sanskrit",
    sourceCitation: vedicSamhitasCatalog,
    summary: "Catalog-level reference record for Taittiriya Brahmana listed under Krishna Yajurveda Brahmana traditions."
  },
  {
    title: "Gopatha Brahmana",
    category: "Brahmana",
    language: "Sanskrit",
    sourceCitation: vedicSamhitasCatalog,
    summary: "Catalog-level reference record for Gopatha Brahmana linked with Atharvaveda materials."
  },
  {
    title: "Aitareya Aranyaka",
    category: "Aranyaka",
    language: "Sanskrit",
    sourceCitation: "https://www.sacred-texts.com/hin/sbe01/index.htm",
    summary: "Reference record for Aitareya Aranyaka in Sacred Books of the East volume 1."
  },
  {
    title: "Taittiriya Aranyaka",
    category: "Aranyaka",
    language: "Sanskrit",
    sourceCitation: vedicSamhitasCatalog,
    summary: "Catalog-level reference record for Taittiriya Aranyaka listed by Vedic text catalogs."
  },
  {
    title: "Chandogya Upanishad",
    category: "Upanishad",
    language: "Sanskrit",
    sourceCitation: "https://www.sacred-texts.com/hin/sbe01/index.htm",
    summary: "Reference record for the Chandogya Upanishad in Max Muller, Sacred Books of the East volume 1."
  },
  {
    title: "Kena Upanishad",
    category: "Upanishad",
    language: "Sanskrit",
    sourceCitation: "https://www.sacred-texts.com/hin/sbe01/index.htm",
    summary: "Reference record for the Talavakara or Kena Upanishad in Sacred Books of the East volume 1."
  },
  {
    title: "Isha Upanishad",
    category: "Upanishad",
    language: "Sanskrit",
    sourceCitation: "https://www.sacred-texts.com/hin/sbe01/index.htm",
    summary: "Reference record for the Vagasaneyi Samhita Upanishad, also called Isha Upanishad."
  },
  {
    title: "Katha Upanishad",
    category: "Upanishad",
    language: "Sanskrit",
    sourceCitation: "https://www.sacred-texts.com/hin/sbe15/index.htm",
    summary: "Reference record for the Katha Upanishad in Sacred Books of the East volume 15."
  },
  {
    title: "Mundaka Upanishad",
    category: "Upanishad",
    language: "Sanskrit",
    sourceCitation: "https://www.sacred-texts.com/hin/sbe15/index.htm",
    summary: "Reference record for the Mundaka Upanishad in Sacred Books of the East volume 15."
  },
  {
    title: "Taittiriya Upanishad",
    category: "Upanishad",
    language: "Sanskrit",
    sourceCitation: "https://www.sacred-texts.com/hin/sbe15/index.htm",
    summary: "Reference record for the Taittiriya Upanishad in Sacred Books of the East volume 15."
  },
  {
    title: "Brihadaranyaka Upanishad",
    category: "Upanishad",
    language: "Sanskrit",
    sourceCitation: "https://www.sacred-texts.com/hin/sbe15/index.htm",
    summary: "Reference record for the Brihadaranyaka Upanishad in Sacred Books of the East volume 15."
  },
  {
    title: "Shvetashvatara Upanishad",
    category: "Upanishad",
    language: "Sanskrit",
    sourceCitation: "https://www.sacred-texts.com/hin/sbe15/index.htm",
    summary: "Reference record for the Shvetashvatara Upanishad in Sacred Books of the East volume 15."
  },
  {
    title: "Prashna Upanishad",
    category: "Upanishad",
    language: "Sanskrit",
    sourceCitation: "https://www.sacred-texts.com/hin/sbe15/index.htm",
    summary: "Reference record for the Prashna Upanishad in Sacred Books of the East volume 15."
  },
  {
    title: "Maitrayani Brahmana Upanishad",
    category: "Upanishad",
    language: "Sanskrit",
    sourceCitation: "https://www.sacred-texts.com/hin/sbe15/index.htm",
    summary: "Reference record for the Maitrayani Brahmana Upanishad in Sacred Books of the East volume 15."
  },
  {
    title: "Vedanga Shiksha",
    category: "Vedanga",
    language: "Sanskrit",
    sourceCitation: vedicSamhitasCatalog,
    summary: "Catalog-level reference record for Shiksha in Vedanga traditions."
  },
  {
    title: "Vedanga Kalpa",
    category: "Vedanga",
    language: "Sanskrit",
    sourceCitation: vedicSamhitasCatalog,
    summary: "Catalog-level reference record for Kalpa in Vedanga traditions."
  },
  {
    title: "Vedanga Vyakarana",
    category: "Vedanga",
    language: "Sanskrit",
    sourceCitation: vedicSamhitasCatalog,
    summary: "Catalog-level reference record for Vyakarana in Vedanga traditions."
  },
  {
    title: "Vedanga Nirukta",
    category: "Vedanga",
    language: "Sanskrit",
    sourceCitation: vedicSamhitasCatalog,
    summary: "Catalog-level reference record for Nirukta in Vedanga traditions."
  },
  {
    title: "Vedanga Chandas",
    category: "Vedanga",
    language: "Sanskrit",
    sourceCitation: vedicSamhitasCatalog,
    summary: "Catalog-level reference record for Chandas in Vedanga traditions."
  },
  {
    title: "Vedanga Jyotisha",
    category: "Vedanga",
    language: "Sanskrit",
    sourceCitation: vedicSamhitasCatalog,
    summary: "Catalog-level reference record for Jyotisha in Vedanga traditions."
  },
  {
    title: "Mahabharata",
    category: "Itihasa",
    language: "Sanskrit",
    sourceCitation: "https://www.sacred-texts.com/hin/maha/index.htm",
    summary: "Reference record for the Mahabharata of Krishna-Dwaipayana Vyasa, Ganguli translation index."
  },
  {
    title: "Bhagavad Gita",
    category: "Gita",
    language: "Sanskrit",
    sourceCitation: "https://www.sacred-texts.com/hin/maha/index.htm",
    summary: "Reference record for the Bhagavad Gita as a text within the Mahabharata tradition."
  },
  {
    title: "Ramayana",
    category: "Itihasa",
    language: "Sanskrit",
    sourceCitation: "https://www.sacred-texts.com/hin/rama/",
    summary: "Reference record for the Ramayana translation index at Sacred Texts."
  },
  {
    title: "Vishnu Purana",
    category: "Purana",
    language: "Sanskrit",
    sourceCitation: sacredTextsHinduCatalog,
    summary: "Reference record for Vishnu Purana listed in the Sacred Texts Hinduism Puranas catalog."
  },
  {
    title: "Garuda Purana",
    category: "Purana",
    language: "Sanskrit",
    sourceCitation: sacredTextsHinduCatalog,
    summary: "Reference record for Garuda Purana listed in the Sacred Texts Hinduism Puranas catalog."
  },
  {
    title: "Srimad Devi Bhagavatam",
    category: "Purana",
    language: "Sanskrit",
    sourceCitation: sacredTextsHinduCatalog,
    summary: "Reference record for Srimad Devi Bhagavatam listed in the Sacred Texts Hinduism Puranas catalog."
  }
];
