// =====================================================================
//  stimuli.js — Cues, Knowledge, and Authorship (follow-up to Manvi's pilot)
//
//  Three item SETS (A, B, C). Each set is shown in ONE encoding condition
//  (marked / unmarked-informed / co-produced); the set→condition mapping is
//  rotated across participants (Latin square) so every sentence appears in
//  every condition across the sample.
//
//  Each set should contain 20 sentences: 10 human, 10 ai, 25–35 words,
//  matched on word count (±3) and type-token ratio, screened so that ≥4/5
//  naive raters call each AI sentence "human". The entries below are
//  PLACEHOLDERS that let the script run end-to-end for testing. Replace
//  them with the screened stimuli and keep the field names.
//
//  Fields:
//    id      unique string; keep the set letter as prefix (A01, B07 ...)
//    text    the sentence
//    source  "human" | "ai"
//    prompt  short topic cue shown in the co-produced block ("Topic: ..."
//            for AI items; "Archive entry: ..." for human items). Keep it
//            neutral and content-poor so it is not itself a source cue.
//
//  foils_s1 / foils_s2: never shown at study. 10 each (5 human, 5 ai),
//  matched on topic and length. s1 foils are used in the session-1 test;
//  s2 foils in the 48-h retest (s1 foils would be "old" by then).
//
//  content_questions: filler-task items (~15–20). `item` links to the
//  sentence the question is about; `answer` is for offline scoring.
// =====================================================================

const STIMULI = {
  topic: "Provincial administration in an early-modern agrarian state",

  sets: {
    A: [
      { id: "A01", source: "human", prompt: "taxation records",
        text: "The early colonial administration relied heavily on local intermediaries to collect taxation records across rural districts, a practice that persisted for several decades." },
      { id: "A02", source: "ai", prompt: "agricultural output",
        text: "Agricultural output in the northern provinces declined sharply during periods of prolonged administrative disruption and the reallocation of scarce resources toward garrison towns." },
      { id: "A03", source: "human", prompt: "river transport",
        text: "Grain moved along the river network in the dry season, when water levels were low enough for barges to pass the rapids without unloading their cargo." },
      { id: "A04", source: "ai", prompt: "village councils",
        text: "Village councils retained authority over land disputes throughout the period, although their decisions were increasingly subject to review by district officers appointed from the capital." }
      // ... 16 more (8 human, 8 ai)
    ],
    B: [
      { id: "B01", source: "human", prompt: "salt monopoly",
        text: "The salt monopoly generated a substantial share of provincial revenue, and officials who administered it were among the most closely supervised in the entire bureaucracy." },
      { id: "B02", source: "ai", prompt: "census procedures",
        text: "Census enumerators were instructed to record household size, cultivated acreage, and draught animals, though compliance varied considerably between settled villages and pastoral communities." },
      { id: "B03", source: "human", prompt: "road maintenance",
        text: "Road maintenance was assigned to the villages through which each road passed, an arrangement that worked well in prosperous years and collapsed entirely in lean ones." },
      { id: "B04", source: "ai", prompt: "market towns",
        text: "Market towns served as the primary interface between rural producers and the provincial treasury, hosting periodic assessments that determined the following year's tax obligations." }
      // ... 16 more
    ],
    C: [
      { id: "C01", source: "human", prompt: "irrigation works",
        text: "Irrigation works were financed by a levy on the fields they served, collected at harvest and held by the district office until repairs were needed." },
      { id: "C02", source: "ai", prompt: "customs posts",
        text: "Customs posts along the eastern frontier recorded the passage of goods and travellers, generating ledgers that later administrators used to estimate regional trade volumes." },
      { id: "C03", source: "human", prompt: "famine relief",
        text: "During the famine of the third decade, relief grain was distributed through temples rather than through the district offices, which had lost the confidence of the population." },
      { id: "C04", source: "ai", prompt: "land surveys",
        text: "Land surveys conducted in the later period employed standardised measurement units, replacing the diverse local conventions that had complicated earlier revenue assessments." }
      // ... 16 more
    ]
  },

  foils_s1: [
    { id: "F101", source: "human", text: "Correspondence between district officers and the capital was carried by relay riders, whose stations were maintained at public expense along the main routes." },
    { id: "F102", source: "ai", text: "Provincial magistrates were rotated between postings every few years, a policy intended to prevent the formation of durable local alliances that might compromise revenue collection." }
    // ... 8 more (4 human, 4 ai)
  ],

  foils_s2: [
    { id: "F201", source: "human", text: "Weights and measures used in the grain markets were inspected twice a year, and merchants found using short measures were fined and publicly named." },
    { id: "F202", source: "ai", text: "Forest tracts under provincial control supplied timber for public works and were managed through a system of licensed cutting that generated modest but reliable income." }
    // ... 8 more
  ],

  content_questions: [
    { item: "A01", q: "One sentence mentioned taxation records. Were these collected in rural or urban districts?", answer: "rural" },
    { item: "A02", q: "A sentence described a decline in agricultural output. In which provinces?", answer: "northern" },
    { item: "B01", q: "Which commodity was described as a state monopoly?", answer: "salt" },
    { item: "C03", q: "During the famine, relief grain was distributed through which institutions?", answer: "temples" }
    // ... aim for 15–20, covering AI and human items equally
  ]
};
