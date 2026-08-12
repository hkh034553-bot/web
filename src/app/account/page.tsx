"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, LogOut, ArrowLeft, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Reveal from "@/components/Reveal";

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Redirect to login if not logged in
        router.push("/login");
      } else {
        setUser(session.user);
        setLoading(false);
      }
    };
    
    fetchSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          router.push("/login");
        } else {
          setUser(session.user);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Get name from metadata
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Client Partner";

  return (
    <main className="min-h-screen bg-bg flex flex-col justify-center items-center px-4 py-12 transition-colors duration-300">
      
      {/* Back button */}
      <Reveal y={16}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-bold text-sm text-text-muted hover:text-text mb-8 hover:underline decoration-accent-coral underline-offset-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Website
        </Link>
      </Reveal>

      <Reveal delay={0.1}>
      <div className="w-full max-w-md brutalist-card bg-surface p-8 space-y-6">
        
        {/* User Badge */}
        <div className="flex items-center gap-4">
          <span className="brutalist-badge-sky w-12 h-12 flex-shrink-0">
            <User className="w-6 h-6 text-text" />
          </span>
          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block">Client Profile</span>
            <h1 className="font-display font-bold text-xl text-text leading-tight">
              Welcome back, {userName}!
            </h1>
          </div>
        </div>

        <hr className="border-border/10" />

        <div className="space-y-4">
          <p className="text-sm text-text-muted leading-relaxed">
            This page represents your active client dashboard. Future updates will include live metrics for your active campaigns, shared visual boards, and invoices.
          </p>

          <div className="p-4 border-2 border-border bg-bg rounded-xl space-y-2">
            <span className="text-xs font-bold text-text uppercase tracking-widest block">Account Details:</span>
            <div className="text-xs text-text-muted space-y-1">
              <p>Email: <span className="text-text font-medium">{user?.email}</span></p>
              <p>Sign-In Provider: <span className="text-text font-medium uppercase">{user?.app_metadata?.provider || "Google"}</span></p>
              <p>UID: <span className="text-text font-mono text-[10px]">{user?.id}</span></p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col gap-3">
          {user?.email === "hasanshahirconnect@gmail.com" && (
            <Link
              href="/admin"
              className="brutalist-btn bg-accent-amber text-text border-2 border-border rounded-full py-3 text-center text-sm font-bold shadow-[4px_4px_0_#16151A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#16151A] transition-all flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" /> Go to Admin Panel
            </Link>
          )}

          <button
            onClick={handleSignOut}
            className="brutalist-btn brutalist-btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm select-none"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

      </div>
      </Reveal>
    </main>
  );
}
