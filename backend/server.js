require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { fetchAllSources } = require("./rssFetcher");
const { analyseText } = require("./sentimentEngine");

const https = require("https");

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Translation Helper (Free Google Translate Interface) ─────────────────────
function translateText(text) {
  if (!text || !/[^\x00-\x7F]/.test(text)) return Promise.resolve(text);
  return new Promise((resolve) => {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json[0].map(item => item[0]).join(""));
        } catch { resolve(text); }
      });
    }).on("error", () => resolve(text));
  });
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST"],
}));
app.use("/api/", rateLimit({ windowMs: 2 * 60 * 1000, max: 30 }));

// ─── Health ───────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", time: new Date() }));

// ─── Analyze endpoint ─────────────────────────────────────────────────────────
app.post("/api/analyze", async (req, res) => {
  const { sources, keywords, fromDate, toDate } = req.body;

  if (!sources || !Array.isArray(sources) || sources.length === 0) {
    return res.status(400).json({ error: "Provide at least one source." });
  }

  // Validate optional date params
  const from = fromDate ? new Date(fromDate) : null;
  const to = toDate ? new Date(toDate) : null;
  if (from && isNaN(from)) return res.status(400).json({ error: "Invalid fromDate." });
  if (to && isNaN(to)) return res.status(400).json({ error: "Invalid toDate." });
  // Make `to` inclusive by extending it to end-of-day
  if (to) to.setHours(23, 59, 59, 999);

  // Build search query: use both English and Hindi for the core topic (UP Politics)
  const baseQuery = '(Uttar Pradesh OR "उत्तर प्रदेश" OR UP OR यूपी) (politics OR राजनीति)';
  let query = baseQuery;
  let fetchLimit = 4;

  if (keywords?.trim()) {
    // Attempt to translate entire keyword string to expand reach
    const translated = await translateText(keywords);
    
    // Combine original and translated keywords to find results in both languages
    // We treat them as OR groups: (Original logic) OR (Translated logic)
    const allInputSets = [...new Set([keywords, translated])];
    
    const combinedGroups = [];
    allInputSets.forEach(inputSet => {
      const orParts = inputSet.split(",").map(p => p.trim()).filter(p => p.length > 0);
      orParts.forEach(part => {
        const andParts = part.split("+").map(t => t.trim()).filter(t => t.length > 0);
        if (andParts.length > 0) {
          const quoted = andParts.map(t => t.includes(" ") ? `"${t}"` : t);
          combinedGroups.push(quoted.length > 1 ? `(${quoted.join(" ")})` : quoted[0]);
        }
      });
    });

    const uniqueGroups = [...new Set(combinedGroups)];
    if (uniqueGroups.length > 0) {
      const orQuery = uniqueGroups.join(" OR ");
      query = `${baseQuery} (${orQuery})`;
      fetchLimit = uniqueGroups.length > 4 ? 10 : 8;
    }
  }

  try {
    // 1. Fetch RSS articles for every selected source
    const rawArticles = await fetchAllSources(sources, query, fetchLimit);

    if (rawArticles.length === 0) {
      return res.json({ articles: [], count: 0 });
    }

    // 2. Run local sentiment analysis on each article
    let articles = rawArticles.map((art) => {
      const analysis = analyseText(art.rawText || art.title);
      return {
        title: art.title,
        source: art.source,
        date: art.date,
        url: art.url,
        summary: art.summary,
        sentiment: analysis.sentiment,
        sentiment_score: analysis.sentiment_score,
        politically_relevant: analysis.politically_relevant,
        topics: analysis.topics,
      };
    });

    // 3. Apply optional date filter (if no dates given, skip — return everything)
    if (from || to) {
      articles = articles.filter((art) => {
        if (!art.date) return true;          // keep articles with no date
        const d = new Date(art.date);
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      });
    }

    return res.json({ articles, count: articles.length });
  } catch (err) {
    console.error("Analyze error:", err);
    return res.status(500).json({ error: err.message || "Analysis failed." });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () =>
  console.log(`UP Tracker backend running on port ${PORT} – no API key needed!`)
);
