const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

// ─── SOURCE DOMAINS ─────────────────────────────────────────
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
  "Prabhat Khabar": "prabhatkhabar.com",
  "Punjab Kesari": "punjabkesari.in",
  "Telegraph India": "telegraphindia.com",
  "Tribune India": "tribuneindia.com",
  "The Wire": "thewire.in",
  "Boom Live": "boomlive.in",
  "Alt News": "altnews.in",
  "Business Standard": "business-standard.com",
  "Live Mint": "livemint.com",
  "Financial Express": "financialexpress.com",
  "Outlook India": "outlookindia.com",
  "Firstpost": "firstpost.com",
  "Rediff": "rediff.com",
  // Additional from ControlsBar
  "Jansatta": "jansatta.com",
  "Bar and Bench": "barandbench.com",
  "The Federal": "thefederal.com",
  "News Arena India": "newsarenaindia.com",
  "Mint": "livemint.com",
  "Money Control": "moneycontrol.com",
  "DNA India": "dnaindia.com",
  "News18 UP/UK": "news18.com",
  "Zee UP/UK": "zeenews.india.com",
  "ABP Ganga": "abplive.com",
  "Aaj Tak UP": "aajtak.in",
  "Hindustan Samachar": "hindustansamachar.in",
  "DD News": "ddnews.gov.in",
  "News On Air": "newsonair.gov.in",
};

