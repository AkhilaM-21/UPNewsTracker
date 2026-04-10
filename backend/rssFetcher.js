/**
 * rssFetcher.js
 * Fetches articles via Google News RSS for each source.
 * Zero API keys – 100 % free.
 */

const Parser = require("rss-parser");
const parser = new Parser({ timeout: 20000 });

/**
 * Fetch with automatic retries for stability (handles "socket hang up")
 */
async function fetchWithRetry(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await parser.parseURL(url);
    } catch (err) {
      if (i === retries) throw err;
      // Wait 1s and retry
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

// Map source label → Google-News site: filter (domain hint)
const SOURCE_DOMAINS = {
  "Aaj Tak": "aajtak.in",
  "ABP News": "abplive.com",
  "Zee News": "zeenews.india.com",
  "News18 India": "news18.com",
  "India TV": "indiatvnews.com",
  "NDTV": "ndtv.com",
  "Dainik Jagran": "jagran.com",
  "Amar Ujala": "amarujala.com",
  "Hindustan": "livehindustan.com",
  "Navbharat Times": "navbharattimes.indiatimes.com",
  "Times of India": "timesofindia.indiatimes.com",
  "Hindustan Times": "hindustantimes.com",
  "Indian Express": "indianexpress.com",
  "The Lallantop": "thelallantop.com",
  "NewsClick": "newsclick.in",
  "The Quint": "thequint.com",
  "Scroll.in": "scroll.in",
  "News18 UP/UK": "news18.com/news/uttar-pradesh",
  "Zee UP/UK": "zeenews.india.com/hindi/uttar-pradesh",
  "ABP Ganga": "abplive.com/states/up-uk",
  "Aaj Tak UP": "aajtak.in/uttar-pradesh",
  "Dainik Jagran (UP)": "jagran.com/uttar-pradesh",
  "Amar Ujala (UP)": "amarujala.com/uttar-pradesh",
  "Hindustan (UP)": "livehindustan.com/uttar-pradesh",
  "UP Tak": "uptak.in",
  "Bharat Samachar": "bharatsamachartv.in",
  "Dainik Bhaskar": "bhaskar.com",
  "ANI News": "aninews.in",
  "IANS": "ians.in",
  "PTI": "ptinews.com",
  "The Hindu": "thehindu.com",
  "Deccan Herald": "deccanherald.com",
  "The Print": "theprint.in",
  "India Today": "indiatoday.in",
  "Economic Times": "economictimes.indiatimes.com",
  "ETV Bharat": "etvbharat.com",
  "Free Press Journal": "freepressjournal.in",
  "TV9 Bharatvarsh": "tv9hindi.com",
  "Patrika News": "patrika.com",
};

/**
 * Build a Google News RSS URL for a given query + optional site filter.
 */
function buildRssUrl(query, domain) {
  const q = domain
    ? `${query} site:${domain}`
    : query;
  // gl=IN ensures results are relevant to India, but we remove hl and ceid
  // to allow Google to return results in any language (English, Hindi, etc.)
  // based on the query keywords.
  return `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&gl=IN`;
}

/**
 * Parse a date string into YYYY-MM-DD.
 */
function normaliseDate(raw) {
  if (!raw) return new Date().toISOString().slice(0, 10);
  try {
    return new Date(raw).toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/**
 * Strip HTML tags from a string.
 */
function stripHtml(str) {
  return (str || "").replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim();
}

/**
 * Fetch up to `limit` articles for one source.
 * Falls back to a broader UP-politics query if the site-scoped query returns nothing.
 */
async function fetchForSource(sourceName, query, limit = 4) {
  const domain = SOURCE_DOMAINS[sourceName];
  const url = buildRssUrl(query, domain);

  try {
    const feed = await fetchWithRetry(url);
    const items = (feed.items || []).slice(0, limit);

    if (items.length === 0 && domain) {
      // Fallback: search without site filter
      const fallbackUrl = buildRssUrl(`${query} ${sourceName}`, null);
      const fallbackFeed = await fetchWithRetry(fallbackUrl);
      return (fallbackFeed.items || []).slice(0, limit).map((item) => formatItem(item, sourceName));
    }

    return items.map((item) => formatItem(item, sourceName));
  } catch (err) {
    // Network / parse errors: return empty rather than crashing
    console.warn(`[RSS] ${sourceName}: ${err.message}`);
    return [];
  }
}

function formatItem(item, sourceName) {
  return {
    title: stripHtml(item.title || ""),
    url: item.link || item.guid || "",
    date: normaliseDate(item.pubDate || item.isoDate),
    rawText: [
      stripHtml(item.title || ""),
      stripHtml(item.contentSnippet || ""),
      stripHtml(item.content || ""),
    ].join(" "),
    source: sourceName,
    summary: stripHtml(item.contentSnippet || item.title || "").slice(0, 220),
  };
}

/**
 * Fetch articles for all requested sources in parallel (with concurrency cap).
 */
async function fetchAllSources(sources, query, limitPerSource = 4) {
  const CONCURRENCY = 6;
  const results = [];

  for (let i = 0; i < sources.length; i += CONCURRENCY) {
    const batch = sources.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map((src) => fetchForSource(src, query, limitPerSource))
    );
    batchResults.forEach((items) => results.push(...items));
  }

  return results;
}

module.exports = { fetchAllSources };
