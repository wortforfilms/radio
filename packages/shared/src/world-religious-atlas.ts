export type WorldReligiousTextEntry = {
  title: string;
  tradition: string;
  language: string | null;
  location: string;
  summary: string;
  sourceCitation: string;
};

export type WorldScriptEntry = {
  name: string;
  location: string;
  summary: string;
  sourceCitation: string;
  sample: string;
  hindiTransliteration: string | null;
  sanskritTranslation: string | null;
  fontStack: string;
  styleName: string;
  direction: "ltr" | "rtl";
};

export const worldReligiousTexts: WorldReligiousTextEntry[] = [
  {
    title: "Rigveda Samhita",
    tradition: "Vedic",
    language: "Sanskrit",
    location: "Indian Subcontinent",
    summary: "Catalog-level world sacred text reference for the Rigveda Samhita.",
    sourceCitation: "https://vedicheritage.gov.in/samhitas/rigveda/"
  },
  {
    title: "Torah",
    tradition: "Judaism",
    language: "Hebrew",
    location: "Land of Israel and Jerusalem",
    summary: "Catalog-level world sacred text reference for the Torah.",
    sourceCitation: "https://www.britannica.com/topic/Torah"
  },
  {
    title: "Bible",
    tradition: "Christianity",
    language: null,
    location: "Eastern Mediterranean",
    summary: "Catalog-level world sacred text reference for the Bible.",
    sourceCitation: "https://www.britannica.com/topic/Bible"
  },
  {
    title: "Quran",
    tradition: "Islam",
    language: "Arabic",
    location: "Arabian Peninsula",
    summary: "Catalog-level world sacred text reference for the Quran.",
    sourceCitation: "https://www.britannica.com/topic/Quran"
  },
  {
    title: "Tipitaka",
    tradition: "Buddhism",
    language: "Pali",
    location: "Sri Lanka",
    summary: "Catalog-level world sacred text reference for the Pali Tipitaka.",
    sourceCitation: "https://www.britannica.com/topic/Tipitaka"
  },
  {
    title: "Guru Granth Sahib",
    tradition: "Sikhism",
    language: "Punjabi",
    location: "Punjab",
    summary: "Catalog-level world sacred text reference for the Guru Granth Sahib.",
    sourceCitation: "https://www.britannica.com/topic/Adi-Granth"
  },
  {
    title: "Avesta",
    tradition: "Zoroastrianism",
    language: "Avestan",
    location: "Ancient Iran",
    summary: "Catalog-level world sacred text reference for the Avesta.",
    sourceCitation: "https://www.britannica.com/topic/Zoroastrianism"
  },
  {
    title: "Dao De Jing",
    tradition: "Daoism",
    language: "Chinese",
    location: "China",
    summary: "Catalog-level world sacred text reference for the Dao De Jing.",
    sourceCitation: "https://www.britannica.com/topic/Daodejing"
  },
  {
    title: "Analects",
    tradition: "Confucianism",
    language: "Chinese",
    location: "China",
    summary: "Catalog-level world sacred text reference for the Analects.",
    sourceCitation: "https://www.britannica.com/topic/Analects"
  },
  {
    title: "Kojiki",
    tradition: "Shinto",
    language: "Japanese",
    location: "Japan",
    summary: "Catalog-level world sacred text reference for the Kojiki.",
    sourceCitation: "https://www.britannica.com/topic/Kojiki"
  },
  {
    title: "Book of Mormon",
    tradition: "Latter-day Saint movement",
    language: "English",
    location: "United States",
    summary: "Catalog-level world sacred text reference for the Book of Mormon.",
    sourceCitation: "https://www.britannica.com/topic/Book-of-Mormon"
  },
  {
    title: "Popol Vuh",
    tradition: "Kiche Maya",
    language: "Kiche",
    location: "Guatemala",
    summary: "Catalog-level world sacred text reference for the Popol Vuh.",
    sourceCitation: "https://www.britannica.com/topic/Popol-Vuh"
  }
];

