export type SanskritDictionaryEntry = {
  headword: string;
  transliteration: string;
  normalizedHeadword: string;
  sourceDictionary: string;
  definition: string;
  partOfSpeech: string | null;
  sourceCitation: string;
};

const monierWilliamsSource = "https://www.sanskrit-lexicon.uni-koeln.de/scans/MWScan/2020/web/webtc/indexcaller.php";
const apteSource = "https://www.sanskrit-lexicon.uni-koeln.de/scans/AP90Scan/2020/web/webtc/indexcaller.php";

export const sanskritDictionarySeed: SanskritDictionaryEntry[] = [
  {
    headword: "अग्नि",
    transliteration: "agni",
    normalizedHeadword: "agni",
    sourceDictionary: "Monier-Williams Sanskrit-English Dictionary",
    definition: "fire; Agni as the Vedic fire deity.",
    partOfSpeech: "noun",
    sourceCitation: monierWilliamsSource
  },
  {
    headword: "आत्मन्",
    transliteration: "atman",
    normalizedHeadword: "atman",
    sourceDictionary: "Monier-Williams Sanskrit-English Dictionary",
    definition: "breath; self; soul.",
    partOfSpeech: "noun",
    sourceCitation: monierWilliamsSource
  },
  {
    headword: "गुरु",
    transliteration: "guru",
    normalizedHeadword: "guru",
    sourceDictionary: "Monier-Williams Sanskrit-English Dictionary",
    definition: "heavy; weighty; venerable; teacher.",
    partOfSpeech: "adjective/noun",
    sourceCitation: monierWilliamsSource
  },
  {
    headword: "विद्या",
    transliteration: "vidya",
    normalizedHeadword: "vidya",
    sourceDictionary: "Monier-Williams Sanskrit-English Dictionary",
    definition: "knowledge; science; learning.",
    partOfSpeech: "noun",
    sourceCitation: monierWilliamsSource
  },
  {
    headword: "वेद",
    transliteration: "veda",
    normalizedHeadword: "veda",
    sourceDictionary: "Monier-Williams Sanskrit-English Dictionary",
    definition: "knowledge; sacred knowledge; Veda.",
    partOfSpeech: "noun",
    sourceCitation: monierWilliamsSource
  },
  {
    headword: "ऋषि",
    transliteration: "rishi",
    normalizedHeadword: "rishi",
    sourceDictionary: "Monier-Williams Sanskrit-English Dictionary",
    definition: "seer; inspired sage; rishi.",
    partOfSpeech: "noun",
    sourceCitation: monierWilliamsSource
  },
  {
    headword: "मन्त्र",
    transliteration: "mantra",
    normalizedHeadword: "mantra",
    sourceDictionary: "Monier-Williams Sanskrit-English Dictionary",
    definition: "instrument of thought; sacred utterance; hymn; prayer.",
    partOfSpeech: "noun",
    sourceCitation: monierWilliamsSource
  },
  {
    headword: "शिष्य",
    transliteration: "shishya",
    normalizedHeadword: "shishya",
    sourceDictionary: "Apte Practical Sanskrit-English Dictionary",
    definition: "a pupil; scholar; disciple.",
    partOfSpeech: "noun",
    sourceCitation: apteSource
  },
  {
    headword: "शास्त्र",
    transliteration: "shastra",
    normalizedHeadword: "shastra",
    sourceDictionary: "Monier-Williams Sanskrit-English Dictionary",
    definition: "teaching; rule; scientific or sacred treatise.",
    partOfSpeech: "noun",
    sourceCitation: monierWilliamsSource
  },
  {
    headword: "धर्म",
    transliteration: "dharma",
    normalizedHeadword: "dharma",
    sourceDictionary: "Monier-Williams Sanskrit-English Dictionary",
    definition: "that which is established; law; duty; right conduct.",
    partOfSpeech: "noun",
    sourceCitation: monierWilliamsSource
  }
];
