const BaseNewsProvider = require('./baseProvider');
const { normalizeArticle } = require('../../utils/normalizer');

const CURATED_NEWS_DATA = [
  // ================= INDIA NEWS DISPATCHES =================
  // INDIA - TECH & AI
  {
    externalId: "art-in-tech-01",
    title: "India Semiconductor Mission: First Commercial 28nm Fabrication Facility Begins Pilot Wafers in Dholera",
    description: "The multi-billion dollar semiconductor ecosystem in Gujarat achieves a historic milestone as domestic test chips demonstrate sub-micron yield targets.",
    content: "India's semiconductor ambitions moved from policy blueprint to silicon reality today as cleanroom operations commenced at the Dholera Special Investment Region. The joint venture facility is slated to ramp to fifty thousand wafer starts per month, catering to automotive power chips and 5G communication microcontrollers.",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    sourceName: "Mint",
    sourceUrl: "https://www.livemint.com",
    articleUrl: "https://www.livemint.com/technology/semiconductor-mission-dholera-fab-pilot",
    author: "Prashant K. Rao",
    publishedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25m ago
    category: "technology",
    country: "in",
    region: "india",
    language: "en"
  },
  {
    externalId: "art-in-tech-02",
    title: "Sovereign AI Compute Stack: Centre Approves 10,000 GPU GPU-as-a-Service Grid for Indian Startups",
    description: "The IndiaAI mission partners with domestic data centers in Bengaluru and Navi Mumbai to offer subsidized high-performance compute for Indic large language models.",
    content: "Under the national AI framework, Indian startups and academic researchers can now tap into high-bandwidth H100 clusters at nominal tariffs to train foundational models across twenty-two scheduled Indian languages.",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    sourceName: "The Economic Times",
    sourceUrl: "https://economictimes.indiatimes.com",
    articleUrl: "https://economictimes.indiatimes.com/tech/india-ai-gpu-compute-infrastructure",
    author: "Ananya Sengupta",
    publishedAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    category: "ai",
    country: "in",
    region: "india",
    language: "en"
  },
  {
    externalId: "art-in-tech-03",
    title: "Bengaluru DeepTech Lab Releases Open Multilingual Voice LLM Benchmarked for Indian Dialects",
    description: "Sarvam and open research groups roll out lightweight acoustic models providing real-time speech translation across Hindi, Tamil, Telugu, and Bengali.",
    content: "The breakthroughs allow developers to embed edge-voice assistants in rural fintech and agricultural advisory apps with ultra-low latency on entry-level smartphones.",
    imageUrl: "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=1200&q=80",
    sourceName: "YourStory",
    sourceUrl: "https://yourstory.com",
    articleUrl: "https://yourstory.com/2026/09/indic-voice-ai-multilingual-models",
    author: "Vishal Krishna",
    publishedAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    category: "ai",
    country: "in",
    region: "india",
    language: "en"
  },

  // INDIA - STARTUPS & BUSINESS
  {
    externalId: "art-in-biz-01",
    title: "UPI Cross-Border Network Expands to 15 Nations as Instant QR Settlements Go Live Across Asia & Europe",
    description: "NPCI International enables seamless real-time rupee merchant payments across Singapore, UAE, France, and Japan, lowering foreign transaction fees.",
    content: "Indian travelers and overseas diaspora can now settle instant retail transactions via standard UPI handles across over 100,000 international merchant terminals without incurring currency conversion spreads.",
    imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
    sourceName: "The Hindu",
    sourceUrl: "https://www.thehindu.com",
    articleUrl: "https://www.thehindu.com/business/upi-cross-border-payments-expansion",
    author: "Rakesh Mohan",
    publishedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    category: "business",
    country: "in",
    region: "india",
    language: "en"
  },
  {
    externalId: "art-in-biz-02",
    title: "Indian EV Battery Gigafactory in Tamil Nadu Rolls Out First Solid-State Prismatic Cells",
    description: "Domestic clean-tech manufacturing receives a boost with localized cathode processing, reducing reliance on raw mineral imports by 60 percent.",
    content: "The 20 GWh energy storage plant in Hosur confirmed commercial supply agreements with top two-wheeler and commercial bus manufacturers, marking a key milestone in India's electric mobility transition.",
    imageUrl: "https://images.unsplash.com/photo-1558441719-8b489c634a10?auto=format&fit=crop&w=1200&q=80",
    sourceName: "Business Standard",
    sourceUrl: "https://www.business-standard.com",
    articleUrl: "https://www.business-standard.com/companies/news/tamil-nadu-ev-battery-gigafactory",
    author: "Kavitha Murthy",
    publishedAt: new Date(Date.now() - 1000 * 60 * 130).toISOString(),
    category: "startups",
    country: "in",
    region: "india",
    language: "en"
  },
  {
    externalId: "art-in-biz-03",
    title: "Sensex Crosses Record Milestone Led by Domestic Institutional Inflows and Capital Goods Surge",
    description: "Robust quarterly earnings from manufacturing conglomerates and public sector banks propel Indian equity indices to fresh all-time highs.",
    content: "Systematic investment plan (SIP) contributions reached a record monthly tally of ₹24,000 crore, providing immense domestic liquidity cushion against global monetary tightening cycles.",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
    sourceName: "Moneycontrol",
    sourceUrl: "https://www.moneycontrol.com",
    articleUrl: "https://www.moneycontrol.com/news/business/markets/sensex-nifty-all-time-high-record",
    author: "Deepak Shenoy",
    publishedAt: new Date(Date.now() - 1000 * 60 * 190).toISOString(),
    category: "business",
    country: "in",
    region: "india",
    language: "en"
  },

  // INDIA - SPACE & SCIENCE
  {
    externalId: "art-in-sci-01",
    title: "ISRO Gaganyaan: Uncrewed Orbital Flight Test Successfully Validates Crew Escape and Re-entry Module",
    description: "The Indian Space Research Organisation achieves precision ocean recovery in the Bay of Bengal following hypersonic atmospheric re-entry trials.",
    content: "ISRO Chairman announced that all life-support simulation parameters and automated parachute deployments functioned with zero deviation. The milestone clears the deck for India's historic maiden astronaut flight next year.",
    imageUrl: "https://images.unsplash.com/photo-1517976487502-869f697491cf?auto=format&fit=crop&w=1200&q=80",
    sourceName: "NDTV",
    sourceUrl: "https://www.ndtv.com",
    articleUrl: "https://www.ndtv.com/india-news/isro-gaganyaan-orbital-test-flight-success",
    author: "Pallava Bagla",
    publishedAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    category: "science",
    country: "in",
    region: "india",
    language: "en"
  },
  {
    externalId: "art-in-sci-02",
    title: "Indian Institute of Science Unveils Low-Cost Indigenous CAR-T Cell Cancer Therapy",
    description: "Affordable gene-modified immunotherapy shows 88% clinical remission rates in pediatric leukemia trials at Tata Memorial Hospital.",
    content: "Manufactured at one-tenth the cost of Western equivalents, the indigenously engineered therapeutic opens revolutionary cellular oncology access to millions across South Asia.",
    imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
    sourceName: "The Indian Express",
    sourceUrl: "https://indianexpress.com",
    articleUrl: "https://indianexpress.com/article/technology/science/iisc-car-t-cell-therapy-trials",
    author: "Dr. Shreya Roy",
    publishedAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
    category: "health",
    country: "in",
    region: "india",
    language: "en"
  },

  // INDIA - SPORTS & CRICKET
  {
    externalId: "art-in-spt-01",
    title: "India Clinches Thrilling Decider to Secure World Test Championship Final Berth",
    description: "A masterful bowling spell on Day 5 seals a memorable victory before a euphoric home crowd at Eden Gardens.",
    content: "Disciplined seam bowling in humid conditions shattered the opposition's lower order, securing an unassailable series lead and guaranteeing India's ticket to Lord's for the championship final.",
    imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80",
    sourceName: "ESPNcricinfo",
    sourceUrl: "https://www.espncricinfo.com",
    articleUrl: "https://www.espncricinfo.com/series/india-wtc-final-qualification-eden-gardens",
    author: "Harsha Bhogle",
    publishedAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    category: "sports",
    country: "in",
    region: "india",
    language: "en"
  },
  {
    externalId: "art-in-spt-02",
    title: "Neeraj Chopra Wins Diamond League Javelin Title with 90.20m Monster Throw",
    description: "The Olympic double medalist breaks the elusive 90-meter barrier in his third attempt, setting a new national and Asian record.",
    content: "With a flawless rhythmic run-up and explosive release, Chopra dominated the elite field in Zurich, cementing his status among the all-time greats of modern track and field.",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    sourceName: "Hindustan Times",
    sourceUrl: "https://www.hindustantimes.com",
    articleUrl: "https://www.hindustantimes.com/sports/athletics/neeraj-chopra-diamond-league-90m",
    author: "Abhishek Mukherjee",
    publishedAt: new Date(Date.now() - 1000 * 60 * 160).toISOString(),
    category: "sports",
    country: "in",
    region: "india",
    language: "en"
  },

  // INDIA - POLITICS & POLICY
  {
    externalId: "art-in-pol-01",
    title: "Parliamentary Standing Committee Table Unified Digital Public Infrastructure Bill",
    description: "New legislative statute codifies open interoperable protocols across health data, unified logistics, and verifiable digital credentials.",
    content: "The framework establishes strict privacy guardrails for citizen consent while fostering non-monopolistic competition among enterprise fintech and healthtech service providers.",
    imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
    sourceName: "The Hindu",
    sourceUrl: "https://www.thehindu.com",
    articleUrl: "https://www.thehindu.com/news/national/digital-public-infrastructure-bill",
    author: "Venkatesh Ramakrishnan",
    publishedAt: new Date(Date.now() - 1000 * 60 * 260).toISOString(),
    category: "politics",
    country: "in",
    region: "india",
    language: "en"
  },

  // INDIA - CINEMA & ENTERTAINMENT
  {
    externalId: "art-in-ent-01",
    title: "71st National Film Awards: Epic Historical Drama and Groundbreaking Indie Sweeps Major Honors",
    description: "Jury celebrates cinematic mastery across Malayalam, Hindi, and Tamil film industries with record accolades for acoustic engineering and cinematography.",
    content: "The ceremony held at Vigyan Bhavan recognized technical brilliance, with independent regional directors receiving standing ovations for realistic narrative storytelling.",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
    sourceName: "NDTV",
    sourceUrl: "https://www.ndtv.com",
    articleUrl: "https://www.ndtv.com/entertainment/national-film-awards-winners-list",
    author: "Siddhant Adlakha",
    publishedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    category: "entertainment",
    country: "in",
    region: "india",
    language: "en"
  },

  // ================= GLOBAL NEWS DISPATCHES =================
  // GLOBAL - TECH & AI
  {
    externalId: "art-glob-tech-01",
    title: "The Next Architectural Shift in Foundation Models: Multimodal Reasoning at Scale",
    description: "Researchers unveil new transformer paradigms designed to reduce latency while delivering near-instantaneous chain-of-thought verification across audio, vision, and code.",
    content: "Foundation models are undergoing their most consequential architectural evolution since the introduction of attention mechanisms. By integrating native multi-token prediction and sparse expert routing, the next generation of reasoning engines accomplishes complex deductions in fractions of a second.",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    sourceName: "The Verge",
    sourceUrl: "https://www.theverge.com",
    articleUrl: "https://www.theverge.com/tech/ai-multimodal-reasoning-breakthrough",
    author: "Elena Rostova",
    publishedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    category: "ai",
    country: "us",
    region: "global",
    language: "en"
  },
  {
    externalId: "art-glob-tech-02",
    title: "Quantum Chipmakers Achieve Sub-Nanosecond Error Correction Benchmarks",
    description: "A major hardware consortium demonstrates fault-tolerant logical qubits operating at room-temperature interfaces, marking a milestone for commercial quantum computing.",
    content: "Silicon-based topological qubits reached a pivotal milestone today as automated cryogenic error suppression algorithms sustained coherence across two thousand quantum state cycles.",
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80",
    sourceName: "Wired",
    sourceUrl: "https://www.wired.com",
    articleUrl: "https://www.wired.com/story/quantum-error-correction-milestone",
    author: "Marcus Vance",
    publishedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    category: "technology",
    country: "us",
    region: "global",
    language: "en"
  },
  // GLOBAL - BUSINESS & WORLD
  {
    externalId: "art-glob-biz-01",
    title: "Global Venture Capital Rebounds as Seed Stage Tech Valuations Stabilize",
    description: "Early-stage software and clean energy startups secure $42 billion in second-quarter financing, driven by disciplined unit economics and real revenue generation.",
    content: "After two years of valuation compression, institutional seed and Series A funds are aggressively deploying capital into capital-efficient enterprise SaaS and spatial computing startups.",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    sourceName: "Bloomberg",
    sourceUrl: "https://www.bloomberg.com",
    articleUrl: "https://www.bloomberg.com/news/articles/venture-capital-q2-rebound-surge",
    author: "David Sterling",
    publishedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    category: "business",
    country: "us",
    region: "global",
    language: "en"
  },
  {
    externalId: "art-glob-world-01",
    title: "Global Clean Energy Pact Establishes Intercontinental Green Hydrogen Corridor",
    description: "Twenty-four nations ratify binding infrastructure standards to transport desalinated solar hydrogen across Mediterranean and Indo-Pacific maritime routes.",
    content: "The historic treaty signed in Geneva mandates synchronized safety protocols, subsidy parity, and dedicated tanker retrofits to establish a global trade network for zero-emission industrial fuels by 2030.",
    imageUrl: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80",
    sourceName: "Reuters",
    sourceUrl: "https://www.reuters.com",
    articleUrl: "https://www.reuters.com/sustainability/green-hydrogen-corridor-treaty-geneva",
    author: "Jean-Pierre Dubois",
    publishedAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    category: "world",
    country: "ch",
    region: "global",
    language: "en"
  },
  {
    externalId: "art-glob-sci-01",
    title: "James Webb Space Telescope Identifies Atmospheric Water Vapor on Temperate Exoplanet",
    description: "High-precision spectroscopy reveals a stable hydrological cycle on a rocky super-Earth orbiting within its star's habitable zone.",
    content: "Astrophysicists analyzing transmission spectra from planet LHS-1140b detected unambiguous signatures of water vapor and nitrogen clouds, representing the closest analogue to early Earth.",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    sourceName: "Nature",
    sourceUrl: "https://www.nature.com",
    articleUrl: "https://www.nature.com/articles/jwst-exoplanet-atmosphere-water-cycle",
    author: "Dr. Alistair Thorne",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    category: "science",
    country: "us",
    region: "global",
    language: "en"
  }
];

