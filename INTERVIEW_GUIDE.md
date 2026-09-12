# NewsHub — Placement Interview Guide & Technical Deep-Dive

This document provides clear, concise, and technically rigorous explanations for the 15 core architectural decisions and interview topics implemented in **NewsHub**.

---

### 1. Why MERN Stack?
- **Unified JavaScript/TypeScript Ecosystem**: A single language across frontend (`React`), backend (`Node/Express`), and database query language (`MongoDB JSON/BSON`) minimizes context switching and enables shared validation models.
- **Component-Driven UI**: React provides a reactive, declarative component model ideal for dynamic feed rendering, optimistic updates, and modular layouts.
- **Event-Driven Non-Blocking I/O**: Node.js and Express handle high-concurrency I/O operations (such as parallel external API aggregation and database querying) with minimal memory overhead.

---

### 2. Why MongoDB for a News Platform?
- **Polymorphic Document Schema**: Different news APIs return slightly different data structures (e.g., GNews vs. NewsAPI vs. RSS). MongoDB's flexible JSON-like documents naturally accommodate varying metadata without requiring complex SQL schema migrations.
- **Fast Indexing on User Interactions**: Compound indexes on `(userId, articleId)` for bookmarks and `(userId, openedAt)` for reading history allow $O(\log N)$ query performance for user feeds.
- **High Read-to-Write Ratio**: MongoDB provides high read throughput and native horizontal sharding capabilities.

---

### 3. How Are External APIs Integrated?
- **Provider Abstraction Pattern**: A `BaseNewsProvider` interface defines core contracts (`getTopHeadlines`, `getCategoryNews`, `searchNews`). Concrete providers (`GNewsProvider`, `NewsApiProvider`, `FallbackNewsProvider`) implement this interface.
- **Graceful Fallover**: If external APIs exceed daily quotas, rate-limit, or experience network timeouts, `NewsService` catches errors and seamlessly falls back to the high-fidelity curated editorial engine without failing the client request.

---

### 4. How Are API Keys Protected?
- **Server-Side Proxy Architecture**: External API keys (`NEWS_API_KEY`, `GNEWS_API_KEY`) are stored exclusively in backend `.env` variables and loaded via `process.env`.
- **Zero Client Exposure**: The React frontend never interacts directly with external news providers; all client requests route through `/api/news/...`.

---

### 5. JWT Authentication Flow
1. User logs in via `POST /api/auth/login`.
2. Server validates credentials with `bcrypt.compare`.
3. Server generates a signed JSON Web Token using `jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })`.
4. Client stores the token in `localStorage` and attaches it to all subsequent requests via an Axios request interceptor (`Authorization: Bearer <token>`).
5. Server `protect` middleware verifies the token signature and attaches the active `req.user`.

---

### 6. Password Hashing with bcrypt
- Passwords are never stored in plaintext.
- The `User` Mongoose schema uses `bcrypt.genSalt(10)` and `bcrypt.hash(password, salt)` to compute a salted cryptographic hash before persisting.
- `select: false` prevents accidental exposure of `passwordHash` in standard database queries.

---

### 7. REST API Architecture & Clean Separation of Concerns
- **Controllers**: Thin request handlers that parse input and format HTTP responses (`authController.js`, `newsController.js`).
- **Services**: Pure business logic, caching, scoring algorithms, and provider coordination (`newsService.js`, `recommendationService.js`, `analyticsService.js`).
- **Models**: Data schema, validation rules, and indexes (`User.js`, `Bookmark.js`, `ReadingHistory.js`, `Interaction.js`).
- **Middleware**: Cross-cutting concerns (`auth.js`, `rateLimiter.js`, `errorHandler.js`).

---

### 8. Explain the Recommendation Algorithm
The platform implements an explainable, rule-based weighted scoring formula:

$$\text{Final Score} = (\text{Topic Match} \times 0.50) + (\text{Recency} \times 0.25) + (\text{Reading Habit} \times 0.15) + (\text{Publisher Trust} \times 0.10)$$

- **Topic Match (+50 max)**: Checks if the article category or title keyword matches the user's selected interests.
- **Recency (+25 max)**: Assigns highest points to fresh dispatches published under 2 hours ago.
- **Reading Habit (+15 max)**: Aggregates the user's past 50 read articles and boosts categories read $\ge 5$ times.
- **Publisher Trust (+10 max)**: Matches user's preferred source list (e.g. *The Hindu*, *Mint*, *The Verge*).
- **Explainability**: Each calculation appends human-readable tags (e.g., `"+50 Matched topic 'AI'"`, `"+25 Fresh dispatch (<2h ago)"`), rendered directly in the UI.

---

### 9. Caching Strategy
- External news APIs enforce strict rate limits.
- `MemoryCache` implements an in-memory TTL store with `get`, `set`, and `del` methods.
- Requests to `/api/news/top` and `/api/news/category` are cached with a 10-minute TTL (`600s`).
- Search queries are cached with a 5-minute TTL (`300s`).
- The interface is Redis-compatible, allowing seamless swapping with Redis Cloud in production.

---

### 10. Rate Limiting & Security
- `express-rate-limit` prevents brute-force login attacks (max 30 attempts per 15 min on `/api/auth/*`) and DDoS attacks (max 150 requests per 15 min on `/api/*`).
- `helmet` sets HTTP security headers (`Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`).
- `cors` restricts origins to approved client endpoints.

---

### 11. Pagination Architecture
- Endpoints accept `page` and `limit` parameters.
- Utilizes MongoDB `.skip((page - 1) * limit).limit(limit)` and returns `totalResults`, `page`, and `totalPages` to enable scalable client pagination without excessive payload sizes.

---

### 12. Debounced Search Implementation
- In `Search.jsx`, a `useEffect` timer (300ms) buffers user keystrokes.
- Prevents firing an HTTP request on every individual keystroke, reducing server load by ~80% during rapid typing.

---

### 13. Optimistic UI Updates
- In `bookmarkStore.js`, clicking the bookmark icon immediately toggles the local `bookmarkIds` Set, delivering an instantaneous UI transition ($0\text{ms}$).
- The API call executes in the background; if the server request fails, the local state automatically rolls back.

---

### 14. Analytics Visualization
- `analyticsService.js` aggregates user reading logs using MongoDB Aggregation Pipelines:
  - Groups logs across the past 7 days to calculate daily reading frequency.
  - Groups logs by category to compute topic distribution percentages.
- Rendered on the frontend using responsive `Recharts` (`BarChart` and `PieChart`).

---

### 15. Deployment Readiness
- Frontend configured for one-click static hosting on **Vercel** or **Netlify**.
- Express backend configured with environment-based configuration for deployment on **Render**, **Railway**, or **AWS ECS**.
- Database ready for connection to **MongoDB Atlas** via `MONGODB_URI`.
