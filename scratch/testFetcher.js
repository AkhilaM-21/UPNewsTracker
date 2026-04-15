const path = require("path");
const { searchNews } = require(path.join(__dirname, "../backend/rssFetcher"));

async function test() {
  try {
    console.log("Starting test search...");
    const results = await searchNews("test", ["Aaj Tak"], null, null, 1);
    console.log("Results found:", results.length);
    process.exit(0);
  } catch (err) {
    console.error("TEST FAILED:", err);
    process.exit(1);
  }
}

test();
