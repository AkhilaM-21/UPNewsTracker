# UP Politics Media Tracker — Free Edition (No API Key)

Full-stack media sentiment dashboard for Uttar Pradesh politics.
**Zero paid APIs. Zero API keys. 100% free to run.**

---

## How It Works — No API Key Needed

| Layer | Technology | Cost |
|-------|-----------|------|
| Article Fetching | Google News RSS feeds | Free |
| Sentiment Analysis | `sentiment` npm package (AFINN, runs locally) | Free |
| Topic Extraction | Keyword matching (local) | Free |
| Frontend | React + Vite → Vercel | Free tier |
| Backend | Node.js + Express → Render | Free tier |

---

## Project Structure

```
up-tracker/
├── backend/
│   ├── server.js            ← Express API
│   ├── rssFetcher.js        ← Google News RSS parser
│   ├── sentimentEngine.js   ← Local AFINN sentiment + topic extractor
│   ├── package.json
│   ├── .env.example
│   └── render.yaml
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── api.js
    │   └── components/
    │       ├── ControlsBar.jsx
    │       ├── Dashboard.jsx
    │       ├── SourceTable.jsx
    │       ├── SentimentDonut.jsx
    │       ├── SentimentByDate.jsx
    │       ├── TrendingTopics.jsx
    │       └── ArticlesModal.jsx
    ├── index.html
    ├── vite.config.js
    ├── vercel.json
    └── .env.example
```

---

## Local Development

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev        # http://localhost:4000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local   # VITE_API_URL=http://localhost:4000
npm run dev                  # http://localhost:5173
```

Test the backend directly:
```bash
curl -X POST http://localhost:4000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"sources":["NDTV","Times of India"],"keywords":"Yogi Adityanath"}'
```

---

## Deploy Backend → Render (Free)

1. Push the repo to GitHub.
2. Go to **render.com** → New → **Web Service** → connect repo.
3. Set **Root Directory** = `backend`
4. Confirm settings:
   - **Build command**: `npm install`
   - **Start command**: `npm start`
   - **Instance type**: Free
5. Add one environment variable:
   | Key | Value |
   |-----|-------|
   | `FRONTEND_URL` | *(leave blank for now)* |
6. Click **Deploy**. Note your URL, e.g. `https://up-tracker-backend.onrender.com`

> Render free tier sleeps after 15 min of inactivity — first request takes ~30s to wake up.

---

## Deploy Frontend → Vercel (Free)

1. Go to **vercel.com** → New Project → import same repo.
2. Set **Root Directory** = `frontend`
3. Add environment variable:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://up-tracker-backend.onrender.com` |
4. Click **Deploy**. Note your URL, e.g. `https://up-tracker.vercel.app`

---

## Final Step — Update CORS

Back in **Render → Environment**, set:
```
FRONTEND_URL = https://up-tracker.vercel.app
```
Click **Manual Deploy → Deploy latest commit**.

---

## Features

- **25 media sources** across Hindi TV, English TV, Print, Digital, UP Regional
- **Category quick-select** — toggle all sources in a category at once
- **Extra keyword search** — narrow results further
- **Source table** — Positive / Negative / Neutral / Politically Relevant per source
- **Sentiment donut** — overall breakdown with live percentages
- **Sentiment by date** — Positive vs Negative trend over time
- **Trending topics bar chart** — top 16 political tags
- **Article modal** — click any source row to see all its articles with live links and score bars

---

## API Reference

### POST /api/analyze

```json
// Request
{ "sources": ["NDTV", "Aaj Tak"], "keywords": "UP elections" }

// Response
{
  "articles": [
    {
      "title": "...",
      "source": "NDTV",
      "date": "2024-04-07",
      "url": "https://ndtv.com/...",
      "summary": "...",
      "sentiment": "positive",
      "sentiment_score": 0.42,
      "politically_relevant": true,
      "topics": ["Elections", "BJP"]
    }
  ],
  "count": 38
}
```

### GET /health
Returns `{ status: "ok", time: "..." }` — useful to wake up the Render free instance before a demo.
