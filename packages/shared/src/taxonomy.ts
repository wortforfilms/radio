export const preservedUniverses = [
  "Universal Knowledge Lineage Explorer",
  "Pitra Universe",
  "Guru Maataa Universe",
  "Rishi Universe",
  "Rishika Universe",
  "Parampara Universe",
  "Civilization Universe",
  "Knowledge Universe",
  "Subject Universe",
  "Text Universe",
  "Timeline Universe",
  "Geography Universe",
  "Knowledge Graph Universe",
  "Education Universe",
  "Research Universe",
  "Community Universe",
  "Media Universe",
  "AI Universe",
  "Observatory Universe",
  "Future Knowledge Universe",
  "Governance Universe",
  "Universal Command Center"
] as const;

export const relationshipTaxonomy = [
  ["teacher_of", "Teacher of", "student_of"],
  ["student_of", "Student of", "teacher_of"],
  ["influenced", "Influenced", null],
  ["inspired", "Inspired", null],
  ["authored", "Authored", null],
  ["translated", "Translated", null],
  ["belongs_to", "Belongs to", null],
  ["discovered", "Discovered", null],
  ["continued", "Continued", null],
  ["preserved", "Preserved", null],
  ["collaborated_with", "Collaborated with", "collaborated_with"],
  ["founded", "Founded", null]
] as const;

export const knowledgeDomains = [
  "Veda",
  "Vedanga",
  "Darshana",
  "Itihasa",
  "Purana",
  "Ayurveda",
  "Jyotisha",
  "Ganita",
  "Vyakarana",
  "Sangita",
  "Natyashastra",
  "Yoga",
  "Governance",
  "Ecology",
  "AI Knowledge Systems"
] as const;

export const subjectTaxonomy = [
  ["Knowledge Systems", null],
  ["Lineage Studies", "Knowledge Systems"],
  ["Textual Studies", "Knowledge Systems"],
  ["Civilization Studies", "Knowledge Systems"],
  ["Education Systems", "Knowledge Systems"],
  ["Graph Analytics", "Knowledge Systems"],
  ["Audit and Provenance", "Knowledge Systems"]
] as const;

export const civilizationTaxonomy = [
  ["Bharatiya Civilization", null],
  ["Vedic Knowledge Tradition", "Bharatiya Civilization"],
  ["Guru Parampara", "Bharatiya Civilization"],
  ["Regional Knowledge Traditions", "Bharatiya Civilization"]
] as const;

export const saptarishiSeedNames = [
  "Atri",
  "Bharadvaja",
  "Gautama",
  "Jamadagni",
  "Kashyapa",
  "Vashistha",
  "Vishvamitra"
] as const;

export const rishikaSeedNames = [
  "Gargi Vachaknavi",
  "Maitreyi",
  "Lopamudra",
  "Ghosha",
  "Apala",
  "Vishvavara",
  "Romasha",
  "Sulabha"
] as const;

export const seedProvenanceNote =
  "Seeded as a traditional taxonomy/name label only. Verification requires a supplied citation before lineage claims are accepted.";