class FallbackNewsProvider extends BaseNewsProvider {
  constructor() {
    super('CuratedEditorial');
    this.articles = CURATED_NEWS_DATA.map(normalizeArticle);
  }

  filterByRegion(articles, region) {
    if (!region || region === 'all') return articles;
    const r = region.toLowerCase();
    if (r === 'india') {
      return articles.filter(a => a.region === 'india' || a.country === 'in');
    }
    if (r === 'global') {
      return articles.filter(a => a.region === 'global' || a.country !== 'in');
    }
    return articles;
  }

  async getTopHeadlines(options = {}) {
    const limit = parseInt(options.limit, 10) || 20;
    const page = parseInt(options.page, 10) || 1;
    const region = options.region || (options.country === 'in' ? 'india' : 'all');
    
    let candidateArticles = this.filterByRegion(this.articles, region);

    // If category is provided
    if (options.category && options.category !== 'all') {
      const cat = options.category.toLowerCase();
      candidateArticles = candidateArticles.filter(a => a.category.toLowerCase() === cat);
    }

    // Sort latest first
    const sorted = [...candidateArticles].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    const startIndex = (page - 1) * limit;
    const paginated = sorted.slice(startIndex, startIndex + limit);

    return {
      provider: this.name,
      region: region || 'all',
      totalResults: candidateArticles.length,
      page,
      limit,
      articles: paginated
    };
  }

