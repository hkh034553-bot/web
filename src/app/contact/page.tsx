"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Phone, MapPin, Send, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import confetti from "canvas-confetti";
import Reveal from "@/components/Reveal";
import { Stagger, StaggerItem } from "@/components/Stagger";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { createClient } from "@/lib/supabase/client";

function ContactContent() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [projectFocus, setProjectFocus] = useState("Website Development");
  const [budgetRange, setBudgetRange] = useState("AED 5,000 – AED 15,000");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Pre-fill fields if coming from service / calculator links
  useEffect(() => {
    const focusParam = searchParams.get("focus");
    const budgetParam = searchParams.get("budget");

    if (focusParam) setProjectFocus(focusParam);
    if (budgetParam) {
      setBudgetRange(`Ad Budget: ${budgetParam}`);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.from("contact_submissions").insert({
        full_name: fullName,
        email,
        project_focus: projectFocus,
        budget_range: budgetRange,
        message,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Fire-and-forget: trigger the automated confirmation + owner notification emails.
      // The Edge Function must be deployed first (see supabase/functions/send-lead-email
      // and the README). Failures here never block the form success screen.
      supabase.functions.invoke("send-lead-email", {
        body: {
          fullName,
          email,
          projectFocus,
          budgetRange,
          message,
        },
      }).then(({ error: fnError }) => {
        if (fnError) console.error("Lead email trigger failed:", fnError);
      });

      setSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FD0178", "#0000FF", "#16151A", "#FAFAF6"]
      });

      setFullName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      console.error("Error submitting contact form:", err);
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const projectFocusOptions = [
    "Graphic Design",
    "Branding",
    "Social Media Marketing",
    "Website Development",
    "App Development",
    "Paid Campaigns (PPC)",
    "Other Consultation"
  ];

  const budgetOptions = [
    "AED 5,000 – AED 15,000",
    "AED 15,000 – AED 35,000",
    "AED 35,000 – AED 75,000",
    "AED 75,000 – AED 150,000",
    "AED 150,000 – AED 500,000",
    "AED 500,000+"
  ];

  return (
    <main className="flex-grow pt-24 md:pt-32 pb-20 transition-colors duration-300">
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
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <span className="text-sm font-bold text-accent-coral tracking-widest uppercase block mb-2">Let's Connect</span>
            <h1 className="font-display text-4xl sm:text-5xl font-normal tracking-tight text-text">
              Scale Your Brand <span className="font-extrabold text-accent-sky">Now</span>
            </h1>
            <p className="text-text-muted mt-3 text-sm sm:text-base leading-relaxed">
              Fill out the form below, and we'll evaluate your project within 24 hours. Directly execute your visual and technical goals.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Form Column */}
          <Reveal className="lg:col-span-7" x={-40}>
            <div className="brutalist-card bg-surface p-8 sm:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent-sky/10 rounded-full blur-2xl -z-10" />

              {success ? (
                <div className="text-center py-12 space-y-6">
                  <div className="mx-auto w-16 h-16 brutalist-badge-sky flex items-center justify-center text-text mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-text">
                    Growth Inquiry Sent!
                  </h3>
                  <p className="text-text-muted text-sm max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out. We have logged your request and will contact you directly at <span className="text-accent-coral font-bold">{email || "your email"}</span>.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="brutalist-btn brutalist-btn-secondary px-6 py-2.5 text-xs mt-6"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMsg && (
                    <div className="p-4 border-2 border-border bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl flex items-start gap-3 text-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p>{errorMsg}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="block text-sm font-bold text-text uppercase tracking-wider">
                        Full Name
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border-2 border-border bg-bg text-text rounded-xl focus:outline-none focus:border-accent-coral transition-colors placeholder:text-text-muted/50 text-sm"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-bold text-text uppercase tracking-wider">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 border-2 border-border bg-bg text-text rounded-xl focus:outline-none focus:border-accent-coral transition-colors placeholder:text-text-muted/50 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Project Focus */}
                    <div className="space-y-2">
                      <label htmlFor="projectFocus" className="block text-sm font-bold text-text uppercase tracking-wider">
                        Project Focus
                      </label>
                      <div className="relative">
                        <select
                          id="projectFocus"
                          value={projectFocus}
                          onChange={(e) => setProjectFocus(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-border bg-bg text-text rounded-xl focus:outline-none focus:border-accent-coral transition-colors appearance-none cursor-pointer text-sm"
                        >
                          {projectFocusOptions.map((opt) => (
                            <option key={opt} value={opt} className="bg-surface text-text">
                              {opt}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-text">
                          ▼
                        </div>
                      </div>
                    </div>

                    {/* Budget */}
                    <div className="space-y-2">
                      <label htmlFor="budgetRange" className="block text-sm font-bold text-text uppercase tracking-wider">
                        Monthly Budget
                      </label>
                      <div className="relative">
                        <select
                          id="budgetRange"
                          value={budgetRange}
                          onChange={(e) => setBudgetRange(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-border bg-bg text-text rounded-xl focus:outline-none focus:border-accent-coral transition-colors appearance-none cursor-pointer text-sm"
                        >
                          {budgetOptions.map((opt) => (
                            <option key={opt} value={opt} className="bg-surface text-text">
                              {opt}
                            </option>
                          ))}
                          {budgetRange.startsWith("Ad Budget:") && (
                            <option value={budgetRange} className="bg-surface text-text">
                              {budgetRange}
                            </option>
                          )}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-text">
                          ▼
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-bold text-text uppercase tracking-wider">
                      How can we help your business?
                      </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Provide details about your branding, design, or website needs..."
                      className="w-full px-4 py-3 border-2 border-border bg-bg text-text rounded-xl focus:outline-none focus:border-accent-coral transition-colors placeholder:text-text-muted/50 text-sm"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="brutalist-btn brutalist-btn-primary w-full py-4 flex items-center justify-center gap-2 text-sm select-none"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing Submission...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Growth Inquiries
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </Reveal>

          {/* Info & Map Column */}
          <Reveal className="lg:col-span-5 space-y-8" x={40} delay={0.1}>

            {/* Direct Info */}
            <div className="brutalist-card p-6 bg-surface space-y-6">
              <h3 className="font-display font-bold text-xl text-text">Direct Contacts</h3>
              
              <Stagger className="space-y-4">
                <StaggerItem>
                <a
                  href="mailto:hasanshahirconnect@gmail.com"
                  className="flex items-start gap-4 p-3 border border-border/10 bg-bg hover:border-border rounded-xl transition-all group"
                >
                  <span className="brutalist-badge-coral w-10 h-10 flex-shrink-0">
                    <Mail className="w-4 h-4 text-white" />
                  </span>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Write Us Directly</span>
                    <span className="text-sm font-semibold text-text truncate block group-hover:underline underline-offset-2">
                      hasanshahirconnect@gmail.com
                    </span>
                  </div>
                </a>

                </StaggerItem>
                <StaggerItem>
                <a
                  href="https://wa.me/923330405008"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-3 border border-border/10 bg-bg hover:border-border rounded-xl transition-all group"
                >
                  <span className="brutalist-badge-sky w-10 h-10 flex-shrink-0">
                    <Phone className="w-4 h-4 text-text" />
                  </span>
                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">WhatsApp Connect</span>
                    <span className="text-sm font-semibold text-text block group-hover:underline underline-offset-2">
                      +92 333 0405008
                    </span>
                  </div>
                </a>
                </StaggerItem>
                <StaggerItem>
                <div className="flex items-start gap-4 p-3 border border-border/10 bg-bg rounded-xl">
                  <span className="brutalist-badge-coral w-10 h-10 flex-shrink-0 bg-accent-amber">
                    <MapPin className="w-4 h-4 text-text" />
                  </span>
                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Office Address</span>
                    <span className="text-sm font-semibold text-text block">
                      Taleemi Bagh, Block 14, Federal B Area, Karachi, Pakistan
                    </span>
                  </div>
                </div>
                </StaggerItem>
              </Stagger>
            </div>

            {/* Map Embed */}
            <div className="brutalist-card bg-surface overflow-hidden p-2">
              <iframe
                src="https://www.google.com/maps?q=Taleemi+Bagh+Block+14+Federal+B+Area+Karachi+Pakistan&output=embed"
                width="100%"
                height="340"
                style={{ border: 0, borderRadius: "10px" }}
                loading="lazy"
                title="HKH Location Map"
              />
            </div>
          </Reveal>

        </div>
      </div>
    </main>
  );
}

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-accent-coral border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ContactContent />
      </Suspense>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
