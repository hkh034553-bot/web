"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useInView,
  MotionValue,
} from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Eye,
  Users,
  CheckCircle2,
  Share2,
  Target,
  Globe,
  Award,
  Zap,
} from "lucide-react";
import { EASE } from "@/lib/animations";

/* ------------------------------------------------------------------ */
/* Rotating headline word + color accent                               */
/* ------------------------------------------------------------------ */

const ROTATING_WORDS = [
  { text: "Branding", color: "text-accent-pink" },
  { text: "Websites", color: "text-accent-blue" },
  { text: "Social Campaigns", color: "text-accent-pink" },
  { text: "Mobile Apps", color: "text-accent-blue" },
  { text: "Paid Ads", color: "text-accent-pink" },
  { text: "Video & Content", color: "text-accent-blue" },
];

/* ------------------------------------------------------------------ */
/* Service data — hovering a tab morphs the dashboard                  */
/* ------------------------------------------------------------------ */

interface Channel {
  name: string;
  pct: number;
  color: string;
}

interface Service {
  id: string;
  label: string;
  icon: React.ElementType;
  badgeColor: string;
  iconClass: string;
  headline: string;
  url: string;
  channels: Channel[];
  bars: number[];
  kpis: { label: string; value: string; color: string }[];
  floatA: { icon: React.ElementType; text: string; cls: string };
  floatB: { icon: React.ElementType; text: string; cls: string };
}

const SERVICES: Service[] = [
  {
    id: "social",
    label: "Social Media",
    icon: Share2,
    badgeColor: "brutalist-badge-coral",
    iconClass: "text-white",
    headline: "Social Growth Engine",
    url: "hkh.agency/social",
    channels: [
      { name: "Instagram", pct: 86, color: "bg-accent-coral" },
      { name: "Facebook", pct: 74, color: "bg-accent-sky" },
      { name: "TikTok", pct: 68, color: "bg-accent-blue" },
    ],
    bars: [34, 58, 46, 72, 92],
    kpis: [
      { label: "Followers +", value: "+18.4K", color: "text-accent-coral" },
      { label: "Eng. Rate", value: "6.2%", color: "text-accent-sky" },
    ],
    floatA: { icon: TrendingUp, text: "+42% Leads", cls: "brutalist-badge-coral text-white" },
    floatB: { icon: Eye, text: "200K+ Organic Views", cls: "brutalist-badge-sky text-text" },
  },
  {
    id: "ppc",
    label: "Paid Ads",
    icon: Target,
    badgeColor: "brutalist-badge-sky",
    iconClass: "text-text",
    headline: "Ad Performance",
    url: "hkh.agency/ads",
    channels: [
      { name: "Google Ads", pct: 92, color: "bg-accent-sky" },
      { name: "Meta Ads", pct: 81, color: "bg-accent-coral" },
      { name: "LinkedIn Ads", pct: 64, color: "bg-accent-pink" },
    ],
    bars: [28, 44, 62, 78, 96],
    kpis: [
      { label: "ROAS", value: "4.8x", color: "text-accent-sky" },
      { label: "CPC", value: "$0.42", color: "text-accent-coral" },
    ],
    floatA: { icon: Zap, text: "ROAS 4.8x", cls: "brutalist-badge-sky text-text" },
    floatB: { icon: TrendingUp, text: "+212% CTR", cls: "brutalist-badge-coral text-white" },
  },
  {
    id: "web",
    label: "Websites",
    icon: Globe,
    badgeColor: "brutalist-badge-coral",
    iconClass: "text-white",
    headline: "Conversion Sites",
    url: "hkh.agency/websites",
    channels: [
      { name: "Page Speed", pct: 98, color: "bg-accent-sky" },
      { name: "SEO Score", pct: 91, color: "bg-accent-coral" },
      { name: "Conversion", pct: 12.4, color: "bg-accent-blue" },
    ],
    bars: [40, 66, 52, 84, 70],
    kpis: [
      { label: "Leads / Mo", value: "+1,248", color: "text-accent-coral" },
      { label: "Load Time", value: "0.8s", color: "text-accent-sky" },
    ],
    floatA: { icon: Zap, text: "0.8s Load", cls: "brutalist-badge-sky text-text" },
    floatB: { icon: Users, text: "+1,248 Leads", cls: "brutalist-badge-coral text-white" },
  },
  {
    id: "brand",
    label: "Branding",
    icon: Award,
    badgeColor: "brutalist-badge-sky",
    iconClass: "text-text",
    headline: "Brand Identity",
    url: "hkh.agency/branding",
    channels: [
      { name: "Recognition", pct: 88, color: "bg-accent-coral" },
      { name: "Premium Voice", pct: 95, color: "bg-accent-sky" },
      { name: "Recall", pct: 79, color: "bg-accent-blue" },
    ],
    bars: [32, 50, 68, 80, 90],
    kpis: [
      { label: "Brand Kits", value: "50+", color: "text-accent-sky" },
      { label: "Recall Lift", value: "+37%", color: "text-accent-coral" },
    ],
    floatA: { icon: Award, text: "50+ Kits", cls: "brutalist-badge-sky text-text" },
    floatB: { icon: Eye, text: "+37% Recall", cls: "brutalist-badge-coral text-white" },
  },
];

