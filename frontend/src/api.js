const BASE = import.meta.env.VITE_API_URL || "https://avenue-attention-suggestions-alabama.trycloudflare.com";

export async function analyzeArticles(sources, keywords = "", fromDate = null, toDate = null, translate = false) {
  const res = await fetch(`${BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sources, keywords, fromDate, toDate, translate }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
