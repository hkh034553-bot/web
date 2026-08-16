"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  // Auth state
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  
  // Data state
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

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

  const checkRoleAndFetchData = async () => {
    setLoading(true);
    try {
      // Check if user is an admin
      const { data: adminCheck } = await supabase.rpc("is_admin");
      const userIsAdmin = !!adminCheck;
      setIsAdmin(userIsAdmin);

      if (userIsAdmin) {
        // Fetch Admin Data
        const [subsRes, recsRes, logsRes] = await Promise.all([
          supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
          supabase.from("campaign_recipients").select("*").order("created_at", { ascending: false }),
          supabase.from("audit_log").select("*").order("created_at", { ascending: false }),
        ]);
        
        if (subsRes.data) setSubmissions(subsRes.data);
        if (recsRes.data) setRecipients(recsRes.data);
        if (logsRes.data) setLogs(logsRes.data);
      } else {
        // Fetch Client Data (only their own submissions due to RLS)
        const { data: userSubs } = await supabase
          .from("contact_submissions")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (userSubs) setSubmissions(userSubs);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthMessage("");
    setLoading(true);
    
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setAuthError(error.message);
      } else {
        setAuthMessage("Account created successfully! Welcome to the HKH Client Portal.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setAuthError(error.message);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(null);
  };

  // -------------------------------------------------------------
  // LOADING STATE
  // -------------------------------------------------------------
  if (loading && !session && !authError && !authMessage) {
    return (
      <main className="min-h-screen flex flex-col bg-bg text-text">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4 pt-32">
          <div className="glass-card p-12 text-center animate-pulse">
            <h2 className="text-xl font-display text-text-muted">Authenticating...</h2>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // -------------------------------------------------------------
  // LOGIN / SIGNUP PAGE
  // -------------------------------------------------------------
  if (!session) {
    return (
      <main className="min-h-screen flex flex-col bg-bg text-text">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4 pt-32 pb-16 relative overflow-hidden">
          
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-flow-gradient rounded-full blur-[120px] opacity-20 pointer-events-none" />

          <div className="w-full max-w-md relative z-10">
            <div className="brutalist-card p-8 md:p-10 relative overflow-hidden">
              <div className="mb-8">
                <span className="eyebrow">{isSignUp ? "Join the Network" : "Secure Access"}</span>
                <h2 className="text-3xl font-display font-bold">
                  {isSignUp ? "Client Portal" : "Client Portal"}
                </h2>
              </div>
              
              {authError && (
                <div className="mb-6 p-4 border-2 border-accent-coral bg-accent-coral/10 text-accent-coral text-sm rounded-lg font-medium">
                  {authError}
                </div>
              )}
              {authMessage && (
                <div className="mb-6 p-4 border-2 border-accent-sky bg-accent-sky/10 text-accent-sky text-sm rounded-lg font-medium leading-relaxed">
                  {authMessage}
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-text-muted">Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-surface border-2 border-border p-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-accent-coral/20 transition-all font-medium" 
                    placeholder="hq@hkh.agency"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-text-muted">Password</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-surface border-2 border-border p-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-accent-sky/20 transition-all font-medium" 
                    placeholder="••••••••"
                    required 
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full brutalist-btn brutalist-btn-primary py-4 text-lg mt-2" 
                  disabled={loading}
                >
                  {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
                </button>
              </form>
              
              <div className="mt-8 pt-6 border-t-2 border-border/10 text-center">
                <p className="text-text-muted font-medium mb-4">
                  {isSignUp ? "Already have an account?" : "Need an admin account?"}
                </p>
                <button 
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setAuthError("");
                    setAuthMessage("");
                  }} 
                  className="brutalist-btn brutalist-btn-secondary px-6 py-2 text-sm"
                >
                  {isSignUp ? "Switch to Login" : "Create Account"}
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
  // DASHBOARD PAGE
  // -------------------------------------------------------------
  return (
    <main className="min-h-screen flex flex-col bg-bg text-text">
      <Navbar />
      <div className="flex-1 p-4 md:p-8 pt-32 max-w-7xl mx-auto w-full">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <span className={`eyebrow ${isAdmin ? 'eyebrow-blue' : ''}`}>
              {isAdmin ? "Command Center" : "Client Overview"}
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold">
              {isAdmin ? "Admin Dashboard" : "My Dashboard"}
            </h1>
            <p className="text-text-muted mt-2 font-medium">Logged in as {session.user.email}</p>
          </div>
          <button onClick={handleLogout} className="brutalist-btn brutalist-btn-secondary px-6 py-3">
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          
          {/* Contact Submissions */}
          <div className="brutalist-card p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-border/10">
              <h2 className="text-2xl font-display font-bold">
                {isAdmin ? "Inbound Leads" : "My Inquiries"}
              </h2>
              <span className="brutalist-badge-coral px-3 py-1 text-xs font-bold text-white">
                {submissions.length} Total
              </span>
            </div>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {submissions.length === 0 ? <p className="text-text-muted font-medium py-8 text-center border-2 border-dashed border-border/20 rounded-xl">No inquiries found.</p> : 
                submissions.map(sub => (
                  <div key={sub.id} className="glass-card p-5 group hover:border-accent-coral transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-lg">{sub.name}</p>
                      <p className="text-xs text-text-muted font-medium bg-surface px-2 py-1 rounded-md border border-border/10">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {isAdmin && (
                      <a href={`mailto:${sub.email}`} className="text-accent-blue text-sm font-medium hover:underline mb-3 block">
                        {sub.email}
                      </a>
                    )}
                    <p className="text-sm leading-relaxed">{sub.message}</p>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Campaign Recipients (Admin Only) */}
          {isAdmin && (
            <div className="brutalist-card p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-border/10">
                <h2 className="text-2xl font-display font-bold">Campaign List</h2>
                <span className="brutalist-badge-sky px-3 py-1 text-xs font-bold text-white">
                  {recipients.length} Active
                </span>
              </div>
              
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
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
          )}

          {/* Audit Log (Admin Only) */}
          {isAdmin && (
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
                        <td className="py-4 px-4 whitespace-nowrap font-mono text-xs max-w-[120px] truncate" title={log.admin_user_id}>{log.admin_user_id}</td>
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
          )}
          
          {/* Normal User Dashboard filler block (to prevent uneven layout if only 1 item) */}
          {!isAdmin && (
            <div className="brutalist-card p-6 md:p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-accent-sky/10 rounded-full flex items-center justify-center mb-4 border-2 border-accent-sky">
                <svg className="w-8 h-8 text-accent-sky" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-display font-bold mb-2">Need to update a request?</h3>
              <p className="text-text-muted font-medium mb-6">Our team is already reviewing your previous inquiries. If you have any additional details, feel free to submit a new contact form.</p>
              <a href="/contact" className="brutalist-btn brutalist-btn-primary px-6 py-3">
                Contact Us
              </a>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </main>
  );
}
