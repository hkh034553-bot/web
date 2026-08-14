"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  Award,
  Share2,
  Code,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Clock,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  Target,
  Rocket,
  MousePointerClick,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import Reveal from "@/components/Reveal";
import { Stagger, StaggerItem } from "@/components/Stagger";
import TiltCard, { Magnetic } from "@/components/TiltCard";
import Marquee from "@/components/Marquee";
import TeamSection from "@/components/TeamSection";
import HeroInteractive from "@/components/blocks/HeroInteractive";
import { EASE } from "@/lib/animations";

export default function Home() {
  const services = [
    {
      title: "Graphic Design",
      description: "High-converting landing page assets, marketing collaterals, and pitch decks designed to capture attention and communicate value.",
      icon: Palette,
      badgeColor: "coral",
    },
    {
      title: "Branding",
      description: "Logos, style guides, font systems, and identity kits that give your brand a professional, premium voice in a crowded market.",
      icon: Award,
      badgeColor: "sky",
    },
    {
      title: "Social Media Marketing",
      description: "Strategic planning, content scheduling, and engagement setups designed to organically grow and retain your target client base.",
      icon: Share2,
      badgeColor: "coral",
    },
    {
      title: "Website Development",
      description: "Blazing-fast, SEO-optimized, responsive custom websites built with clean code and structured specifically to maximize conversions.",
      icon: Code,
      badgeColor: "sky",
    },
    {
      title: "App Development",
      description: "Modern cross-platform mobile apps for iOS and Android, focusing on intuitive UX, smooth performance, and clean design systems.",
      icon: Smartphone,
      badgeColor: "coral",
    },
  ];

  const steps = [
    { num: "01", name: "Brief", desc: "We listen first. We walk you through your goals, audience, and what success looks like for your business.", icon: MessageSquare, tip: "Kickoff call, project scope, KPI definition." },
    { num: "02", name: "Strategy", desc: "We map out the roadmap — which channels, what content, what timeline, and exactly how we'll move the needle.", icon: Target, tip: "Channel mix, audience research, roadmap." },
    { num: "03", name: "Create", desc: "Design, copy, video, code — whatever the deliverable, we produce it to a premium standard with your brand voice.", icon: Palette, tip: "Design systems, copywriting, development." },
    { num: "04", name: "Launch", desc: "Everything goes live, properly. No rushed handoffs, no missing pieces. We handle the execution end to end.", icon: Rocket, tip: "QA, deployment, go-live day." },
    { num: "05", name: "Grow", desc: "We analyse performance, double down on what's working, and continuously optimize to compound results over time.", icon: TrendingUp, tip: "Reporting, A/B testing, scaling." },
  ];

  const valueProps = [
    { title: "Design-First", desc: "Every project starts with strategy and visual direction, not templates.", icon: Sparkles, badgeColor: "coral" },
    { title: "Fast Turnaround", desc: "Small, focused team means quick iteration and direct execution.", icon: Clock, badgeColor: "sky" },
    { title: "Direct Communication", desc: "Work straight with the person building it, no account-manager layers.", icon: MessageSquare, badgeColor: "coral" },
  ];

  const caseStudies = [
    {
      client: "UF Makeup",
      service: "Social Media Management",
      desc: "We built a stronger, more professional social presence across Instagram & Facebook, scaling outreach and unifying their visual branding.",
      results: [
        "Improved posting consistency & engagement",
        "Organic reach boosted",
        "Unified content aesthetic"
      ],
      tags: ["Monthly Calendars", "Reel Editing", "Weekly Analysis"],
      badgeColor: "coral",
      category: "Social",
    },
    {
      client: "Visa Agency",
      service: "Content Management",
      desc: "Established a stronger educational presence online, developing a clean tutorial pipeline to build authority and trust.",
      results: [
        "Established YouTube authority",
        "4K Editorial Pipeline configured",
        "CTR Optimized Thumbnails"
      ],
      tags: ["Script Planning", "Thumbnail Design", "Channel SEO"],
      badgeColor: "sky",
      category: "Content",
    },
    {
      client: "Iqra University",
      service: "Social & Paid Ads",
      desc: "Increased visibility and generated student enrollment inquiries through highly targeted geographic paid campaigns.",
      results: [
        "Direct student enrollment inquiry boost",
        "Laser Geo-Targeting campaigns",
        "Interactive reels content"
      ],
      tags: ["Targeted Campaigns", "Student Reels", "Lead Analytics"],
      badgeColor: "coral",
      category: "Ads",
    },
    {
      client: "The Academy",
      service: "Social Media & Advertising",
      desc: "Increased user engagement and established clear branding, resulting in official certificates of recognition for excellence.",
      results: [
        "Boosting student engagement by 55%",
        "Standardized branding guidelines across all channels",
        "Official certificate of recognition for digital excellence"
      ],
      tags: ["Targeted Campaigns", "Brand Identity", "Design Kits"],
      badgeColor: "sky",
      category: "Social",
    },
    {
      client: "Wondershare Filmora",
      service: "Video Editing & Content",
      desc: "Delivered highly professional tutorial and promotional video assets for an internationally recognized software brand.",
      results: [
        "10+ high-quality video tutorials delivered",
        "Reached over 200k organic views on YouTube",
        "Streamlined editing pipeline for weekly uploads"
      ],
      tags: ["Video Editing", "Content Creation", "Promotions"],
      badgeColor: "coral",
      category: "Content",
    },
    {
      client: "CFO Services",
      service: "LinkedIn & B2B Marketing",
      desc: "Enhanced professional online presence among business audiences, establishing executive authority on corporate finances.",
      results: [
        "3x increase in weekly profile views",
        "Established B2B executive authority",
        "Generated 15+ high-ticket inbound sales leads"
      ],
      tags: ["B2B Strategy", "LinkedIn Growth", "Executive Authority"],
      badgeColor: "sky",
      category: "B2B",
    }
  ];

  const caseFilters = ["All", "Social", "Content", "Ads", "B2B"];
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeStep, setActiveStep] = useState(0);

  const filteredCases =
    activeFilter === "All"
      ? caseStudies
      : caseStudies.filter((cs) => cs.category === activeFilter);

  return (
    <>
      <Navbar />

      <main className="flex-grow transition-colors duration-300">
        {/* HERO SECTION — interactive: hover the service tabs, tilt the dashboard, scroll for parallax */}
        <HeroInteractive
          badge={
            <span className="inline-flex items-center gap-2 px-4 py-1.5 border-2 border-border bg-flow-gradient text-white rounded-full font-display font-bold text-sm tracking-wide shadow-brutal-sm">
              <Sparkles className="w-4 h-4 fill-current" />
              Creative & Dev Agency
            </span>
          }
          headingPrefix="Scale Your Brand with"
          description="We build high-performance custom websites, premium branding, and conversion-focused social campaigns for startups and SMEs. Zero templates. Direct execution."
          primaryCta={{ text: "Get a Free Quote", href: "/contact" }}
          secondaryCta={{ text: "Explore Services", href: "/services" }}
          trustItems={[
            { icon: CheckCircle2, label: "Clear Pricing", accent: "text-accent-pink" },
            { icon: CheckCircle2, label: "Fast Turnaround", accent: "text-accent-blue" },
            { icon: CheckCircle2, label: "Direct Communication", accent: "text-accent-pink" },
          ]}
          stats={[
            { value: 3.2, decimals: 1, suffix: "M+", label: "Impressions" },
            { value: 200, suffix: "K+", label: "Organic Views" },
            { value: 4.8, decimals: 1, suffix: "x", label: "Avg. ROAS" },
            { value: 50, suffix: "+", label: "Brands Scaled" },
          ]}
        />

        {/* MARQUEE BAND */}
        <Marquee />

        {/* SERVICES PREVIEW */}
        <section className="py-20 border-t-2 border-border bg-bg/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                <div>
                  <span className="text-sm font-bold text-accent-coral tracking-widest uppercase block mb-2">Expertise</span>
                  <h2 className="font-display font-bold text-3xl sm:text-4xl text-text">
                    Services <span className="font-normal text-text-muted">We Provide</span>
                  </h2>
                </div>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1.5 font-bold text-sm text-text hover:text-accent-coral transition-colors group"
                >
                  Explore all services
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Reveal>

            <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, idx) => (
                <StaggerItem key={idx}>
                  <TiltCard maxTilt={12} className="h-full">
                    <div className="brutalist-card p-8 flex flex-col justify-between h-full group">
                      <div className="space-y-6">
                        {/* Badge container for icon */}
                        <div className="flex">
                          <motion.span
                            whileHover={{ rotate: 8, scale: 1.08 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            className={`${service.badgeColor === "coral" ? "brutalist-badge-coral" : "brutalist-badge-sky"} w-14 h-14`}
                          >
                            <service.icon className={`w-6 h-6 ${service.badgeColor === "coral" ? "text-white" : "text-text"}`} />
                          </motion.span>
                        </div>
                        <h3 className="font-display font-bold text-2xl text-text">
                          {service.title}
                        </h3>
                        <p className="text-text-muted text-sm leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                      <div className="pt-8">
                        <Link
                          href={`/services#${service.title.toLowerCase().replace(/\s+/g, "-")}`}
                          className="inline-flex items-center gap-1 font-bold text-xs text-text hover:text-accent-coral transition-colors group/link"
                        >
                          Learn more
                          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                        </Link>
                      </div>
                    </div>
                  </TiltCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* HOW WE WORK (PROCESS) — interactive click-through */}
        <section id="how-we-work" className="py-20 border-t-2 border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-sm font-bold text-accent-sky tracking-widest uppercase block mb-2">Our Framework</span>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-text">
                  How We <span className="font-normal text-text-muted">Generate Growth</span>
                </h2>
                <p className="text-text-muted mt-3">
                  Click a phase to explore what happens at each step of the pipeline.
                </p>
              </div>
            </Reveal>

            {/* 5-Step Interactive Timeline */}
            <Stagger id="our-process" className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {steps.map((step, idx) => {
                const isActive = idx === activeStep;
                return (
                  <StaggerItem key={idx}>
                    <motion.button
                      onClick={() => setActiveStep(idx)}
                      whileHover={{ y: -6 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      className={`brutalist-card p-6 flex flex-col justify-between relative bg-surface text-left w-full cursor-pointer h-full ${
                        isActive ? "brutalist-card-active" : ""
                      }`}
                      style={
                        isActive
                          ? { borderColor: "var(--accent-coral)", boxShadow: "4px 4px 0 var(--accent-coral)" }
                          : undefined
                      }
                    >
                      {/* Step number badge */}
                      <motion.span
                        animate={{ rotate: isActive ? 360 : 0, scale: isActive ? 1.1 : 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className={`absolute -top-3 -right-3 w-10 h-10 border-2 border-border font-display font-bold rounded-full flex items-center justify-center shadow-brutal-sm text-sm ${
                          isActive ? "bg-accent-pink text-white" : "bg-accent-blue text-white"
                        }`}
                      >
                        {step.num}
                      </motion.span>
                      <div className="space-y-4">
                        <span className={`w-10 h-10 flex items-center justify-center mb-4 ${isActive ? "brutalist-badge-coral" : "brutalist-badge-sky"}`}>
                          <step.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-text"}`} />
                        </span>
                        <h3 className="font-display font-bold text-xl text-text">
                          {step.name}
                        </h3>
                        <p className={`text-xs leading-relaxed ${isActive ? "text-text" : "text-text-muted"}`}>
                          {step.desc}
                        </p>
                      </div>
                      {/* Active indicator */}
                      <motion.div
                        initial={false}
                        animate={{ opacity: isActive ? 1 : 0 }}
                        className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent-coral"
                      >
                        <MousePointerClick className="w-3 h-3" />
                        {isActive ? "Selected" : "Select"}
                      </motion.div>
                    </motion.button>
                  </StaggerItem>
                );
              })}
            </Stagger>

            {/* Expanded detail for the active step */}
            <div className="mt-8 mb-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="brutalist-card bg-surface p-8 flex flex-col sm:flex-row sm:items-center gap-6"
                >
                  <span className="brutalist-badge-sky w-14 h-14 flex-shrink-0">
                    {(() => {
                      const SIcon = steps[activeStep].icon;
                      return <SIcon className="w-6 h-6 text-text" />;
                    })()}
                  </span>
                  <div className="flex-grow space-y-1.5">
                    <p className="text-xs font-bold text-accent-sky uppercase tracking-widest">
                      Phase {steps[activeStep].num} — {steps[activeStep].name}
                    </p>
                    <p className="text-text text-sm sm:text-base leading-relaxed">
                      {steps[activeStep].desc}
                    </p>
                    <p className="text-text-muted text-xs">
                      <span className="font-bold text-accent-coral">What this looks like:</span>{" "}
                      {steps[activeStep].tip}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {steps.map((s, i) => (
                      <button
                        key={s.num}
                        onClick={() => setActiveStep(i)}
                        aria-label={`Go to phase ${s.num}`}
                        className={`w-3 h-3 rounded-full border-2 border-border cursor-pointer transition-all ${
                          i === activeStep ? "bg-accent-coral scale-125" : "bg-bg hover:bg-accent-sky/40"
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Core Value Props (3 cards) */}
            <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {valueProps.map((prop, idx) => (
                <StaggerItem key={idx}>
                  <TiltCard maxTilt={10} className="h-full">
                    <div className="brutalist-card p-8 flex items-start gap-5 h-full">
                      <motion.span
                        whileHover={{ rotate: 8, scale: 1.08 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        className={`${prop.badgeColor === "coral" ? "brutalist-badge-coral" : "brutalist-badge-sky"} w-12 h-12 flex-shrink-0`}
                      >
                        <prop.icon className={`w-5 h-5 ${prop.badgeColor === "coral" ? "text-white" : "text-text"}`} />
                      </motion.span>
                      <div className="space-y-2">
                        <h4 className="font-display font-bold text-xl text-text">
                          {prop.title}
                        </h4>
                        <p className="text-text-muted text-sm leading-relaxed">
                          {prop.desc}
                        </p>
                      </div>
                    </div>
                  </TiltCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* CASE STUDIES (OUR WORK) — filterable */}
        <section id="our-work" className="py-20 border-t-2 border-border bg-bg/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="mb-12">
                <span className="text-sm font-bold text-accent-coral tracking-widest uppercase block mb-2">Proven Results</span>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-text">
                  Case Studies
                </h2>
                <p className="text-text-muted text-sm mt-2">
                  Work delivered under our previous name, <span className="font-bold text-text underline">Digivolve</span> — now HKH.
                </p>
              </div>
            </Reveal>

            {/* Filter chips */}
            <Reveal delay={0.05}>
              <div className="flex flex-wrap items-center gap-3 mb-10">
                {caseFilters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-5 py-2 rounded-full border-2 border-border font-display font-bold text-xs cursor-pointer transition-all duration-150 ${
                      activeFilter === f
                        ? "bg-accent-coral text-white shadow-brutal"
                        : "bg-surface text-text hover:translate-y-[-2px] hover:shadow-brutal-sm"
                    }`}
                  >
                    {f === "All" ? "All Work" : f}
                  </button>
                ))}
              </div>
            </Reveal>

            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredCases.map((cs, idx) => (
                  <motion.div
                    key={cs.client}
                    layout
                    initial={{ opacity: 0, scale: 0.92, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 20 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    <TiltCard maxTilt={8} className="h-full">
                      <div className="brutalist-card flex flex-col h-full bg-surface">
                        {/* Header */}
                        <div className="p-6 border-b-2 border-border flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-display font-bold text-xl text-text">{cs.client}</h3>
                            <p className="text-xs text-accent-coral font-bold mt-1 uppercase tracking-wider">{cs.service}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 border-2 border-border rounded-md ${cs.badgeColor === "coral" ? "bg-accent-coral text-white" : "bg-accent-sky text-text"}`}>
                            {cs.category}
                          </span>
                        </div>

                        {/* Body */}
                        <div className="p-6 flex-grow flex flex-col justify-between">
                          <div className="space-y-6">
                            <p className="text-sm text-text-muted italic leading-relaxed">
                              "{cs.desc}"
                            </p>

                            {/* Results block */}
                            <div className="space-y-2">
                              <span className="text-xs font-bold text-text uppercase tracking-widest block mb-2">Key Outcomes:</span>
                              <ul className="space-y-1.5 text-xs text-text-muted">
                                {cs.results.map((res, rIdx) => (
                                  <li key={rIdx} className="flex items-start gap-2">
                                    <span className="text-accent-sky font-bold text-sm mt-0.5">•</span>
                                    <span>{res}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mt-8 pt-4 border-t border-border/10">
                            {cs.tags.map((tag, tIdx) => (
                              <span key={tIdx} className="text-[10px] font-bold px-2 py-0.5 border border-border bg-bg text-text-muted rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TiltCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        {/* TEAM */}
        <TeamSection />

        {/* REVIEWS CAROUSEL */}
        <section id="reviews" className="py-20 border-t-2 border-border text-center overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="mb-16">
                <span className="text-sm font-bold text-accent-sky tracking-widest uppercase block mb-2">Client Feedback</span>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-text">
                  What Partners <span className="font-normal text-text-muted">Say About Us</span>
                </h2>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <ReviewsCarousel />
            </Reveal>
          </div>
        </section>

        {/* CTA BANNER — bold ink canvas, createwithflow-style */}
        <section className="py-16 md:py-24 border-t-2 border-border bg-ink text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(253,1,120,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,255,0.10)_1px,transparent_1px)] bg-[size:3rem_3rem] -z-10 pointer-events-none" />
          <div aria-hidden className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-accent-pink/25 blur-3xl -z-10 pointer-events-none" />
          <div aria-hidden className="absolute -bottom-32 right-1/4 w-96 h-96 rounded-full bg-accent-blue/25 blur-3xl -z-10 pointer-events-none" />
          <Reveal>
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
              <h2 className="font-display font-bold text-3xl sm:text-5xl md:text-6xl text-white leading-tight max-w-4xl mx-auto">
                Ready to <span className="text-flow-gradient font-extrabold">Supercharge</span> Your Marketing & Development?
              </h2>
              <p className="text-white/70 max-w-2xl mx-auto text-lg md:text-xl font-medium">
                Get direct execution with a small, focused team. No corporate layers, just high-converting results.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Magnetic strength={0.25}>
                  <Link
                    href="/contact"
                    className="brutalist-btn bg-flow-gradient text-white border-2 border-white/20 rounded-full px-8 py-4 font-bold shadow-[4px_4px_0_#FD0178] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#FD0178] transition-all duration-150 w-full sm:w-auto text-center"
                  >
                    Get a Free Quote
                  </Link>
                </Magnetic>
                <Magnetic strength={0.25}>
                  <Link
                    href="/portfolio.pdf"
                    target="_blank"
                    className="brutalist-btn bg-surface text-text border-2 border-border rounded-full px-8 py-4 font-bold shadow-[4px_4px_0_#FD0178] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#FD0178] transition-all duration-150 w-full sm:w-auto text-center"
                  >
                    View Our Portfolio
                  </Link>
                </Magnetic>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