  async getCategoryNews(category, options = {}) {
    return this.getTopHeadlines({ ...options, category });
  }

  async searchNews(query, options = {}) {
    const q = (query || '').toLowerCase().trim();
    const limit = parseInt(options.limit, 10) || 20;
    const page = parseInt(options.page, 10) || 1;
    const category = options.category ? options.category.toLowerCase() : null;
    const source = options.source ? options.source.toLowerCase() : null;
    const region = options.region || 'all';

    let pool = this.filterByRegion(this.articles, region);

    let filtered = pool.filter(a => {
      const matchText = `${a.title} ${a.description} ${a.author} ${a.sourceName}`.toLowerCase();
      const textMatches = !q || matchText.includes(q);
      const catMatches = !category || category === 'all' || a.category.toLowerCase() === category;
      const sourceMatches = !source || a.sourceName.toLowerCase().includes(source);
      return textMatches && catMatches && sourceMatches;
    });

    if (options.sortBy === 'relevance' && q) {
      filtered.sort((a, b) => {
        const scoreA = (a.title.toLowerCase().includes(q) ? 2 : 0) + (a.description.toLowerCase().includes(q) ? 1 : 0);
        const scoreB = (b.title.toLowerCase().includes(q) ? 2 : 0) + (b.description.toLowerCase().includes(q) ? 1 : 0);
        return scoreB - scoreA;
      });
    } else {
      filtered.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    }

    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      provider: this.name,
      query: q,
      region,
      totalResults: filtered.length,
      page,
      limit,
      articles: paginated
    };
  }

  async getArticleById(id) {
    return this.articles.find(a => a.id === id || a.externalId === id) || null;
  }
}

module.exports = FallbackNewsProvider;