// ─── HELPERS ─────────────────────────────────────────

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function formatDate(date) {
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

function detectSource(hostname) {
  const domain = hostname.replace("www.", "").toLowerCase();
  for (const [name, d] of Object.entries(SOURCE_DOMAINS)) {
    if (domain.includes(d.toLowerCase())) return name;
  }
  return hostname;
}

/**
 * Check if a URL's domain matches ANY of the selected sources.
 * @param {string} url - Article URL
 * @param {Set<string>} allowedDomains - Set of domain strings from SOURCE_DOMAINS
 */
function isAllowedSource(url, allowedDomains) {
  try {
    const domain = new URL(url).hostname.replace("www.", "").toLowerCase();
    for (const d of allowedDomains) {
      if (domain.includes(d.toLowerCase())) return true;
    }
  } catch { }
  return false;
}

// ─── BUILD GOOGLE NEWS URL (NO site: FILTER — Broad search) ──────────────────

function buildUrl(query, fromDate, toDate, start = 0) {
  // Google News (tbm=nws) shows ~10 results per page — num=100 is ignored by Google News.
  // Pagination works via start=0, 10, 20, 30… (NOT 100)
  let url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=nws&start=${start}`;
  if (fromDate && toDate) {
    const cdMin = formatDate(fromDate);
    const cdMax = formatDate(toDate);
    url += `&tbs=cdr:1,cd_min:${cdMin},cd_max:${cdMax}`;
  }
  return url;
}

// ─── CREATE DRIVER (Always Headless - Maximum Compatibility) ─────────────────
// Always runs in headless mode (works everywhere: local, AWS, Render, etc)
// No display servers needed, no Xvfb required, no local rendering

async function createDriver() {
  const options = new chrome.Options();

  // ── Always Headless (for local + AWS + Render + any server) ──────────────
  options.addArguments("--headless=new");                          // Chrome 112+ new headless
  options.addArguments("--disable-gpu");                           // No GPU needed
  options.addArguments("--no-zygote");                             // Stability across platforms
  options.addArguments("--single-process");                        // Better for servers
  
  // ── Ensure no display required ────────────────────────────────────────────
  options.addArguments("--no-sandbox");                            // REQUIRED on AWS/servers
  options.addArguments("--disable-dev-shm-usage");                 // REQUIRED on AWS/servers
  options.addArguments("--disable-blink-features=AutomationControlled");
  options.addArguments("--disable-infobars");
  options.addArguments("--disable-extensions");
  options.addArguments("--disable-popup-blocking");
  options.addArguments("--disable-background-networking");
  options.addArguments("--disable-background-timer-throttling");
  options.addArguments("--disable-backgrounding-occluded-windows");
  options.addArguments("--disable-breakpad");
  options.addArguments("--disable-client-side-phishing-detection");
  options.addArguments("--disable-default-apps");
  options.addArguments("--disable-hang-monitor");
  options.addArguments("--disable-popup-blocking");
  options.addArguments("--disable-prompt-on-repost");
  options.addArguments("--disable-sync");
  options.addArguments("--window-size=1366,768");
  options.addArguments("--lang=en-US");
  
  console.log("✅ Chrome: HEADLESS MODE (no display needed)");

  // ── Real Chrome user-agent — masks HeadlessChrome AND selenium identity ───
  options.addArguments(
    "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/124.0.0.0 Safari/537.36"
  );

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  // ── CDP: inject stealth script BEFORE every page load ────────────────────
  // This kills the "navigator.webdriver" flag that Google uses to detect bots.
  try {
    await driver.sendDevToolsCommand("Page.addScriptToEvaluateOnNewDocument", {
      source: `
        // Hide webdriver flag
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        // Fake language list
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en', 'hi'] });
        // Fake platform
        Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
        // Fake plugin count (real Chrome has plugins)
        Object.defineProperty(navigator, 'plugins', { get: () => ({ length: 5 }) });
        // Add chrome runtime object (absent in selenium by default)
        window.chrome = { runtime: {}, loadTimes: function(){}, csi: function(){}, app: {} };
        // Override permissions query to not expose automation
        const origQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) =>
          parameters.name === 'notifications'
            ? Promise.resolve({ state: Notification.permission })
            : origQuery(parameters);
      `,
    });
    console.log("✅ Anti-bot stealth mode enabled");
  } catch (e) {
    console.log("⚠ Anti-bot stealth mode skipped:", e.message);
  }

  // ── Warm-up: visit Google homepage (headless, invisible) ─────────────────
  console.log("🔍 Starting anonymous scraping...");
  await driver.get("https://www.google.com");
  await sleep(2500 + Math.random() * 2000);

  // Dismiss cookie consent if it appears (EU/India regions)
  try {
    const acceptBtn = await driver.findElement(
      By.css("button#L2AGLb, button[aria-label='Accept all'], button[jsname='b3VHJd']")
    );
    await acceptBtn.click();
    console.log("Cookie consent dismissed.");
    await sleep(1000);
  } catch { /* no consent dialog — fine */ }

  return driver;
}


// ─── EXTRACT ARTICLES FROM CURRENT PAGE ──────────────────────────────────────
// Uses in-browser JS execution — immune to Google's ever-changing CSS class names.

async function extractArticles(driver, allowedDomains) {
  // Run JS inside the browser to collect all candidate article links.
  // This avoids relying on Google's CSS classes which change constantly.
  const rawResults = await driver.executeScript(function() {
    var results = [];
    var anchors = Array.from(document.querySelectorAll("a[href]"));
    for (var i = 0; i < anchors.length; i++) {
      var a = anchors[i];
      var href = a.href;
      if (!href || !href.startsWith("http")) continue;

      // ── Unwrap Google redirect URLs ─────────────────────────────────────────
      // Google News wraps links as: https://www.google.com/url?q=https://ndtv.com/...
      // We must extract the real URL from the q= param instead of discarding it.
      if (href.indexOf("google.com/url") !== -1) {
        try {
          var qParam = href.match(/[?&]q=([^&]+)/);
          if (qParam) {
            var decoded = decodeURIComponent(qParam[1]);
            if (decoded.startsWith("http")) href = decoded;
            else continue;
          } else { continue; }
        } catch(e) { continue; }
      }

      // Also skip residual google.com links (search pages, images, etc.)
      if (href.indexOf("google.com") !== -1) continue;
      if (href.indexOf("google.") !== -1 && href.indexOf("/url?") === -1) continue;

      // ── Walk up to find a container with decent text ────────────────────────
      var container = a;
      for (var j = 0; j < 6; j++) {
        if (!container.parentElement) break;
        container = container.parentElement;
        var txt = (container.innerText || "").trim();
        if (txt.length > 30) break;
      }

      var allText = (container.innerText || "").trim();
      var lines = allText.split("\n").map(function(l){ return l.trim(); }).filter(function(l){ return l.length > 5; });
      var title = lines.find(function(l){ return l.length > 15; }) || (a.innerText || "").trim();
      if (!title || title.length < 8) continue;

      // Try to extract a date string
      var dateMatch = allText.match(/(\d+\s+(?:min|hr|hour|day|week)s?\s+ago|yesterday|[A-Z][a-z]{2}\s+\d{1,2},?\s*\d{0,4})/i);
      var date = dateMatch ? dateMatch[0] : "";

      results.push({ href: href, title: title, date: date });
    }
    return results;
  });


  console.log("  -> JS extraction found " + rawResults.length + " candidate links on page.");

  const articles = [];
  let matched = 0;
  let skipped = 0;
  const seenUrls = new Set();

  for (const item of rawResults) {
    try {
      const { href, title, date } = item;
      if (!href || !title) continue;
      if (seenUrls.has(href)) continue;

      if (!isAllowedSource(href, allowedDomains)) {
        skipped++;
        continue;
      }

      seenUrls.add(href);
      matched++;
      const hostname = new URL(href).hostname;
      articles.push({
        title: title.substring(0, 300),
        url: href,
        sourceDomain: hostname,
        source: detectSource(hostname),
        date,
      });
    } catch { }
  }

  console.log("  -> Matched " + matched + " from your sources, skipped " + skipped + " others.");
  return articles;
}


// ─── WAIT FOR CAPTCHA RESOLUTION ─────────────────────────────────────────────

async function waitForCaptcha(driver) {
  console.log("⚠  CAPTCHA detected — please solve it in the browser window.");
  for (let attempt = 0; attempt < 24; attempt++) {
    await sleep(5000);
    const src = await driver.getPageSource();
    if (src.includes('id="search"') || src.includes('class="g"') || src.includes("WlyYGe")) {
      console.log("✅ CAPTCHA solved! Resuming...");
      return true;
    }
  }
  console.log("❌ CAPTCHA not solved in time. Moving on.");
  return false;
}

// ─── MAIN SEARCH FUNCTION ─────────────────────────────────────────────────────

/**
 * Searches Google News broadly for `query`, then filters results to only
 * articles from the user-selected `sources`.
 *
 * @param {string}   query         - Search term(s)
 * @param {string[]} sources       - Array of source labels (e.g. ["Aaj Tak", "NDTV"])
 * @param {Date|null} fromDate     - Start of date range
 * @param {Date|null} toDate       - End of date range
 * @param {number}   maxPages      - Max Google results pages to scan (default 5)
 */
async function searchNews(query, sources, fromDate, toDate, maxPages = 5) {
  const results = [];
  const seen = new Set();

  // Build the set of allowed domains from the selected source labels
  const allowedDomains = new Set(
    sources
      .map(s => SOURCE_DOMAINS[s])
      .filter(Boolean)
  );

  // If no sources are mapped, fall back to ALL known domains
  const domainFilter = allowedDomains.size > 0 ? allowedDomains : new Set(Object.values(SOURCE_DOMAINS));

  console.log(`\n🔍 Query: "${query}"`);
  console.log(`📋 Filtering to ${domainFilter.size} allowed domain(s) from ${sources.length} selected source(s).`);
  console.log(`📄 Will scan up to ${maxPages} page(s) of Google News results.\n`);

  const driver = await createDriver();

  try {
    let start = 0;
    let consecutiveEmpty = 0;

    for (let page = 0; page < maxPages; page++) {
      const url = buildUrl(query, fromDate, toDate, start);
      console.log(`Page ${page + 1}/${maxPages}: Fetching ${url}`);

      await driver.get(url);

      // Give the page a moment to start rendering
      await sleep(3000);

      // Wait for page to have loaded external links (works regardless of Google's class names)
      let pageLoaded = false;
      try {
        await driver.wait(async () => {
          const count = await driver.executeScript(
            "return document.querySelectorAll('a[href]').length"
          );
          return count > 10;
        }, 30000);
        pageLoaded = true;
      } catch (e) {
        const src = await driver.getPageSource();
        if (src.includes("captcha") || src.includes("unusual traffic") || src.includes("detected unusual")) {
          pageLoaded = await waitForCaptcha(driver);
        } else {
          console.log("  Page did not load properly — stopping.");
          break;
        }
      }

      if (!pageLoaded) break;

      const articles = await extractArticles(driver, domainFilter);

      if (articles.length === 0) {
        consecutiveEmpty++;
        if (consecutiveEmpty >= 2) {
          console.log("  Two consecutive empty pages — stopping early.");
          break;
        }
      } else {
        consecutiveEmpty = 0;
      }

      let newThisPage = 0;
      for (const art of articles) {
        if (seen.has(art.url)) continue;
        seen.add(art.url);
        results.push(art);
        newThisPage++;
      }

      console.log(`  ✔ ${newThisPage} new unique articles added. Running total: ${results.length}`);

      start += 10; // Google News paginates in steps of 10

      if (page < maxPages - 1) {
        // Human-like delay: 5–10s between pages to avoid bot detection
        const wait = 5000 + Math.random() * 5000;
        console.log(`  Waiting ${Math.round(wait / 1000)}s before next page…`);
        await sleep(wait);
      }
    }

  } catch (err) {
    console.error(`Search error:`, err.message);
  } finally {
    console.log("\nClosing browser…");
    await driver.quit();
  }

  console.log(`\n✅ Total unique articles found: ${results.length}`);
  return results;
}

module.exports = { searchNews };