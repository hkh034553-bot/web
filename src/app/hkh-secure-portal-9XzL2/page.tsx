"use client";

import React, { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConfirmModal from "@/components/ConfirmModal";
import { Eye, EyeOff, Lock } from "lucide-react";

interface Submission {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
}

interface Recipient {
  id: string;
  email: string;
  name?: string | null;
  status: string;
  created_at: string;
}

interface AuditEntry {
  id: string;
  admin_user_id?: string | null;
  action: string;
  target_table: string;
  created_at: string;
}

// ------------------------------------------------------------------
// Client-side login lockout (defense-in-depth; Supabase also rate-limits)
// ------------------------------------------------------------------
const LOCK_KEY = "hkh_login_lock";
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

function getLock(): { count: number; lockedUntil: number } {
  try {
    const raw = sessionStorage.getItem(LOCK_KEY);
    if (!raw) return { count: 0, lockedUntil: 0 };
    const parsed = JSON.parse(raw);
    return {
      count: typeof parsed.count === "number" ? parsed.count : 0,
      lockedUntil: typeof parsed.lockedUntil === "number" ? parsed.lockedUntil : 0,
    };
  } catch {
    return { count: 0, lockedUntil: 0 };
  }
}

function setLock(count: number, lockedUntil = 0) {
  try {
    sessionStorage.setItem(LOCK_KEY, JSON.stringify({ count, lockedUntil }));
  } catch {
    /* ignore */
  }
}

function clearLock() {
  try {
    sessionStorage.removeItem(LOCK_KEY);
  } catch {
    /* ignore */
  }
}

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);

  // Auth state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authSuccess, setAuthSuccess] = useState("");
  const [showSecretGateway, setShowSecretGateway] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [secretError, setSecretError] = useState("");

  // Data state
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [logs, setLogs] = useState<AuditEntry[]>([]);

  // Campaign state
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignHtml, setCampaignHtml] = useState("");
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [campaignMessage, setCampaignMessage] = useState("");
  const [showCampaignConfirm, setShowCampaignConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [loading, setLoading] = useState(true);

  /** Log a security event to audit_log (never blocks the UI). */
  const logSecurityEvent = async (action: string, metadata: Record<string, unknown> = {}) => {
    try {
      await supabase.rpc("log_security_event", { p_action: action, p_metadata: metadata });
    } catch {
      /* logging must never break the flow */
    }
  };

  const checkRoleAndFetchData = async () => {
    setLoading(true);
    try {
      // Check if user is an admin
      const { data: adminCheck } = await supabase.rpc("is_admin");

      if (!adminCheck) {
        // Not an admin, show the secret gateway instead of kicking them out
        setShowSecretGateway(true);
        setLoading(false);
        return;
      }

      setShowSecretGateway(false);

      // Fetch Admin Data
      const [subsRes, recsRes, logsRes] = await Promise.all([
        supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
        supabase.from("campaign_recipients").select("*").order("created_at", { ascending: false }),
        supabase.from("audit_log").select("*").order("created_at", { ascending: false }),
      ]);

      if (subsRes.data) setSubmissions(subsRes.data);
      if (recsRes.data) setRecipients(recsRes.data);
      if (logsRes.data) setLogs(logsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkRoleAndFetchData();
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkRoleAndFetchData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setLoading(true);

    const now = Date.now();
    const lock = getLock();
    if (lock.lockedUntil > now) {
      setAuthError("Too many failed attempts. Access temporarily locked — try again later.");
      setLoading(false);
      return;
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        // Generic message — do not reveal whether the account already exists
        setAuthError("Unable to complete registration. Please try again.");
        logSecurityEvent("signup_failed", { email });
      } else {
        setAuthSuccess("Registration successful! Please check your email for a confirmation link.");
        setIsSignUp(false);
        logSecurityEvent("signup_success", { email });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        const nextCount = (lock.count || 0) + 1;
        if (nextCount >= MAX_ATTEMPTS) {
          setLock(0, now + LOCK_MS);
          setAuthError("Too many failed attempts. Access temporarily locked for 15 minutes.");
          logSecurityEvent("login_locked", { email });
        } else {
          setLock(nextCount, 0);
          // Generic message — prevents user enumeration
          setAuthError("Invalid email or password.");
          logSecurityEvent("login_failed", { email, attempts: nextCount });
        }
      } else {
        clearLock();
        logSecurityEvent("login_success", { email });
      }
    }
    setLoading(false);
  };

  const handleSecretSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecretError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc("register_admin", { secret_code: secretCode });
      if (error) throw error;

      if (data) {
        // Success! Reload data
        logSecurityEvent("gateway_unlocked");
        await checkRoleAndFetchData();
      } else {
        logSecurityEvent("gateway_attempt_failed");
        setSecretError("Invalid secret code.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred.";
      logSecurityEvent("gateway_error", { message });
      setSecretError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logSecurityEvent("logout");
    await supabase.auth.signOut();
    setShowLogoutConfirm(false);
  };

  // Stage the campaign send — requires explicit confirmation
  const requestCampaignSend = (e: React.FormEvent) => {
    e.preventDefault();
    setCampaignMessage("");
    if (!campaignSubject.trim() || !campaignHtml.trim()) {
      setCampaignMessage("Error: Please provide both a subject and content.");
      return;
    }
    if (recipients.length === 0) {
      setCampaignMessage("Error: No active recipients to broadcast to.");
      return;
    }
    setShowCampaignConfirm(true);
  };

  const executeCampaignSend = async () => {
    setShowCampaignConfirm(false);
    setSendingCampaign(true);
    setCampaignMessage("");

    try {
      const sessionResponse = await supabase.auth.getSession();
      const token = sessionResponse.data.session?.access_token || "";

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ subject: campaignSubject, html: campaignHtml }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send campaign");
      }

      logSecurityEvent("campaign_sent", { subject: campaignSubject.slice(0, 100), recipients: recipients.length });
      setCampaignMessage("Campaign sent successfully!");
      setCampaignSubject("");
      setCampaignHtml("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send campaign";
      logSecurityEvent("campaign_send_failed", { error: message });
      setCampaignMessage(`Error: ${message}`);
    } finally {
      setSendingCampaign(false);
    }
  };

  // -------------------------------------------------------------
  // LOADING STATE
  // -------------------------------------------------------------
  if (loading && !session && !authError) {
    return (
      <main id="main-content" tabIndex={-1} className="min-h-screen flex flex-col bg-bg text-text">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4 pt-32">
          <div className="glass-card p-12 text-center animate-pulse">
            <h2 className="text-xl font-display text-text-muted">Authenticating Secure Connection...</h2>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // -------------------------------------------------------------
  // LOGIN PAGE
  // -------------------------------------------------------------
  if (!session) {
    return (
      <main id="main-content" tabIndex={-1} className="min-h-screen flex flex-col bg-bg text-text">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4 pt-32 pb-16 relative overflow-hidden">

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-flow-gradient rounded-full blur-[120px] opacity-20 pointer-events-none" />

          <div className="w-full max-w-md relative z-10">
            <div className="brutalist-card p-8 md:p-10 relative overflow-hidden border-accent-sky">
              <div className="mb-8">
                <span className="eyebrow eyebrow-blue">{isSignUp ? "Admin Registration" : "Restricted Zone"}</span>
                <h2 className="text-3xl font-display font-bold">
                  {isSignUp ? "Create Account" : "Admin Login"}
                </h2>
              </div>

              {authError && (
                <div className="mb-6 p-4 border-2 border-accent-coral bg-accent-coral/10 text-accent-coral text-sm rounded-lg font-medium flex items-start gap-2">
                  <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}
              {authSuccess && (
                <div className="mb-6 p-4 border-2 border-green-500 bg-green-500/10 text-green-500 text-sm rounded-lg font-medium">
                  {authSuccess}
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-text-muted">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-surface border-2 border-border p-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-accent-sky/20 transition-all font-medium"
                    placeholder="admin@hkh.agency"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-text-muted">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-surface border-2 border-border p-4 pr-12 rounded-xl focus:outline-none focus:ring-4 focus:ring-accent-sky/20 transition-all font-medium"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 border-2 border-border rounded-full flex items-center justify-center bg-bg text-text hover:bg-accent-sky hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full brutalist-btn brutalist-btn-primary py-4 text-lg mt-2 bg-accent-sky hover:bg-accent-blue hover:border-accent-blue"
                  disabled={loading}
                >
                  {loading ? "Processing..." : (isSignUp ? "Register" : "Authenticate")}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-border/10 text-center">
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setAuthError("");
                    setAuthSuccess("");
                  }}
                  className="text-text-muted hover:text-text text-sm font-bold uppercase tracking-wider"
                >
                  {isSignUp ? "Already have an account? Log In" : "Need an account? Register"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // -------------------------------------------------------------
  // SECRET GATEWAY
  // -------------------------------------------------------------
  if (showSecretGateway) {
    return (
      <main id="main-content" tabIndex={-1} className="min-h-screen flex flex-col bg-bg text-text">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4 pt-32 pb-16">
          <div className="w-full max-w-md">
            <div className="brutalist-card p-8 md:p-10 border-accent-gold">
              <div className="mb-8 text-center">
                <span className="eyebrow eyebrow-gold">Verification Required</span>
                <h2 className="text-2xl font-display font-bold mt-2">
                  Admin Gateway
                </h2>
                <p className="text-sm text-text-muted mt-2">
                  Your account does not have administrator privileges. Please enter the master access code to unlock the Command Center.
                </p>
              </div>

              {secretError && (
                <div className="mb-6 p-4 border-2 border-accent-coral bg-accent-coral/10 text-accent-coral text-sm rounded-lg font-medium">
                  {secretError}
                </div>
              )}

              <form onSubmit={handleSecretSubmit} className="space-y-6">
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    value={secretCode}
                    onChange={e => setSecretCode(e.target.value)}
                    className="w-full bg-surface border-2 border-border p-4 pr-12 rounded-xl focus:outline-none focus:ring-4 focus:ring-accent-gold/20 transition-all font-mono text-center tracking-[0.2em]"
                    placeholder="ENTER SECRET CODE"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(s => !s)}
                    aria-label={showSecret ? "Hide code" : "Show code"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 border-2 border-border rounded-full flex items-center justify-center bg-bg text-text hover:bg-accent-gold hover:text-white transition-colors cursor-pointer"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full brutalist-btn brutalist-btn-primary py-4 text-lg bg-accent-gold hover:bg-accent-coral hover:border-accent-coral"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Unlock Access"}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-border/10 text-center">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="text-text-muted hover:text-accent-coral text-sm font-bold uppercase tracking-wider"
                >
                  Cancel & Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />

        <ConfirmModal
          open={showLogoutConfirm}
          title="Sign out?"
          message="You'll need to sign back in to access the Command Center."
          confirmLabel="Sign Out"
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      </main>
    );
  }

  // -------------------------------------------------------------
  // DASHBOARD PAGE
  // -------------------------------------------------------------
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen flex flex-col bg-bg text-text">
      <Navbar />
      <div className="flex-1 p-4 md:p-8 pt-32 max-w-7xl mx-auto w-full">

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <span className="eyebrow eyebrow-blue">Command Center</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold">
              Admin Dashboard
            </h1>
            <p className="text-text-muted mt-2 font-medium">Logged in as {session.user.email}</p>
          </div>
          <button onClick={() => setShowLogoutConfirm(true)} className="brutalist-btn brutalist-btn-secondary px-6 py-3 border-accent-coral text-accent-coral hover:bg-accent-coral hover:text-white">
            Terminate Session
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">

          {/* Contact Submissions */}
          <div className="brutalist-card p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-border/10">
              <h2 className="text-2xl font-display font-bold">Inbound Leads</h2>
              <span className="brutalist-badge-coral px-3 py-1 text-xs font-bold text-white">
                {submissions.length} Total
              </span>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {submissions.length === 0 ? <p className="text-text-muted font-medium py-8 text-center border-2 border-dashed border-border/20 rounded-xl">No leads found.</p> :
                submissions.map(sub => (
                  <div key={sub.id} className="glass-card p-5 group hover:border-accent-coral transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-lg">{sub.name}</p>
                      <p className="text-xs text-text-muted font-medium bg-surface px-2 py-1 rounded-md border border-border/10">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <a href={`mailto:${sub.email}`} className="text-accent-blue text-sm font-medium hover:underline mb-3 block">
                      {sub.email}
                    </a>
                    <p className="text-sm leading-relaxed">{sub.message}</p>
                    {(sub.utm_source || sub.utm_campaign) && (
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mt-3 pt-3 border-t border-border/10">
                        Source: {sub.utm_source || "direct"}
                        {sub.utm_campaign ? ` · Campaign: ${sub.utm_campaign}` : ""}
                        {sub.utm_medium ? ` · ${sub.utm_medium}` : ""}
                      </p>
                    )}
                  </div>
                ))
              }
            </div>
          </div>

          {/* Campaign Section */}
          <div className="flex flex-col gap-8">
            {/* Active Recipients */}
            <div className="brutalist-card p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-border/10">
                <h2 className="text-2xl font-display font-bold">Campaign Database</h2>
                <span className="brutalist-badge-sky px-3 py-1 text-xs font-bold text-white">
                  {recipients.length} Active
                </span>
              </div>

              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                {recipients.length === 0 ? <p className="text-text-muted font-medium py-8 text-center border-2 border-dashed border-border/20 rounded-xl">No recipients found.</p> :
                  recipients.map(rec => (
                    <div key={rec.id} className="glass-card p-4 flex justify-between items-center group hover:border-accent-sky transition-colors">
                      <div>
                        <p className="font-bold">{rec.name || 'Anonymous'}</p>
                        <p className="text-sm text-text-muted">{rec.email}</p>
                      </div>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wide border-2 ${rec.status === 'active' ? 'bg-accent-gold/20 text-accent-gold border-accent-gold/30' : 'bg-surface text-text-muted border-border/10'}`}>
                        {rec.status}
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Campaign Sender UI */}
            <div className="brutalist-card p-6 md:p-8 border-accent-sky">
              <div className="mb-6 pb-4 border-b-2 border-border/10">
                <h2 className="text-2xl font-display font-bold text-accent-sky">Launch Campaign</h2>
                <p className="text-sm text-text-muted mt-1">Broadcast email to all active recipients.</p>
              </div>

              {campaignMessage && (
                <div className={`mb-6 p-4 border-2 text-sm rounded-lg font-bold ${campaignMessage.includes('Error') ? 'border-accent-coral bg-accent-coral/10 text-accent-coral' : 'border-green-500 bg-green-500/10 text-green-500'}`}>
                  {campaignMessage}
                </div>
              )}

              <form onSubmit={requestCampaignSend} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-text-muted">Email Subject</label>
                  <input
                    type="text"
                    value={campaignSubject}
                    onChange={(e) => setCampaignSubject(e.target.value)}
                    required
                    maxLength={200}
                    className="w-full bg-surface border-2 border-border p-3 rounded-lg focus:outline-none focus:border-accent-sky text-sm"
                    placeholder="Exclusive Offer from HKH..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-text-muted">HTML Content</label>
                  <textarea
                    value={campaignHtml}
                    onChange={(e) => setCampaignHtml(e.target.value)}
                    required
                    rows={4}
                    className="w-full bg-surface border-2 border-border p-3 rounded-lg focus:outline-none focus:border-accent-sky text-sm font-mono"
                    placeholder="<h1>Hello!</h1><p>Check out our new services...</p>"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sendingCampaign || recipients.length === 0}
                  className="w-full brutalist-btn brutalist-btn-primary py-3 bg-accent-sky hover:bg-accent-blue hover:border-accent-blue disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingCampaign ? "Transmitting..." : "Send Broadcast"}
                </button>
              </form>
            </div>
          </div>

          {/* Audit Log */}
          <div className="brutalist-card p-6 md:p-8 lg:col-span-2">
            <div className="mb-6 pb-4 border-b-2 border-border/10">
              <span className="eyebrow text-text-muted">Security</span>
              <h2 className="text-2xl font-display font-bold">Audit Log</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-border/10">
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs text-text-muted">Time</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs text-text-muted">Admin ID</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs text-text-muted">Action</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs text-text-muted">Table</th>
                  </tr>
                </thead>
                <tbody className="font-medium text-sm">
                  {logs.length === 0 ? (
                    <tr><td colSpan={4} className="py-12 text-text-muted text-center border-2 border-dashed border-border/20 rounded-xl mt-4 table-cell">No security events recorded.</td></tr>
                  ) : logs.map(log => (
                    <tr key={log.id} className="border-b border-border/5 hover:bg-surface/50 transition-colors">
                      <td className="py-4 px-4 whitespace-nowrap text-text-muted">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="py-4 px-4 whitespace-nowrap font-mono text-xs max-w-[120px] truncate" title={log.admin_user_id ?? undefined}>{log.admin_user_id}</td>
                      <td className="py-4 px-4">
                        <span className="bg-surface border-2 border-border px-2 py-1 rounded text-xs font-bold uppercase">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-accent-coral">{log.target_table}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
      <Footer />

      {/* Campaign confirmation modal */}
      <ConfirmModal
        open={showCampaignConfirm}
        title="Broadcast campaign?"
        message={
          <>
            You&apos;re about to email <strong className="text-text">{recipients.length} active recipient{recipients.length === 1 ? "" : "s"}</strong> with the subject{" "}
            <strong className="text-text">“{campaignSubject.trim().slice(0, 60)}”</strong>. This action cannot be undone.
          </>
        }
        confirmLabel="Send Broadcast"
        tone="primary"
        busy={sendingCampaign}
        onConfirm={executeCampaignSend}
        onCancel={() => setShowCampaignConfirm(false)}
      />

      {/* Logout confirmation modal */}
      <ConfirmModal
        open={showLogoutConfirm}
        title="Terminate session?"
        message="You&apos;ll be signed out of the Command Center and will need to authenticate again."
        confirmLabel="Sign Out"
        tone="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </main>
  );
}