export const worldScriptEntries: WorldScriptEntry[] = [
  {
    name: "Devanagari",
    location: "Indian Subcontinent",
    summary: "Script reference node for Devanagari, associated here with broad South Asian textual use.",
    sourceCitation: "https://www.unicode.org/charts/PDF/U0900.pdf",
    sample: "धर्म",
    hindiTransliteration: "धर्म",
    sanskritTranslation: "धर्म",
    fontStack: "\"Noto Sans Devanagari\", \"Kohinoor Devanagari\", Mangal, serif",
    styleName: "Devanagari textual",
    direction: "ltr"
  },
  {
    name: "Hebrew",
    location: "Land of Israel and Jerusalem",
    summary: "Script reference node for Hebrew script, associated here with Jewish textual traditions.",
    sourceCitation: "https://www.unicode.org/charts/PDF/U0590.pdf",
    sample: "תורה",
    hindiTransliteration: "तोराह",
    sanskritTranslation: null,
    fontStack: "\"Noto Sans Hebrew\", \"Arial Hebrew\", serif",
    styleName: "Hebrew right-to-left",
    direction: "rtl"
  },
  {
    name: "Arabic",
    location: "Arabian Peninsula",
    summary: "Script reference node for Arabic script, associated here with Arabic-language Islamic textual traditions.",
    sourceCitation: "https://www.unicode.org/charts/PDF/U0600.pdf",
    sample: "القرآن",
    hindiTransliteration: "अल-कुरआन",
    sanskritTranslation: null,
    fontStack: "\"Noto Naskh Arabic\", \"Geeza Pro\", Arial, serif",
    styleName: "Arabic right-to-left",
    direction: "rtl"
  },
  {
    name: "Greek",
    location: "Eastern Mediterranean",
    summary: "Script reference node for Greek script, associated here with Eastern Mediterranean textual transmission.",
    sourceCitation: "https://www.unicode.org/charts/PDF/U0370.pdf",
    sample: "λόγος",
    hindiTransliteration: "लोगोस",
    sanskritTranslation: null,
    fontStack: "\"Noto Serif\", \"Times New Roman\", serif",
    styleName: "Greek manuscript",
    direction: "ltr"
  },
  {
    name: "Gurmukhi",
    location: "Punjab",
    summary: "Script reference node for Gurmukhi, associated here with Sikh textual traditions.",
    sourceCitation: "https://www.unicode.org/charts/PDF/U0A00.pdf",
    sample: "ਗੁਰੂ",
    hindiTransliteration: "गुरु",
    sanskritTranslation: "गुरु",
    fontStack: "\"Noto Sans Gurmukhi\", \"Gurmukhi MN\", serif",
    styleName: "Gurmukhi textual",
    direction: "ltr"
  },
  {
    name: "Avestan",
    location: "Ancient Iran",
    summary: "Script reference node for Avestan script, associated here with Zoroastrian textual traditions.",
    sourceCitation: "https://www.unicode.org/charts/PDF/U10B00.pdf",
    sample: "𐬀𐬁𐬂",
    hindiTransliteration: null,
    sanskritTranslation: null,
    fontStack: "\"Noto Sans Avestan\", \"Segoe UI Historic\", serif",
    styleName: "Avestan encoded sample",
    direction: "ltr"
  },
  {
    name: "Chinese Han",
    location: "China",
    summary: "Script reference node for Han ideographs, associated here with Chinese religious and philosophical textual traditions.",
    sourceCitation: "https://www.unicode.org/charts/PDF/U4E00.pdf",
    sample: "道德經",
    hindiTransliteration: "दाओ दे जिंग",
    sanskritTranslation: null,
    fontStack: "\"Noto Serif CJK SC\", \"Songti SC\", SimSun, serif",
    styleName: "Han classical",
    direction: "ltr"
  },
  {
    name: "Japanese Kana",
    location: "Japan",
    summary: "Script reference node for Kana, associated here with Japanese textual transmission.",
    sourceCitation: "https://www.unicode.org/charts/PDF/U3040.pdf",
    sample: "こじき",
    hindiTransliteration: "कोजिकी",
    sanskritTranslation: null,
    fontStack: "\"Noto Sans JP\", \"Hiragino Sans\", Meiryo, sans-serif",
    styleName: "Kana textual",
    direction: "ltr"
  },
  {
    name: "Tibetan",
    location: "Tibet and Himalayan Region",
    summary: "Script reference node for Tibetan script, associated here with Buddhist textual transmission.",
    sourceCitation: "https://www.unicode.org/charts/PDF/U0F00.pdf",
    sample: "ཆོས",
    hindiTransliteration: null,
    sanskritTranslation: null,
    fontStack: "\"Noto Serif Tibetan\", \"Kailasa\", serif",
    styleName: "Tibetan textual",
    direction: "ltr"
  },
  {
    name: "Latin",
    location: "Europe and Global Diaspora",
    summary: "Script reference node for Latin script, associated here with broad global textual transmission.",
    sourceCitation: "https://www.unicode.org/charts/PDF/U0000.pdf",
    sample: "veritas",
    hindiTransliteration: "वेरितास",
    sanskritTranslation: null,
    fontStack: "\"Noto Serif\", Georgia, serif",
    styleName: "Latin scholarly",
    direction: "ltr"
  }
];