/* ------------------------------------------------------------------ */
/* Animated number counter                                             */
/* ------------------------------------------------------------------ */

function CountUp({
  to,
  decimals = 0,
  suffix = "",
  delay = 0,
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = performance.now() + delay * 1000;
    const dur = 1400;
    const tick = (now: number) => {
      const t = Math.min(Math.max((now - start) / dur, 0), 1);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setVal(to * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, delay]);

  return (
    <span ref={ref}>
      {val.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Floating 3D brutalist cube — spins in 3D, parallaxes with cursor    */
/* ------------------------------------------------------------------ */

interface CubeProps {
  className?: string;
  size: number;
  baseRotateX?: number;
  baseRotateY?: number;
  spinDuration?: number;
  floatDuration?: number;
  color: string;
  parallax?: number;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
}

function FloatingCube({
  className = "",
  size,
  baseRotateX = 0,
  baseRotateY = 0,
  spinDuration = 14,
  floatDuration = 5,
  color,
  parallax = 0,
  sx,
  sy,
}: CubeProps) {
  const half = size / 2;
  const px = useTransform(sx, [0, 1], [-parallax, parallax]);
  const py = useTransform(sy, [0, 1], [parallax, -parallax]);

  return (
    <motion.div
      aria-hidden
      style={{ x: px, y: py }}
      className={`pointer-events-none absolute hidden md:block ${className}`}
    >
      <motion.div
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: floatDuration, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: size, height: size, perspective: 800 }}
      >
        <motion.div
          animate={{ rotateX: [baseRotateX, baseRotateX + 360], rotateY: [baseRotateY, baseRotateY] }}
          transition={{ duration: spinDuration, repeat: Infinity, ease: "linear" }}
          style={{ width: "100%", height: "100%", transformStyle: "preserve-3d" }}
        >
          {/* Front face */}
          <div className={`absolute inset-0 border-2 border-border rounded-md ${color}`} style={{ transform: `translateZ(${half}px)` }} />
          {/* Right face */}
          <div className={`absolute inset-0 border-2 border-border rounded-md ${color}`} style={{ transform: `rotateY(90deg) translateZ(${half}px)` }} />
          {/* Top face */}
          <div className={`absolute inset-0 border-2 border-border rounded-md ${color}`} style={{ transform: `rotateX(90deg) translateZ(${half}px)` }} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard mockup — content morphs per active service tab            */
/* ------------------------------------------------------------------ */

function Dashboard({ service }: { service: Service }) {
  return (
    <div className="brutalist-card bg-surface overflow-hidden text-left shadow-brutal-lg">
      {/* Browser chrome */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b-2 border-border bg-bg/60">
        <span className="w-3 h-3 rounded-full bg-accent-pink border border-border" />
        <span className="w-3 h-3 rounded-full bg-accent-blue border border-border" />
        <span className="w-3 h-3 rounded-full bg-accent-pink border border-border" />
        <div className="ml-3 flex-1 max-w-xs px-3 py-1 rounded-full border-2 border-border bg-surface text-[10px] font-bold text-text-muted truncate">
          {service.url}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={service.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.28, ease: EASE }}
          className="grid grid-cols-1 sm:grid-cols-12 gap-6 p-6 sm:p-8"
        >
          {/* Left: stats + bars */}
          <div className="sm:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`${service.badgeColor} w-10 h-10`}>
                  <service.icon className={`w-5 h-5 ${service.iconClass}`} />
                </span>
                <div>
                  <p className="text-[10px] font-bold text-accent-pink uppercase tracking-widest">
                    Live Performance
                  </p>
                  <h4 className="font-display font-bold text-xl text-text mt-0.5">
                    {service.headline}
                  </h4>
                </div>
              </div>
            </div>

            {/* Channel bars */}
            <div className="space-y-3">
              {service.channels.map((c, i) => (
                <div key={c.name} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-text">{c.name}</span>
                    <span className="text-text-muted">{c.pct}%</span>
                  </div>
                  <div className="h-2.5 border border-border rounded-full bg-bg overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: `${c.pct}%` }}
                      transition={{ delay: 0.15 + i * 0.08, duration: 0.7, ease: EASE }}
                      className={`h-full ${c.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div className="border-2 border-border rounded-xl bg-bg p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-text uppercase tracking-wider">
                  Weekly Conversions
                </p>
                <span className="text-[9px] font-bold text-accent-blue">Live</span>
              </div>
              <div className="flex items-end justify-between gap-2 h-20">
                {service.bars.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: "6%" }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.3 + i * 0.07, duration: 0.6, ease: EASE }}
                    className={`flex-1 ${i === service.bars.length - 1 ? "bg-accent-blue" : i % 2 === 0 ? "bg-accent-pink" : "bg-accent-blue"} rounded-t-md border border-border`}
                    style={{ minHeight: 6 }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: KPI cards */}
          <div className="sm:col-span-5 border-t-2 sm:border-t-0 sm:border-l-2 border-border pt-6 sm:pt-0 sm:pl-6 flex flex-col justify-center gap-4">
            {service.kpis.map((k, i) => (
              <motion.div
                key={k.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5, ease: EASE }}
                className="border-2 border-border rounded-xl bg-bg p-4 space-y-1"
              >
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">
                  {k.label}
                </p>
                <p className={`font-display font-extrabold text-2xl text-text ${k.color}`}>
                  {k.value}
                </p>
              </motion.div>
            ))}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-[10px] text-text-muted leading-relaxed"
            >
              <span className="text-accent-pink font-bold">Zero templates.</span> Direct
              execution, premium standard — tracked live for every client.
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Interactive 3D Hero                                                 */
/* ------------------------------------------------------------------ */

interface HeroInteractiveProps {
  badge?: React.ReactNode;
  headingPrefix: string;
  description: string;
  primaryCta: { text: string; href: string };
  secondaryCta: { text: string; href: string };
  trustItems: { icon: React.ElementType; label: string; accent: string }[];
  stats: { value: number; decimals?: number; suffix?: string; label: string }[];
}

export default function HeroInteractive({
  badge,
  headingPrefix,
  description,
  primaryCta,
  secondaryCta,
  trustItems,
  stats,
}: HeroInteractiveProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);

  /* Scroll parallax — the whole scene drifts + rotates slightly on scroll */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const dashY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const dashRotate = useTransform(scrollYProgress, [0, 1], [0, -2.5]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0.4]);

  /* Cursor position, normalized 0..1 (drives the whole 3D scene) */
  const nx = useMotionValue(0.5);
  const ny = useMotionValue(0.5);
  const sNX = useSpring(nx, { stiffness: 60, damping: 18 });
  const sNY = useSpring(ny, { stiffness: 60, damping: 18 });

  /* 3D scene rotation — the dashboard tilts in perspective as you move the mouse */
  const sceneRX = useTransform(sNY, [0, 1], [10, -10]);
  const sceneRY = useTransform(sNX, [0, 1], [-12, 12]);

  /* Cursor spotlight following the mouse across the whole section */
  const spotlightX = useTransform(sNX, [0, 1], [0, 100]);
  const spotlightY = useTransform(sNY, [0, 1], [0, 100]);
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${spotlightX}% ${spotlightY}%, rgba(253,1,120,0.16), rgba(0,0,255,0.09) 45%, transparent 75%)`;

  /* Rotating headline word */
  useEffect(() => {
    const id = setInterval(() => {
      setWordIdx((i) => (i + 1) % ROTATING_WORDS.length);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const word = ROTATING_WORDS[wordIdx];
  const activeService = SERVICES[active];

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    nx.set((e.clientX - rect.left) / rect.width);
    ny.set((e.clientY - rect.top) / rect.height);
  };

  const resetScene = () => {
    nx.set(0.5);
    ny.set(0.5);
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMove}
      onMouseLeave={resetScene}
      className="relative pt-24 pb-20 md:pt-28 md:pb-24 overflow-hidden"
    >
      {/* Background grid illustration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(22,21,26,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(22,21,26,0.06)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(246,244,239,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(246,244,239,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_65%,transparent_100%)] -z-20 pointer-events-none" />

      {/* Pink + blue corner glows (createwithflow duo) */}
      <div aria-hidden className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-accent-pink/20 dark:bg-accent-pink/10 blur-3xl -z-10 pointer-events-none" />
      <div aria-hidden className="absolute -bottom-32 -right-24 w-[32rem] h-[32rem] rounded-full bg-accent-blue/15 dark:bg-accent-blue/10 blur-3xl -z-10 pointer-events-none" />

      {/* Cursor-following spotlight glow */}
      <motion.div
        aria-hidden
        style={{ backgroundImage: spotlight, opacity: glowOpacity }}
        className="absolute inset-0 -z-10 pointer-events-none"
      />

      {/* Floating 3D cubes — spin, float, and parallax with the cursor */}
      <FloatingCube
        sx={sNX}
        sy={sNY}
        size={52}
        color="bg-accent-pink/25 dark:bg-accent-pink/15"
        parallax={26}
        className="top-[12%] left-[4%]"
        baseRotateX={20}
        baseRotateY={-24}
        spinDuration={16}
        floatDuration={5.5}
      />
      <FloatingCube
        sx={sNX}
        sy={sNY}
        size={72}
        color="bg-accent-blue/25 dark:bg-accent-blue/15"
        parallax={38}
        className="top-[18%] right-[3%]"
        baseRotateX={30}
        baseRotateY={20}
        spinDuration={22}
        floatDuration={7}
      />
      <FloatingCube
        sx={sNX}
        sy={sNY}
        size={44}
        color="bg-accent-pink/30 dark:bg-accent-pink/15"
        parallax={30}
        className="bottom-[14%] left-[7%]"
        baseRotateX={-18}
        baseRotateY={34}
        spinDuration={13}
        floatDuration={6}
      />
      <FloatingCube
        sx={sNX}
        sy={sNY}
        size={64}
        color="bg-text/10 dark:bg-text/10"
        parallax={44}
        className="bottom-[20%] right-[8%]"
        baseRotateX={26}
        baseRotateY={-30}
        spinDuration={18}
        floatDuration={8}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* LEFT — copy */}
          <motion.div
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
            }}
            initial="hidden"
            animate="visible"
            className="lg:col-span-6 text-center lg:text-left"
          >
            {badge && (
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }} className="mb-6 inline-flex">
                {badge}
              </motion.div>
            )}

            {/* Headline with 3D-flipping rotating word */}
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
              className="font-display text-4xl sm:text-5xl md:text-6xl font-normal leading-[1.08] tracking-tight text-text"
            >
              {headingPrefix}{" "}
              <span
                className="relative inline-block align-bottom"
                style={{ height: "1.08em", perspective: 500 }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={word.text}
                    initial={{ rotateX: -90, opacity: 0 }}
                    animate={{ rotateX: 0, opacity: 1 }}
                    exit={{ rotateX: 90, opacity: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className={`inline-block font-extrabold ${word.color}`}
                    style={{ transformOrigin: "50% 50%" }}
                  >
                    {word.text}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.h1>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
              className="mt-6 text-lg sm:text-xl text-text-muted max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              {description}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
              className="mt-10 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4"
            >
              <Link
                href={primaryCta.href}
                className="brutalist-btn brutalist-btn-primary px-8 py-4 text-base w-full sm:w-auto group"
              >
                {primaryCta.text}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={secondaryCta.href}
                className="brutalist-btn brutalist-btn-secondary px-8 py-4 text-base w-full sm:w-auto"
              >
                {secondaryCta.text}
              </Link>
            </motion.div>

            {/* Live stats — count up on view */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
              className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className="border-2 border-border rounded-xl bg-surface p-3 text-left shadow-brutal-sm"
                >
                  <p className="font-display font-extrabold text-xl text-text leading-none">
                    <CountUp to={s.value} decimals={s.decimals ?? 0} suffix={s.suffix ?? ""} delay={i * 0.12} />
                  </p>
                  <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mt-1.5">
                    {s.label}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* Trust checklist */}
            {trustItems.length > 0 && (
              <motion.div
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6, ease: EASE } } }}
                className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-7 gap-y-3 text-sm font-medium text-text-muted"
              >
                {trustItems.map((t, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <t.icon className={`w-4 h-4 ${t.accent}`} />
                    {t.label}
                  </span>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* RIGHT — 3D interactive service dashboard */}
          <motion.div style={{ y: dashY, rotate: dashRotate }} className="lg:col-span-6">
            {/* 3D camera + scene */}
            <div style={{ perspective: 1300 }}>
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
                style={{ rotateX: sceneRX, rotateY: sceneRY, transformStyle: "preserve-3d" }}
              >
                {/* Layered 3D stack: back pages -> dashboard -> floating chips */}
                <div className="relative" style={{ transformStyle: "preserve-3d" }}>
                  {/* Back page 2 — furthest, peeking from behind */}
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-2xl border-2 border-border bg-accent-blue/25 dark:bg-accent-blue/10"
                    style={{ transform: "translateZ(-70px) translate(-14px, -10px) rotate(1.6deg)" }}
                  />
                  {/* Back page 1 — closer */}
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-2xl border-2 border-border bg-accent-pink/25 dark:bg-accent-pink/10"
                    style={{ transform: "translateZ(-42px) translate(-7px, -5px) rotate(0.8deg)" }}
                  />

                  {/* Main dashboard (z = 0) */}
                  <div className="relative" style={{ transform: "translateZ(0px)" }}>
                    <Dashboard service={activeService} />

                    {/* Floating KPI chips — pop out toward the viewer at high Z */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`fa-${activeService.id}`}
                        initial={{ opacity: 0, x: -24, rotate: -12, z: 0 }}
                        animate={{ opacity: 1, x: 0, rotate: -4, z: 90 }}
                        exit={{ opacity: 0, x: -24, rotate: -12, z: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="absolute -left-3 sm:-left-6 -top-7"
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        <div className={`${activeService.floatA.cls} px-4 py-2.5 flex items-center gap-2 text-xs font-bold shadow-brutal`}>
                          <activeService.floatA.icon className="w-4 h-4" />
                          {activeService.floatA.text}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`fb-${activeService.id}`}
                        initial={{ opacity: 0, x: 24, rotate: 12, z: 0 }}
                        animate={{ opacity: 1, x: 0, rotate: 3, z: 90 }}
                        exit={{ opacity: 0, x: 24, rotate: 12, z: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="absolute -right-3 sm:-right-6 -bottom-7"
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        <div className={`${activeService.floatB.cls} px-4 py-2.5 flex items-center gap-2 text-xs font-bold shadow-brutal`}>
                          <activeService.floatB.icon className="w-4 h-4" />
                          {activeService.floatB.text}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Tabs — hover to morph, floating at a nearer Z */}
                  <div className="relative mt-8" style={{ transform: "translateZ(55px)" }}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {SERVICES.map((s, i) => {
                        const isActive = i === active;
                        return (
                          <button
                            key={s.id}
                            onMouseEnter={() => setActive(i)}
                            onClick={() => setActive(i)}
                            aria-pressed={isActive}
                            className={`flex flex-col items-center gap-2 px-3 py-3.5 border-2 border-border rounded-xl font-display font-bold text-xs transition-all duration-150 cursor-pointer ${
                              isActive
                                ? "bg-accent-coral text-white shadow-brutal"
                                : "bg-surface text-text hover:translate-y-[-2px] hover:shadow-brutal-sm"
                            }`}
                          >
                            <s.icon className={`w-5 h-5 ${isActive ? "text-white" : s.badgeColor === "brutalist-badge-coral" ? "text-accent-coral" : "text-accent-sky"}`} />
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-[10px] text-text-muted font-bold uppercase tracking-widest text-center">
                      Move your cursor — the dashboard tilts in 3D · hover a service to switch live data
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
