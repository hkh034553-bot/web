"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchData();
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
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

  const handleLogin = async (e: React.FormEvent) => {
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

  if (loading && !session) {
    return <div className="p-8">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
          {authError && <div className="text-red-500 text-sm mb-4">{authError}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full border p-2 rounded" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full border p-2 rounded" 
                required 
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button onClick={handleLogout} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Submissions */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Contact Submissions</h2>
          <div className="space-y-4">
            {submissions.length === 0 ? <p className="text-gray-500">No submissions found.</p> : 
              submissions.map(sub => (
                <div key={sub.id} className="border p-4 rounded bg-gray-50">
                  <p className="font-bold">{sub.name} <span className="text-sm font-normal text-gray-500">({sub.email})</span></p>
                  <p className="mt-2 text-sm">{sub.message}</p>
                  <p className="mt-2 text-xs text-gray-400">{new Date(sub.created_at).toLocaleString()}</p>
                </div>
              ))
            }
          </div>
        </div>

        {/* Campaign Recipients */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Campaign Recipients</h2>
          <div className="space-y-4">
            {recipients.length === 0 ? <p className="text-gray-500">No recipients found.</p> : 
              recipients.map(rec => (
                <div key={rec.id} className="border p-4 rounded flex justify-between items-center bg-gray-50">
                  <div>
                    <p className="font-bold">{rec.name || 'No Name'}</p>
                    <p className="text-sm">{rec.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${rec.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {rec.status}
                  </span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Audit Log */}
        <div className="bg-white p-6 rounded shadow lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Audit Log</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Time</th>
                  <th className="py-2">Admin ID</th>
                  <th className="py-2">Action</th>
                  <th className="py-2">Table</th>
                  <th className="py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={5} className="py-4 text-gray-500 text-center">No logs found.</td></tr>
                ) : logs.map(log => (
                  <tr key={log.id} className="border-b last:border-0">
                    <td className="py-2">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="py-2 truncate max-w-[150px]" title={log.admin_user_id}>{log.admin_user_id}</td>
                    <td className="py-2"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{log.action}</span></td>
                    <td className="py-2">{log.target_table}</td>
                    <td className="py-2 text-xs max-w-xs truncate" title={JSON.stringify(log.metadata)}>
                      {JSON.stringify(log.metadata)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
