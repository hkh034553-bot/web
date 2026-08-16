"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  
  // Auth state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  
  // Data state
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  // Campaign state
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignHtml, setCampaignHtml] = useState("");
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [campaignMessage, setCampaignMessage] = useState("");

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
      
      if (!adminCheck) {
        // Not an admin, kick them out
        await supabase.auth.signOut();
        setSession(null);
        setAuthError("Unauthorized Access. This portal is strictly for administrators.");
        return;
      }

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setAuthError(error.message);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingCampaign(true);
    setCampaignMessage("");

    try {
      const sessionResponse = await supabase.auth.getSession();
      const token = sessionResponse.data.session?.access_token || "";

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ subject: campaignSubject, html: campaignHtml })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send campaign");
      }

      setCampaignMessage("Campaign sent successfully!");
      setCampaignSubject("");
      setCampaignHtml("");
    } catch (err: any) {
      setCampaignMessage(`Error: ${err.message}`);
    } finally {
      setSendingCampaign(false);
    }
  };

  // -------------------------------------------------------------
  // LOADING STATE
  // -------------------------------------------------------------
  if (loading && !session && !authError) {
    return (
      <main className="min-h-screen flex flex-col bg-bg text-text">
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
      <main className="min-h-screen flex flex-col bg-bg text-text">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4 pt-32 pb-16 relative overflow-hidden">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-flow-gradient rounded-full blur-[120px] opacity-20 pointer-events-none" />

          <div className="w-full max-w-md relative z-10">
            <div className="brutalist-card p-8 md:p-10 relative overflow-hidden border-accent-sky">
              <div className="mb-8">
                <span className="eyebrow eyebrow-blue">Restricted Zone</span>
                <h2 className="text-3xl font-display font-bold">
                  Admin Login
                </h2>
              </div>
              
              {authError && (
                <div className="mb-6 p-4 border-2 border-accent-coral bg-accent-coral/10 text-accent-coral text-sm rounded-lg font-medium">
                  {authError}
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
                  className="w-full brutalist-btn brutalist-btn-primary py-4 text-lg mt-2 bg-accent-sky hover:bg-accent-blue hover:border-accent-blue" 
                  disabled={loading}
                >
                  {loading ? "Authorizing..." : "Authenticate"}
                </button>
              </form>
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
            <span className="eyebrow eyebrow-blue">Command Center</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold">
              Admin Dashboard
            </h1>
            <p className="text-text-muted mt-2 font-medium">Logged in as {session.user.email}</p>
          </div>
          <button onClick={handleLogout} className="brutalist-btn brutalist-btn-secondary px-6 py-3 border-accent-coral text-accent-coral hover:bg-accent-coral hover:text-white">
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

              <form onSubmit={handleSendCampaign} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-text-muted">Email Subject</label>
                  <input 
                    type="text" 
                    value={campaignSubject}
                    onChange={(e) => setCampaignSubject(e.target.value)}
                    required
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

        </div>
      </div>
      <Footer />
    </main>
  );
}
