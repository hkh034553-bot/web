"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  ArrowLeft,
  Search,
  Filter,
  Trash2,
  Calendar,
  DollarSign,
  Briefcase,
  Users,
  Eye,
  LogOut,
  Sparkles,
  Info,
  AlertCircle,
  Lock,
  Send,
  CheckCircle2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Reveal from "@/components/Reveal";
import { Stagger, StaggerItem } from "@/components/Stagger";

// Recharts components loaded dynamically to prevent SSR hydration errors
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

// Mock submissions for visualization when database is empty
const MOCK_SUBMISSIONS = [
  {
    id: "mock-1",
    created_at: new Date(Date.now() - 2 * 3600000 * 24).toISOString(), // 2 days ago
    full_name: "Sarah Jenkins",
    email: "sarah@clickfunnels.io",
    project_focus: "Website Development",
    budget_range: "AED 15,000 – AED 35,000",
    message: "We need a custom landing page for our SaaS product launch. High speed is critical, page speed score must be above 95. We already have branding guides."
  },
  {
    id: "mock-2",
    created_at: new Date(Date.now() - 5 * 3600000 * 24).toISOString(), // 5 days ago
    full_name: "Tariq Mahmood",
    email: "t.mahmood@visaagent.ae",
    project_focus: "Social Media Marketing",
    budget_range: "AED 5,000 – AED 15,000",
    message: "Looking for an agency to manage our Instagram reels and YouTube channel SEO optimization. We need 3 reels weekly."
  },
  {
    id: "mock-3",
    created_at: new Date(Date.now() - 1 * 3600000 * 24).toISOString(), // 1 day ago
    full_name: "Michael Chen",
    email: "m.chen@hypergrowth.com",
    project_focus: "App Development",
    budget_range: "AED 75,000 – AED 150,000",
    message: "We want to build a cross platform React Native app for iOS and Android. Integration with Stripe and Supabase Auth required."
  },
  {
    id: "mock-4",
    created_at: new Date(Date.now() - 10 * 3600000 * 24).toISOString(), // 10 days ago
    full_name: "Zoya Khan",
    email: "zoya@ufmakeup.com",
    project_focus: "Branding",
    budget_range: "AED 5,000 – AED 15,000",
    message: "Rebranding project for our cosmetic brand line. Logos, vector packages, color palettes, and social media media kits."
  },
  {
    id: "mock-5",
    created_at: new Date(Date.now() - 3 * 3600000 * 24).toISOString(), // 3 days ago
    full_name: "Richard Vance",
    email: "rvance@cfo-advisor.com",
    project_focus: "Website Development",
    budget_range: "AED 35,000 – AED 75,000",
    message: "Next.js corporate website with interactive dashboards and lead management systems. Need custom design assets as well."
  }
];

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isDemoData, setIsDemoData] = useState(false);

  // Admin login states
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState("");

  // Filter States
  const [search, setSearch] = useState("");
  const [focusFilter, setFocusFilter] = useState("All");
  const [budgetFilter, setBudgetFilter] = useState("All");
  const [sortByDate, setSortByDate] = useState<"desc" | "asc">("desc");

  // Collapsed message states
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Client email campaign states
  const [campaignRecipients, setCampaignRecipients] = useState<any[]>([]);
  const [campaignName, setCampaignName] = useState("");
  const [campaignEmail, setCampaignEmail] = useState("");
  const [campaignStatusMsg, setCampaignStatusMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [campaignSending, setCampaignSending] = useState(false);
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    const authenticateAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.user.email === "hasanshahirconnect@gmail.com") {
        setIsAdmin(true);
        setAccessToken(session.access_token);
        fetchSubmissions();
        fetchCampaignRecipients();
      } else {
        // If not authenticated, stop showing loading spinner and show the admin form inline
        setIsAdmin(false);
        setLoading(false);
      }
    };

    authenticateAdmin();
  }, [router, supabase]);

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginLoading(true);
    setAdminLoginError("");

    if (adminEmail !== "hasanshahirconnect@gmail.com") {
      setAdminLoginError("Access Denied: Unauthorized admin email.");
      setAdminLoginLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user?.email === "hasanshahirconnect@gmail.com") {
        setIsAdmin(true);
        setAccessToken(data.session?.access_token || "");
        fetchSubmissions();
        fetchCampaignRecipients();
      } else {
        await supabase.auth.signOut();
        setAdminLoginError("Access Denied.");
      }
    } catch (err: any) {
      setAdminLoginError(err.message || "Failed to authenticate. Verify credentials.");
    } finally {
      setAdminLoginLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);

      if (data && data.length > 0) {
        setSubmissions(data);
        setIsDemoData(false);
      } else {
        // Fallback to mock data to show dashboard working
        setSubmissions(MOCK_SUBMISSIONS);
        setIsDemoData(true);
      }
    } catch (err) {
      console.error("Failed to load submissions:", err);
      // Fallback
      setSubmissions(MOCK_SUBMISSIONS);
      setIsDemoData(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const fetchCampaignRecipients = async () => {
    const { data, error } = await supabase
      .from("campaign_recipients")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setCampaignRecipients(data);
  };

  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = campaignEmail.trim().toLowerCase();
    if (!email) return;
    setCampaignStatusMsg(null);
    const { error } = await supabase.from("campaign_recipients").insert({
      full_name: campaignName.trim() || null,
      email,
    });
    if (error) {
      setCampaignStatusMsg({ type: "err", text: error.message });
      return;
    }
    setCampaignName("");
    setCampaignEmail("");
    setCampaignStatusMsg({ type: "ok", text: "Recipient added to the list." });
    fetchCampaignRecipients();
  };

  const handleDeleteRecipient = async (id: string) => {
    const { error } = await supabase.from("campaign_recipients").delete().eq("id", id);
    if (!error) fetchCampaignRecipients();
  };

  const handleSendCampaign = async () => {
    setCampaignSending(true);
    setCampaignStatusMsg(null);
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke("send-campaign-emails", {
      headers: { Authorization: `Bearer ${session?.access_token ?? accessToken}` },
      body: {},
    });
    if (error) {
      setCampaignStatusMsg({ type: "err", text: `Campaign failed: ${error.message}` });
    } else {
      setCampaignStatusMsg({
        type: "ok",
        text: `Campaign complete: ${data?.sent ?? 0} delivered, ${data?.failed ?? 0} failed.`,
      });
    }
    setCampaignSending(false);
    fetchCampaignRecipients();
  };

  // Calculations
  const totalSubmissions = submissions.length;
  
  const thisWeekSubmissions = submissions.filter((s) => {
    const diffTime = Math.abs(new Date().getTime() - new Date(s.created_at).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  const getPopularItem = (arr: string[]) => {
    if (arr.length === 0) return "N/A";
    const counts = arr.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  };

  const popularFocus = getPopularItem(submissions.map((s) => s.project_focus).filter(Boolean));
  const popularBudget = getPopularItem(submissions.map((s) => s.budget_range).filter(Boolean));

  // Chart Data preparation
  const budgetDistribution = submissions.reduce((acc, curr) => {
    const range = curr.budget_range || "Unspecified";
    // Strip "AED " from visual label for sizing
    const label = range.replace(/AED /g, "");
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(budgetDistribution).map((key) => ({
    name: key,
    value: budgetDistribution[key]
  }));

  // Filtering Logic
  const filteredSubmissions = submissions
    .filter((s) => {
      const matchSearch =
        s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        (s.message && s.message.toLowerCase().includes(search.toLowerCase()));
      
      const matchFocus = focusFilter === "All" || s.project_focus === focusFilter;
      const matchBudget = budgetFilter === "All" || s.budget_range === budgetFilter;

      return matchSearch && matchFocus && matchBudget;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortByDate === "desc" ? dateB - dateA : dateA - dateB;
    });

  // Extract unique filters
  const uniqueFocus = Array.from(new Set(submissions.map((s) => s.project_focus).filter(Boolean)));
  const uniqueBudgets = Array.from(new Set(submissions.map((s) => s.budget_range).filter(Boolean)));

  const handleToggleMessage = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-bg flex flex-col justify-center items-center px-4 py-12 transition-colors duration-300">
        <Reveal y={16}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border bg-surface text-text rounded-full font-bold text-xs shadow-brutal hover:shadow-brutal-sm hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-150 mb-8"
          >
            <ArrowLeft className="w-4 h-4 text-accent-coral" /> Back to Home
          </Link>
        </Reveal>
        <Reveal delay={0.1}>
        <div className="w-full max-w-md brutalist-card bg-surface p-8 space-y-6">
          <div className="text-center space-y-2">
            <span className="brutalist-badge-coral w-10 h-10 flex items-center justify-center font-display font-bold text-xl text-white mx-auto">
              H
            </span>
            <h2 className="font-display font-bold text-2xl text-text">
              Admin Gateway
            </h2>
            <p className="text-text-muted text-xs">
              Direct administrative login. Authorized access only.
            </p>
          </div>

          {adminLoginError && (
            <div className="p-4 border-2 border-border bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl flex items-start gap-3 text-xs">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="font-medium">{adminLoginError}</p>
            </div>
          )}

          <form onSubmit={handleAdminSignIn} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="admin-email" className="block text-[10px] font-bold text-text uppercase tracking-wider">
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="hasanshahirconnect@gmail.com"
                className="w-full px-4 py-3 border-2 border-border bg-bg text-text rounded-xl focus:outline-none focus:border-accent-coral transition-colors text-sm"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="admin-password" className="block text-[10px] font-bold text-text uppercase tracking-wider">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-border bg-bg text-text rounded-xl focus:outline-none focus:border-accent-coral transition-colors text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={adminLoginLoading}
              className="brutalist-btn brutalist-btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm select-none"
            >
              {adminLoginLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="font-bold">Authenticate Admin</span>
              )}
            </button>
          </form>
        </div>
        </Reveal>
      </main>
    );
  }

  // Bar colors
  const COLORS = ["#F4552F", "#2FA9D6", "#F2B705", "#16151A"];

  return (
    <div className="min-h-screen bg-bg flex flex-col transition-colors duration-300">
      
      {/* Top Header */}
      <header className="w-full border-b-2 border-border bg-surface py-5 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="brutalist-badge-coral w-10 h-10 flex items-center justify-center font-display font-bold text-xl text-white">
              H
            </span>
            <div>
              <h1 className="font-display font-bold text-lg text-text">HKH Dashboard</h1>
              <p className="text-[10px] text-accent-coral font-bold uppercase tracking-wider">Admin Control Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-semibold text-text-muted hover:text-text hover:underline"
            >
              Back to Site
            </Link>
            <button
              onClick={handleSignOut}
              className="w-10 h-10 border-2 border-border bg-bg text-text rounded-full flex items-center justify-center shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Demo Alert Banner */}
          {isDemoData && (
            <Reveal y={20}>
            <div className="p-4 border-2 border-border bg-accent-amber text-text rounded-xl flex items-center gap-3 text-sm font-semibold shadow-brutal-sm">
              <Info className="w-5 h-5 flex-shrink-0" />
              <p>
                Showing DEMO submissions. Submit the public contact form on the website to populate this dashboard with real live leads!
              </p>
            </div>
            </Reveal>
          )}

          {/* Stat Summary Cards */}
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total Leads */}
            <StaggerItem className="brutalist-card p-6 bg-surface flex items-start gap-4">
              <span className="brutalist-badge-coral w-12 h-12 flex-shrink-0">
                <Users className="w-5 h-5 text-white" />
              </span>
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block">Total Submissions</span>
                <span className="font-display font-extrabold text-3xl text-text block mt-1">
                  {totalSubmissions}
                </span>
              </div>
            </StaggerItem>

            {/* Leads This Week */}
            <StaggerItem className="brutalist-card p-6 bg-surface flex items-start gap-4">
              <span className="brutalist-badge-sky w-12 h-12 flex-shrink-0">
                <Calendar className="w-5 h-5 text-text" />
              </span>
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block">In Last 7 Days</span>
                <span className="font-display font-extrabold text-3xl text-text block mt-1">
                  {thisWeekSubmissions}
                </span>
              </div>
            </StaggerItem>

            {/* Popular Focus */}
            <StaggerItem className="brutalist-card p-6 bg-surface flex items-start gap-4">
              <span className="brutalist-badge-coral w-12 h-12 flex-shrink-0 bg-accent-amber">
                <Briefcase className="w-5 h-5 text-text" />
              </span>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block">Top Project Focus</span>
                <span className="font-display font-extrabold text-lg text-text block mt-1 truncate" title={popularFocus}>
                  {popularFocus}
                </span>
              </div>
            </StaggerItem>

            {/* Popular Budget */}
            <StaggerItem className="brutalist-card p-6 bg-surface flex items-start gap-4">
              <span className="brutalist-badge-coral w-12 h-12 flex-shrink-0">
                <DollarSign className="w-5 h-5 text-white" />
              </span>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block">Frequent Budget</span>
                <span className="font-display font-extrabold text-sm text-text block mt-1.5 truncate" title={popularBudget}>
                  {popularBudget}
                </span>
              </div>
            </StaggerItem>

          </Stagger>

          {/* Visual Insight Section (Recharts) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Chart Card */}
            <Reveal x={-40} className="lg:col-span-5 brutalist-card bg-surface p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-text mb-1">Budget Allocation</h3>
                <p className="text-xs text-text-muted mb-6">Distribution of inbound lead budget targets.</p>
              </div>

              <div className="h-64 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={9} tickLine={false} />
                      <YAxis stroke="#888888" fontSize={9} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--surface)",
                          border: "2px solid var(--border)",
                          borderRadius: "10px",
                          color: "var(--text)"
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-text-muted">
                    No data to chart
                  </div>
                )}
              </div>
            </Reveal>

            {/* Quick Actions / Security Card */}
            <Reveal x={40} delay={0.1} className="lg:col-span-7 brutalist-card bg-surface p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-display font-bold text-lg text-text">Database Controls</h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  These submissions represent enquiries collected through the public website. You can filter and analyze budget profiles to evaluate resource allocation. Ensure your Supabase schema permits read operations on the `contact_submissions` table for the administrator role.
                </p>
                <div className="p-4 border-2 border-border bg-bg rounded-xl text-xs space-y-2">
                  <span className="font-bold text-text uppercase tracking-wider block">Security Rule Verification:</span>
                  <pre className="font-mono text-[9px] bg-surface p-2 border border-border/10 rounded-md overflow-x-auto text-text">
{`create policy "admin can read contact submissions"
  on public.contact_submissions
  for select
  to authenticated
  using (auth.email() = 'hasanshahirconnect@gmail.com');`}
                  </pre>
                </div>
              </div>

              <div className="pt-6 flex flex-wrap gap-4">
                <button
                  onClick={fetchSubmissions}
                  className="brutalist-btn brutalist-btn-primary px-6 py-2.5 text-xs"
                >
                  Reload Database
                </button>
                <button
                  onClick={() => {
                    setSearch("");
                    setFocusFilter("All");
                    setBudgetFilter("All");
                  }}
                  className="brutalist-btn brutalist-btn-secondary px-6 py-2.5 text-xs"
                >
                  Reset Dashboard Filters
                </button>
              </div>
            </Reveal>

          </div>

          {/* Lead Submissions Table Section */}
          <Reveal delay={0.1} className="brutalist-card bg-surface overflow-hidden">
            
            {/* Filters Bar */}
            <div className="p-6 border-b-2 border-border bg-bg/20 flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Search bar */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search lead by name, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-border bg-surface text-text rounded-full focus:outline-none focus:border-accent-coral text-xs"
                />
              </div>

              {/* Filter selectors */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Focus Filter */}
                <div className="flex items-center gap-1.5 text-xs">
                  <Filter className="w-3.5 h-3.5 text-text-muted" />
                  <select
                    value={focusFilter}
                    onChange={(e) => setFocusFilter(e.target.value)}
                    className="border-2 border-border bg-surface text-text rounded-full px-3 py-1.5 focus:outline-none text-xs cursor-pointer"
                  >
                    <option value="All">All Focus Areas</option>
                    {uniqueFocus.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                {/* Budget Filter */}
                <div className="flex items-center gap-1.5 text-xs">
                  <select
                    value={budgetFilter}
                    onChange={(e) => setBudgetFilter(e.target.value)}
                    className="border-2 border-border bg-surface text-text rounded-full px-3 py-1.5 focus:outline-none text-xs cursor-pointer"
                  >
                    <option value="All">All Budgets</option>
                    {uniqueBudgets.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* Sort Order */}
                <button
                  onClick={() => setSortByDate(sortByDate === "desc" ? "asc" : "desc")}
                  className="border-2 border-border bg-surface text-text rounded-full px-4 py-1.5 text-xs font-semibold cursor-pointer hover:bg-bg/10"
                >
                  Date: {sortByDate === "desc" ? "Newest First" : "Oldest First"}
                </button>
              </div>

            </div>

            {/* Table wrapper */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-border bg-bg/30 text-text font-bold">
                    <th className="p-4">Submission Date</th>
                    <th className="p-4">Full Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Project Focus</th>
                    <th className="p-4">Budget Range</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((lead) => (
                      <React.Fragment key={lead.id}>
                        <tr className="hover:bg-bg/10 transition-colors">
                          <td className="p-4 font-semibold text-text-muted">
                            {new Date(lead.created_at).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </td>
                          <td className="p-4 font-bold text-text">{lead.full_name}</td>
                          <td className="p-4 text-accent-sky font-semibold">{lead.email}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-0.5 border border-border bg-surface rounded-full font-semibold">
                              {lead.project_focus || "Consultation"}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-accent-coral">{lead.budget_range || "N/A"}</td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleToggleMessage(lead.id)}
                              className="border-2 border-border bg-surface text-text rounded-md px-3 py-1 hover:bg-bg/10 font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              {expandedId === lead.id ? "Hide" : "View"}
                            </button>
                          </td>
                        </tr>
                        {/* Expanded details row */}
                        {expandedId === lead.id && (
                          <tr>
                            <td colSpan={6} className="p-6 bg-bg/25 border-b border-border/15">
                              <div className="space-y-3 max-w-4xl">
                                <h4 className="font-bold text-text uppercase tracking-widest text-[10px]">
                                  Project Message Details:
                                </h4>
                                <div className="p-4 border border-border/10 bg-surface text-text text-sm rounded-xl leading-relaxed whitespace-pre-line">
                                  {lead.message || "No project message provided."}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-text-muted font-medium">
                        No submissions match the search query and filter parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 border-t-2 border-border bg-bg/10 flex justify-between items-center text-[10px] text-text-muted">
              <span>Showing {filteredSubmissions.length} of {totalSubmissions} leads</span>
              {isDemoData && <span>Database status: Fallback Demo Data Active</span>}
            </div>

          </Reveal>

          {/* Client Email Campaigns Section */}
          <Reveal delay={0.1}>
            <div className="brutalist-card bg-surface p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-display font-bold text-lg text-text">Client Email Campaigns</h3>
                  <p className="text-xs text-text-muted mt-1">
                    Add clients below and hit send — each pending recipient gets a personalized email straight to their inbox.
                  </p>
                </div>
                <button
                  onClick={handleSendCampaign}
                  disabled={campaignSending}
                  className="brutalist-btn brutalist-btn-primary px-5 py-2.5 text-xs flex items-center justify-center gap-2 select-none"
                >
                  {campaignSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send to Pending
                    </>
                  )}
                </button>
              </div>

              {campaignStatusMsg && (
                <div
                  className={`p-3 mb-5 border-2 border-border rounded-xl text-xs font-semibold flex items-start gap-2 ${
                    campaignStatusMsg.type === "ok"
                      ? "bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400"
                  }`}
                >
                  {campaignStatusMsg.type === "ok" ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  )}
                  <p>{campaignStatusMsg.text}</p>
                </div>
              )}

              {/* Add recipient form */}
              <form onSubmit={handleAddRecipient} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Client name (optional)"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  maxLength={100}
                  className="w-full px-4 py-2.5 border-2 border-border bg-bg text-text rounded-xl focus:outline-none focus:border-accent-coral transition-colors placeholder:text-text-muted/50 text-xs"
                />
                <input
                  type="email"
                  required
                  placeholder="client@company.com"
                  value={campaignEmail}
                  onChange={(e) => setCampaignEmail(e.target.value)}
                  maxLength={200}
                  className="w-full px-4 py-2.5 border-2 border-border bg-bg text-text rounded-xl focus:outline-none focus:border-accent-coral transition-colors placeholder:text-text-muted/50 text-xs"
                />
                <button
                  type="submit"
                  className="brutalist-btn brutalist-btn-secondary px-5 py-2.5 text-xs font-bold select-none"
                >
                  Add Recipient
                </button>
              </form>

              {/* Recipient list */}
              {campaignRecipients.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b-2 border-border bg-bg/30 text-text font-bold">
                        <th className="p-3">Client</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Sent At</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10">
                      {campaignRecipients.map((r) => (
                        <tr key={r.id} className="hover:bg-bg/10 transition-colors">
                          <td className="p-3 font-bold text-text">{r.full_name || "—"}</td>
                          <td className="p-3 text-accent-sky font-semibold">{r.email}</td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] border ${
                                r.status === "sent"
                                  ? "bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-900"
                                  : r.status === "failed"
                                  ? "bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-900"
                                  : "bg-accent-amber/20 text-text border-border"
                              }`}
                            >
                              {r.status || "pending"}
                            </span>
                          </td>
                          <td className="p-3 text-text-muted">
                            {r.sent_at ? new Date(r.sent_at).toLocaleString() : "—"}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDeleteRecipient(r.id)}
                              className="border-2 border-border bg-bg text-text rounded-md px-3 py-1 hover:bg-bg/10 font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                              title="Remove recipient"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 border-2 border-dashed border-border/40 rounded-xl text-center text-xs text-text-muted">
                  No recipients yet — add your first client above.
                </div>
              )}
            </div>
          </Reveal>

        </div>
      </main>
    </div>
  );
}
