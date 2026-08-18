"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, useSpring, useTransform } from "framer-motion";
import Reveal from "@/components/Reveal";
import { Stagger, StaggerItem } from "@/components/Stagger";
import TiltCard from "@/components/TiltCard";
import {
  Palette,
  Award,
  Share2,
  Code,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  DollarSign,
  Calculator,
  HelpCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

import { useEffect } from "react";

/** Live-spring number: animates toward the latest value whenever it changes. */
function AnimatedNumber({ value, className = "" }: { value: number; className?: string }) {
  const spring = useSpring(value, { stiffness: 90, damping: 22 });
  const display = useTransform(spring, (v) =>
    Math.round(v).toLocaleString()
  );

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span className={className}>{display}</motion.span>;
}

interface ServiceDetail {
  id: string;
  title: string;
  tagline: string;
  description: string;
  badgeColor: "coral" | "sky";
  icon: any;
  whatsIncluded: string[];
}

export default function ServicesPage() {
  const [adSpend, setAdSpend] = useState<number>(15000);

  const services: ServiceDetail[] = [
    {
      id: "graphic-design",
      title: "Graphic Design",
      tagline: "Visual assets engineered to convert attention into action.",
      description: "We don't make design just to look pretty; we design to sell. Our designs communicate your core value proposition instantly, creating trust and maximizing the impact of your marketing collateral and presentation assets.",
      badgeColor: "coral",
      icon: Palette,
      whatsIncluded: [
        "Landing page visual assets & conversion design",
        "High-impact marketing collaterals (banners, ads, social templates)",
        "Premium pitch deck design & typography systems",
        "Custom vector illustrations & SVG assets",
        "Interactive UI prototypes and design handoffs"
      ]
    },
    {
      id: "branding",
      title: "Branding",
      tagline: "Corporate identity packages that command a premium.",
      description: "A strong brand removes friction from the sales cycle. We create cohesive design languages, logos, and style systems that elevate your business voice above the noise and build immediate consumer authority.",
      badgeColor: "sky",
      icon: Award,
      whatsIncluded: [
        "Premium vector logo sets (horizontal, vertical, mark)",
        "Comprehensive brand style guidebooks (colors, rules, application)",
        "Custom typography scales & font system pairing",
        "Social media identity kits & profile design",
        "Business cards, letterheads & stationary guidelines"
      ]
    },
    {
      id: "social-media-marketing",
      title: "Social Media Marketing",
      tagline: "Organic and paid social funnels built for retention.",
      description: "Social media is your modern storefront. We plan, execute, and monitor conversion-focused social setups that grow and nurture your audience, turning random scrollers into lifelong brand advocates.",
      badgeColor: "coral",
      icon: Share2,
      whatsIncluded: [
        "Strategic channel planning & audience profiling",
        "Weekly content calendars with reels & image assets",
        "High-retention reel script planning & video editing",
        "Direct audience engagement setups & outreach",
        "Weekly reporting dashboards & key metric analysis"
      ]
    },
    {
      id: "website-development",
      title: "Website Development",
      tagline: "High-performance custom code built for search engines & sales.",
      description: "No templates. No slow PageSpeed metrics. We write custom Next.js, React, and HTML/CSS/JS platforms that load instantly, rank natively on Google, and guide users directly to the checkout or lead form.",
      badgeColor: "sky",
      icon: Code,
      whatsIncluded: [
        "Bespoke development with zero template dependency",
        "Full Search Engine Optimization (SEO) structure",
        "Light/Dark theme support and custom animation modules",
        "Mobile-first responsive design integrations",
        "API integrations & custom lead capture databases"
      ]
    },
    {
      id: "app-development",
      title: "App Development",
      tagline: "Modern cross-platform mobile apps for iOS and Android.",
      description: "We design and build clean mobile applications with native feeling, smooth performance, and high-quality UI design. Focused on clean UX, efficient state management, and direct backend APIs.",
      badgeColor: "coral",
      icon: Smartphone,
      whatsIncluded: [
        "Cross-platform development (iOS & Android) with unified codebase",
        "Intuitive UX wireframes & pixel-perfect implementation",
        "Offline caching & lightning-fast database sync",
        "Push notification pipelines & analytics events tracking",
        "App Store & Google Play submission and support"
      ]
    }
  ];

  // PPC Calculations:
  // Setup Fee: AED 3,650 (One-time)
  // First Month Management Fee: Waived
  // Ongoing Management Fee: 20% of ad spend (Min AED 3,650)
  const setupFee = 3650;
  const rawMgmtFee = adSpend * 0.2;
  const ongoingMgmtFee = Math.max(rawMgmtFee, 3650);

  const firstMonthTotal = setupFee; // Waived Management
  const ongoingMonthlyFee = ongoingMgmtFee; // Management fee only

  return (
    <>
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-grow pt-24 md:pt-32 pb-20 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Back link */}
          <Reveal y={16}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border bg-surface text-text rounded-full font-bold text-xs shadow-brutal hover:shadow-brutal-sm hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-150 mb-12 w-fit"
            >
              <ArrowLeft className="w-4 h-4 text-accent-coral" /> Back to Home
            </Link>
          </Reveal>

          {/* Heading */}
          <Reveal delay={0.1}>
            <div className="mb-20">
              <span className="text-sm font-bold text-accent-coral tracking-widest uppercase block mb-2">Our Solutions</span>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-text">
                Services <span className="font-extrabold text-accent-sky">Walkthrough</span>
              </h1>
              <p className="text-text-muted mt-4 text-lg max-w-3xl leading-relaxed">
                Explore the detailed breakdowns of what goes into our work. Every service is tailored, transparent, and direct to the point.
              </p>
            </div>
          </Reveal>

          {/* SERVICES DETAIL WALKTHROUGH */}
          <div className="space-y-24 mb-28">
            {services.map((service, index) => (
              <section
                key={service.id}
                id={service.id}
                className="scroll-mt-28"
              >
                <Reveal x={index % 2 === 0 ? -48 : 48}>
                <TiltCard maxTilt={3} className="h-full">
                <div className="brutalist-card bg-surface p-8 sm:p-12 md:p-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                  
                  {/* Left info col */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center gap-3">
                      <span className={`${service.badgeColor === "coral" ? "brutalist-badge-coral" : "brutalist-badge-sky"} w-14 h-14`}>
                        <service.icon className={`w-6 h-6 ${service.badgeColor === "coral" ? "text-white" : "text-text"}`} />
                      </span>
                      <h2 className="font-display font-bold text-3xl sm:text-4xl text-text">
                        {service.title}
                      </h2>
                    </div>

                    <p className="text-accent-coral font-display font-semibold text-lg italic">
                      "{service.tagline}"
                    </p>

                    <p className="text-text-muted text-sm sm:text-base leading-relaxed">
                      {service.description}
                    </p>

                    <div className="pt-6">
                      <Link
                        href={`/contact?focus=${encodeURIComponent(service.title)}`}
                        className="brutalist-btn brutalist-btn-primary px-8 py-3.5 text-sm"
                      >
                        Inquire about {service.title}
                      </Link>
                    </div>
                  </div>

                  {/* Right checklist col */}
                  <div className="lg:col-span-5 border-t-2 lg:border-t-0 lg:border-l-2 border-border pt-8 lg:pt-0 lg:pl-12 space-y-6">
                    <h3 className="font-display font-bold text-lg text-text tracking-wider uppercase">
                      What's Included:
                    </h3>
                    <Stagger className="space-y-4">
                      {service.whatsIncluded.map((item, idx) => (
                        <StaggerItem key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-accent-sky flex-shrink-0 mt-0.5" />
                          <span className="text-sm font-medium text-text-muted leading-snug">
                            {item}
                          </span>
                        </StaggerItem>
                      ))}
                    </Stagger>
                  </div>

                </div>
                </TiltCard>
                </Reveal>
              </section>
            ))}
          </div>

          {/* PPC CALCULATOR SECTION */}
          <section id="ppc-calculator" className="scroll-mt-28">
            <Reveal>
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-sm font-bold text-accent-sky tracking-widest uppercase block mb-2">Calculator</span>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-text">
                  Calculate Your <span className="font-extrabold text-accent-coral">Investment</span>
                </h2>
                <p className="text-text-muted mt-3 text-sm">
                  Move the slider to match your monthly ad budget. See exactly how our transparent pricing structures first-month setup vs ongoing monthly management fees.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
            <div className="brutalist-card bg-surface p-8 sm:p-12 md:p-16 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
              {/* Slider Input Col */}
              <div className="md:col-span-7 space-y-8">
                <div className="flex justify-between items-end">
                  <label htmlFor="ad-spend-range" className="font-display font-bold text-lg text-text">
                    Monthly Ad Budget
                  </label>
                  <span className="font-display font-bold text-2xl text-accent-coral border-2 border-border bg-bg px-4 py-1.5 rounded-full shadow-brutal-sm">
                    AED <AnimatedNumber value={adSpend} />
                  </span>
                </div>

                <div className="relative pt-4">
                  <input
                    id="ad-spend-range"
                    type="range"
                    min="5000"
                    max="1000000"
                    step="5000"
                    value={adSpend}
                    onChange={(e) => setAdSpend(parseInt(e.target.value))}
                    className="w-full h-3 bg-bg border-2 border-border rounded-lg appearance-none cursor-pointer accent-accent-coral"
                  />
                  <div className="flex justify-between text-xs text-text-muted mt-3 font-semibold">
                    <span>AED 5,000</span>
                    <span>AED 500,000</span>
                    <span>AED 1,000,000+</span>
                  </div>
                </div>

                <div className="p-4 border-2 border-border bg-bg rounded-xl flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-accent-sky flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-text-muted leading-relaxed">
                    Note: Your ad spend budget is paid directly to advertising platforms (Google Ads, Meta, LinkedIn, etc.). Our fee covers comprehensive planning, asset design, weekly copywriting, daily optimization, and reporting dashboards.
                  </p>
                </div>
              </div>

              {/* Output Cost Cards Col */}
              <div className="md:col-span-5 border-t-2 md:border-t-0 md:border-l-2 border-border pt-8 md:pt-0 md:pl-12 space-y-6">
                
                {/* First Month Card */}
                <div className="brutalist-card p-6 bg-bg flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-accent-coral tracking-widest uppercase block mb-1">First Month Total</span>
                    <h4 className="font-display font-extrabold text-3xl text-text">
                      AED <AnimatedNumber value={firstMonthTotal} />
                    </h4>
                  </div>
                  <div className="border-t border-border/10 mt-4 pt-3 space-y-1.5 text-xs text-text-muted">
                    <div className="flex justify-between">
                      <span>Setup Fee:</span>
                      <span className="font-bold text-text">AED {setupFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-500">
                      <span>Management Fee:</span>
                      <span className="font-bold">Waived (30 Days)</span>
                    </div>
                  </div>
                </div>

                {/* Ongoing Monthly Card */}
                <div className="brutalist-card p-6 bg-bg flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-accent-sky tracking-widest uppercase block mb-1">Ongoing Monthly Agency Fee</span>
                    <h4 className="font-display font-extrabold text-3xl text-text">
                      AED <AnimatedNumber value={ongoingMonthlyFee} />
                    </h4>
                  </div>
                  <div className="border-t border-border/10 mt-4 pt-3 space-y-1.5 text-xs text-text-muted">
                    <div className="flex justify-between">
                      <span>Management Fee:</span>
                      <span className="font-bold text-text">20% of ad budget</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Setup Fee:</span>
                      <span className="font-bold text-green-500">Free</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/contact?focus=Paid%20Campaigns&budget=AED%20${adSpend.toLocaleString()}`}
                    className="brutalist-btn brutalist-btn-primary w-full py-3.5 text-center text-sm"
                  >
                    Lock In This Strategy
                  </Link>
                </div>

              </div>
            </div>
            </Reveal>
          </section>

        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
