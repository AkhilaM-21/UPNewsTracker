/**
 * sentimentEngine.js
 * Sentiment scoring + topic extraction – 100 % local, zero API calls.
 */

const Sentiment = require("sentiment");
const analyzer = new Sentiment();

// ─── UP-Politics domain vocabulary ───────────────────────────────────────────
// Extra words that carry positive/negative signal in this specific context
// Extra words that carry positive/negative signal in this specific context
const UP_EXTRA = {
  // English
  development: 3, progress: 3, growth: 3, infrastructure: 2,
  initiative: 2, scheme: 2, welfare: 3, relief: 2, achievement: 3,
  launched: 2, inaugurated: 2, approved: 2, invested: 2, felicitated: 2,
  honored: 2, record: 2, milestone: 3, improved: 2, reform: 2,
  // Hindi
  "विकास": 3, "प्रगति": 3, "कल्याण": 3, "राहत": 2, "सफलता": 3, "सुधार": 2,
  "उद्घाटन": 2, "मंजूरी": 2, "निवेश": 2, "रिकॉर्ड": 2, "उपलब्धि": 3,
  // Negative (English)
  protest: -2, agitation: -2, arrested: -2, detained: -2, accused: -2,
  controversy: -3, scam: -4, corruption: -4, crime: -3, rape: -4,
  murder: -4, riot: -4, violence: -3, lathicharge: -3, bulldozer: -2,
  demolished: -2, evicted: -2, opposition: -1, clash: -2, victim: -2,
  crisis: -3, failed: -2, failure: -2, drought: -2, flood: -2,
  inflation: -2, unemployment: -2, poverty: -2, debt: -2, bankrupt: -3,
  // Negative (Hindi)
  "विरोध": -2, "प्रदर्शन": -2, "गिरफ्तार": -2, "हिरासत": -2, "आरोप": -2,
  "विवाद": -3, "घोटाला": -4, "भ्रष्टाचार": -4, "अपराध": -3, "बलात्कार": -4,
  "हत्या": -4, "दंगा": -4, "हिंसा": -3, "लाठीचार्ज": -3, "बुलडोजर": -2,
  "विपक्ष": -1, "झड़प": -2, "पीड़ित": -2, "संकट": -3, "विफल": -2,
};

// ─── Political-relevance keyword list ────────────────────────────────────────
const POL_KEYWORDS = [
  "bjp", "samajwadi", "sp ", "bsp", "congress", "aam aadmi", "aap",
  "yogi", "adityanath", "akhilesh", "mayawati", "rahul", "modi",
  "election", "vote", "campaign", "manifesto", "alliance", "coalition",
  "mla", "mp ", "minister", "cabinet", "government", "opposition",
  "party", "assembly", "lok sabha", "vidhan sabha", "constituency",
  "rally", "bypolls", "upa", "nda", "incumbent",
  // Hindi keywords
  "भाजपा", "सपा", "समाजवादी", "बसपा", "कांग्रेस", "चुनाव", "वोट", "प्रचार",
  "गठबंधन", "विधायक", "सांसद", "मंत्री", "कैबिनेट", "सरकार", "विपक्ष",
  "पार्टी", "विधानसभा", "लोकसभा", "रैली", "उपचुनाव", "योगी", "आदित्यनाथ",
  "अखिलेश", "मायावती", "मोदी", "राहुल", "मुख्यमंत्री", "नेता", "पीएम", "सांसद",
];

// ─── Topic keyword map ────────────────────────────────────────────────────────
const TOPIC_MAP = [
  { topic: "BJP",              kw: ["bjp", "bharatiya janata", "भाजपा", "भारतीय जनता", "मोदी"] },
  { topic: "Samajwadi Party",  kw: ["samajwadi", "sp ", "akhilesh", "सपा", "समाजवादी", "अखिलेश"] },
  { topic: "BSP",              kw: ["bsp", "bahujan", "mayawati", "बसपा", "बहुजन", "मायावती"] },
  { topic: "Congress",         kw: ["congress", "rahul gandhi", "priyanka", "कांग्रेस", "राहुल", "प्रियंका"] },
  { topic: "Yogi Adityanath",  kw: ["yogi", "adityanath", "cm yogi", "योगी", "आदित्यनाथ"] },
  { topic: "Elections",        kw: ["election", "vote", "poll", "bypolls", "campaign", "चुनाव", "मतदान", "बैलट", "ईवीएम"] },
  { topic: "Law and Order",    kw: ["crime", "police", "arrest", "murder", "rape", "riot", "gangster", "अपराध", "पुलिस", "हत्या", "गिरफ्तार"] },
  { topic: "Governance",       kw: ["government", "minister", "cabinet", "policy", "scheme", "order", "सरकार", "शासन", "प्रशासन"] },
  { topic: "Development",      kw: ["development", "infrastructure", "project", "investment", "expressway", "विकास", "बुनियादी ढांचा", "परियोजना"] },
  { topic: "Farmers",          kw: ["farmer", "kisan", "agriculture", "crop", "msp", "किसान", "खेती", "कृषि"] },
  { topic: "UP Budget",        kw: ["budget", "fiscal", "revenue", "expenditure", "बजट", "राजस्व"] },
  { topic: "Education",        kw: ["school", "college", "university", "education", "student", "शिक्षा", "स्कूल", "छात्र", "यूनिवर्सिटी"] },
  { topic: "Health",           kw: ["hospital", "health", "disease", "covid", "vaccination", "स्वास्थ्य", "अस्पताल", "मरीज"] },
  { topic: "Communal",         kw: ["communal", "hindu", "muslim", "mosque", "temple", "religious", "सांप्रदायिक", "धार्मिक", "मंदिर", "मस्जिद"] },
  { topic: "Corruption",       kw: ["corruption", "scam", "bribe", "fraud", "embezzle", "भ्रष्टाचार", "घोटाला", "रिश्वत"] },
  { topic: "Protest",          kw: ["protest", "agitation", "strike", "rally", "demonstration", "प्रदर्शन", "विरोध", "हड़ताल", "धरना"] },
  { topic: "Modi",             kw: ["narendra modi", "prime minister modi", "pm modi", "मोदी", "प्रधान मंत्री"] },
  { topic: "Akhilesh Yadav",   kw: ["akhilesh", "yadav clan", "अखिलेश", "सपा प्रमुख"] },
];

/**
 * Analyse a single article text (title + summary + description)
 * Returns { sentiment, sentiment_score, politically_relevant, topics }
 */
function analyseText(text) {
  // Normalize Unicode for Hindi (ensures matching across different sources)
  const normalized = (text || "").normalize("NFC");
  const lower = normalized.toLowerCase();

  // Sentiment
  const result = analyzer.analyze(normalized, { extras: UP_EXTRA });
  const score = result.comparative; // normalised by word count, range ≈ -5 to +5
  let sentiment;
  if (score > 0.15) sentiment = "positive";
  else if (score < -0.15) sentiment = "negative";
  else sentiment = "neutral";

  // Normalise score to [-1, 1]
  const normalised = Math.max(-1, Math.min(1, score / 3));

  // Political relevance
  const politically_relevant = POL_KEYWORDS.some((kw) => lower.includes(kw));

  // Topic extraction
  const topics = TOPIC_MAP.filter(({ kw }) => kw.some((k) => lower.includes(k))).map((t) => t.topic).slice(0, 3);

  return {
    sentiment,
    sentiment_score: parseFloat(normalised.toFixed(3)),
    politically_relevant,
    topics: topics.length ? topics : ["General"],
  };
}

module.exports = { analyseText };
