# NewsHub — Personalized News & Editorial Discovery Platform

A full-stack, production-quality news aggregation, recommendation, and reading platform built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) with Tailwind CSS and an editorial aesthetic. NewsHub delivers an **India-First** national dispatch feed alongside a dedicated **Read-Only Global News** mode.

---

## 🌟 Key Features

- 🇮🇳 **India-First Edition & Regional Scoping**:
  - Deep coverage across Indian Tech, AI (Sarvam, Indic LLMs), Bengaluru/NCR Startups, RBI & Sensex Markets, ISRO Gaganyaan & Chandrayaan missions, WTC Cricket & Athletics, National Digital Policy, and Indian Cinema.
  - Indian journalism network: *The Hindu*, *Mint*, *The Economic Times*, *Indian Express*, *NDTV*, *YourStory*, *Moneycontrol*, *ESPNcricinfo*, *Business Standard*.
- 🌐 **Read-Only Global News Mode**:
  - Instant 1-click toggle to switch into a pure international wire (*The Verge*, *Bloomberg*, *Reuters*, *Nature*, *Wired*, *Financial Times*).
- 🧠 **Explainable Recommendation Engine**:
  - Transparent rule-based scoring formula:
    $$\text{Score} = (\text{InterestMatch} \times 0.50) + (\text{Recency} \times 0.25) + (\text{ReadingHabit} \times 0.15) + (\text{PublisherTrust} \times 0.10)$$
  - Displays explicit match reasons on every article (e.g. `+50 Matched topic "AI"`, `+25 Fresh dispatch (<2h ago)`).
- 📰 **Editorial Design Aesthetics**:
  - Clean serif typography pairing, restrained 1px borders, subtle hover zooms, warm neutral background (`#FAFAF9` / `#121212`), high contrast dark mode, zero noisy clutter.
- ⚡ **Performance & API Protection**:
  - Multi-provider abstraction (GNews, NewsAPI, Curated Editorial Fallback).
  - In-memory TTL caching layer (Redis-ready) to preserve API rate limits.
  - Debounced global search across keywords, sources, categories, and regional editions.
- 🔖 **Personal Archive & Analytics**:
  - Instant optimistic bookmarking with offline persistence.
  - Chronologically grouped reading history (Today, Yesterday, Earlier).
  - User profile journalism engagement dashboard powered by Recharts (Weekly reading frequency & category distributions).
- 🔒 **Security & Authentication**:
  - JWT authentication with secure HTTP headers via Helmet, bcrypt password hashing, input sanitization, and express rate limiters.

---

## 🏗 Architecture & Tech Stack

```
                     ┌─────────────────────────────┐
                     │   React 18 + Vite Frontend   │
                     │  - Tailwind CSS + Lucide     │
                     │  - Zustand State Management  │
                     │  - Recharts Visualizations   │
                     └──────────────┬──────────────┘
                                    │ REST API (JWT)
                                    ▼
                     ┌─────────────────────────────┐
                     │     Express.js API Server   │
                     │  - Helmet + Rate Limiter    │
                     │  - In-Memory TTL Cache      │
                     │  - Recommendation Engine    │
                     └──────┬───────────────┬──────┘
                            │               │
                            ▼               ▼
                 ┌──────────────────┐ ┌───────────────────────────┐
                 │ MongoDB Database │ │  External News Providers  │
                 │ - Users & Topics │ │  - GNews / NewsAPI        │
                 │ - Bookmarks      │ │  - Indian Fallback Engine │
                 │ - History Logs   │ └───────────────────────────┘
                 └──────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (v6.0+) running on `localhost:27017`

### Installation

1. **Clone and Install Dependencies**:
```bash
# Install root, server, and client dependencies
npm --prefix server install
npm --prefix client install
```

2. **Configure Environment Variables**:
Check `server/.env` (defaults are provided for immediate local execution):
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/newshub
JWT_SECRET=newshub_super_secret_jwt_key_2026_interview_ready_safe
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CACHE_TTL_SECONDS=600

# Optional External News Keys
GNEWS_API_KEY=
NEWS_API_KEY=
```

3. **Run the Application**:
```bash
# Start Backend Server (Port 5001)
npm --prefix server start

# Start Frontend Dev Server (Port 5173)
npm --prefix client run dev
```

Visit **http://localhost:5173** in your browser.

---

## 🧪 Testing

To execute the automated backend test suite (16 test cases covering auth, news normalization, recommendations, bookmarks, history, and analytics):

```bash
npm --prefix server test
```

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user & return JWT | No |
| `POST` | `/api/auth/login` | Login user & return JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated user | Yes |
| `GET` | `/api/news/top` | Top headlines (supports `?region=india\|global`) | No |
| `GET` | `/api/news/category/:category` | Category dispatches | No |
| `GET` | `/api/news/search` | Search query with debounced filters | No |
| `GET` | `/api/news/personalized` | Tailored feed ranked by scoring engine | Optional |
| `GET` | `/api/news/trending` | Dynamic trending stories | No |
| `GET` | `/api/news/:id` | Article details & related stories | No |
| `GET` | `/api/bookmarks` | Get bookmarked stories | Yes |
| `POST` | `/api/bookmarks` | Save article to bookmarks | Yes |
| `DELETE` | `/api/bookmarks/:articleId` | Remove bookmark | Yes |
| `GET` | `/api/history` | Chronological reading history | Yes |
| `POST` | `/api/history` | Log article reading event | Yes |
| `GET` | `/api/analytics` | Reading activity stats & Recharts data | Yes |
| `PUT` | `/api/users/preferences` | Update followed topics, sources & theme | Yes |

---

## 📄 License
MIT License. Created for production-grade editorial news discovery.
