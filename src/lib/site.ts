// ------------------------------------------------------------------
// Shared site content — used by the footer, FAQ section, and search.
// ------------------------------------------------------------------

/** Shown in the footer as "Last updated". Bump this whenever content ships. */
export const LAST_UPDATED = "August 18, 2026";

// ------------------------------------------------------------------
// FAQ
// ------------------------------------------------------------------
export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How much do your services cost?",
    answer:
      "Pricing depends on scope. Branding and design packages are quoted per project, and our paid-campaign management is transparent: a one-time setup fee plus a flat 20% of ad spend (minimum AED 3,650/month) — use the calculator on our Services page to see exact numbers.",
  },
  {
    question: "How long does a typical website take?",
    answer:
      "Most custom websites go live in 2–4 weeks depending on the number of pages and integrations. We share a clear timeline during the Brief phase and stick to it — no rushed handoffs, no missing pieces.",
  },
  {
    question: "Do you work with international clients?",
    answer:
      "Yes. We're based in Karachi but work with clients across the UAE, Pakistan, and beyond. All communication, calls, and delivery happen remotely with daily updates.",
  },
  {
    question: "What does the process look like?",
    answer:
      "Five phases: Brief → Strategy → Create → Launch → Grow. We listen first, map the roadmap, produce the work to a premium standard, launch properly, then keep optimizing to compound results.",
  },
  {
    question: "Do you offer ongoing support after launch?",
    answer:
      "Yes. Every project includes a support window after launch, and we offer monthly retainers for maintenance, content updates, reporting, and continuous optimization.",
  },
  {
    question: "How do we get started?",
    answer:
      "Fill out the contact form below and we'll reply within 24 hours. We'll set up a quick kickoff call to walk through your goals, audience, and what success looks like — then give you a clear, fixed quote.",
  },
];

// ------------------------------------------------------------------
// Site search index
// ------------------------------------------------------------------
export interface SearchItem {
  href: string;
  title: string;
  section: string;
  description: string;
  keywords?: string[];
}

export const SEARCH_INDEX: SearchItem[] = [
  {
    href: "/",
    title: "Home",
    section: "Page",
    description: "HKH Agency — scale your brand with conversion-focused campaigns",
    keywords: ["home", "agency", "intro", "hero"],
  },
  {
    href: "/services",
    title: "Services",
    section: "Page",
    description: "Walkthrough of every service we offer",
    keywords: ["services", "offerings", "what we do"],
  },
  {
    href: "/contact",
    title: "Contact",
    section: "Page",
    description: "Get a free quote — we reply within 24 hours",
    keywords: ["contact", "quote", "inquiry", "get in touch"],
  },
  {
    href: "/#how-we-work",
    title: "How We Work",
    section: "Home",
    description: "Our Brief → Strategy → Create → Launch → Grow framework",
    keywords: ["process", "framework", "phases", "pipeline"],
  },
  {
    href: "/#our-work",
    title: "Case Studies",
    section: "Home",
    description: "Proven results for UF Makeup, Visa Agency, Iqra University and more",
    keywords: ["portfolio", "work", "results", "case studies"],
  },
  {
    href: "/#reviews",
    title: "Client Reviews",
    section: "Home",
    description: "What partners say about working with us",
    keywords: ["reviews", "testimonials", "feedback", "partners"],
  },
  {
    href: "/#team",
    title: "Team",
    section: "Home",
    description: "Hafeez Farooq (CEO) and Hasan Shahir (Lead Developer)",
    keywords: ["team", "people", "about", "founder", "crew"],
  },
  {
    href: "/services#graphic-design",
    title: "Graphic Design",
    section: "Service",
    description: "Visual assets engineered to convert attention into action",
    keywords: ["design", "graphics", "banners", "landing pages", "pitch decks"],
  },
  {
    href: "/services#branding",
    title: "Branding",
    section: "Service",
    description: "Corporate identity packages that command a premium",
    keywords: ["brand", "logo", "identity", "style guide", "fonts"],
  },
  {
    href: "/services#social-media-marketing",
    title: "Social Media Marketing",
    section: "Service",
    description: "Organic and paid social funnels built for retention",
    keywords: ["social media", "instagram", "facebook", "content", "reels"],
  },
  {
    href: "/services#website-development",
    title: "Website Development",
    section: "Service",
    description: "High-performance custom code built for search engines & sales",
    keywords: ["website", "web", "development", "next.js", "react", "seo"],
  },
  {
    href: "/services#app-development",
    title: "App Development",
    section: "Service",
    description: "Modern cross-platform mobile apps for iOS and Android",
    keywords: ["app", "mobile", "ios", "android", "cross-platform"],
  },
  {
    href: "/services#ppc-calculator",
    title: "PPC / Ad Spend Calculator",
    section: "Services",
    description: "Calculate your monthly investment for paid campaigns",
    keywords: ["ppc", "ads", "calculator", "budget", "pricing", "cost"],
  },
  {
    href: "/contact#faq",
    title: "FAQ — pricing, timelines, process",
    section: "Contact",
    description: "Answers about cost, delivery time, support and getting started",
    keywords: ["faq", "questions", "help", "cost", "timeline", "support"],
  },
  {
    href: "/contact",
    title: "Get a Free Quote",
    section: "Contact",
    description: "Start a project with us today",
    keywords: ["quote", "free", "start", "project", "inquiry"],
  },
];
