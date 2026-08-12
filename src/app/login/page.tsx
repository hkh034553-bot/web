"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldAlert, AlertCircle, ArrowLeft, UserPlus, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Reveal from "@/components/Reveal";

const GoogleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [activeForm, setActiveForm] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (session.user.email === "hasanshahirconnect@gmail.com") {
          router.push("/admin");
        } else {
          router.push("/account");
        }
      }
    };
    checkUser();
  }, [router, supabase]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/Digivolve/account`,
        },
      });
      if (error) throw new Error(error.message);
    } catch (err: any) {
      setErrorMsg(
        err.message?.includes("provider is not enabled")
          ? "Google Login is not enabled yet in the Supabase Dashboard. Please use Email/Password sign-up below!"
          : err.message || "Authentication failed."
      );
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user?.email === "hasanshahirconnect@gmail.com") {
        router.push("/admin");
      } else {
        router.push("/account");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // If sign up is successful, check if user session is active (confirmation disabled) or check email
      if (data.session) {
        if (data.user?.email === "hasanshahirconnect@gmail.com") {
          router.push("/admin");
        } else {
          router.push("/account");
        }
      } else {
        setSuccessMsg("Registration successful! Check your email inbox to verify your account.");
        setEmail("");
        setPassword("");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg flex flex-col justify-center items-center px-4 py-12 transition-colors duration-300">
      
      {/* Back button */}
      <Reveal y={16}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border bg-surface text-text rounded-full font-bold text-xs shadow-brutal hover:shadow-brutal-sm hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-150 mb-8"
        >
          <ArrowLeft className="w-4 h-4 text-accent-coral" /> Back to Home
        </Link>
      </Reveal>

      <div className="w-full max-w-md">
        
        {/* Logo Mark */}
        <Reveal delay={0.1}>
          <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="brutalist-badge-coral w-10 h-10 flex items-center justify-center font-display font-bold text-xl text-white">
              H
            </span>
            <span className="font-display font-bold text-2xl tracking-tight text-text">
              HKH<span className="text-accent-coral">.</span>
            </span>
          </Link>
          <p className="text-text-muted text-xs mt-2 uppercase tracking-widest font-bold">
            Portal Access
          </p>
        </div>
        </Reveal>

        {/* Form Card */}
        <Reveal delay={0.2}>
        <div className="brutalist-card bg-surface p-8 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent-sky/10 rounded-full blur-2xl -z-10" />

          {/* Success Banner */}
          {successMsg && (
            <div className="p-4 mb-6 border-2 border-border bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-xl flex items-start gap-3 text-xs">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="font-medium">{successMsg}</p>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 mb-6 border-2 border-border bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl flex items-start gap-3 text-xs">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="font-medium">{errorMsg}</p>
            </div>
          )}

          {activeForm === "signin" ? (
            /* SIGN IN FORM */
            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-2 text-center">
                <h2 className="font-display font-bold text-2xl text-text">
                  Sign In
                </h2>
                <p className="text-text-muted text-xs leading-relaxed">
                  Access your member board and campaign insights.
                </p>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label htmlFor="signin-email" className="block text-[10px] font-bold text-text uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-text-muted" />
                  <input
                    id="signin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-12 pr-4 py-3 border-2 border-border bg-bg text-text rounded-xl focus:outline-none focus:border-accent-coral transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label htmlFor="signin-password" className="block text-[10px] font-bold text-text uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-text-muted" />
                  <input
                    id="signin-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 border-2 border-border bg-bg text-text rounded-xl focus:outline-none focus:border-accent-coral transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="brutalist-btn brutalist-btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm select-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="font-bold">Sign In</span>
                )}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border/10"></div>
                <span className="flex-shrink mx-4 text-text-muted text-[10px] font-bold uppercase tracking-widest">Or</span>
                <div className="flex-grow border-t border-border/10"></div>
              </div>

              {/* Google OAuth Option */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="brutalist-btn brutalist-btn-secondary w-full py-3.5 flex items-center justify-center gap-3 text-sm select-none"
              >
                <GoogleIcon />
                <span className="font-bold">Continue with Google</span>
              </button>

              {/* Form Switch */}
              <div className="pt-2 text-center text-xs">
                <span className="text-text-muted">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveForm("signup");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className="font-bold text-accent-coral hover:underline"
                >
                  Register here
                </button>
              </div>
            </form>
          ) : (
            /* SIGN UP / REGISTER FORM */
            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="space-y-2 text-center">
                <h2 className="font-display font-bold text-2xl text-text">
                  Register Account
                </h2>
                <p className="text-text-muted text-xs leading-relaxed">
                  Create an account to manage campaigns and track visual assets.
                </p>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label htmlFor="signup-email" className="block text-[10px] font-bold text-text uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-text-muted" />
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-12 pr-4 py-3 border-2 border-border bg-bg text-text rounded-xl focus:outline-none focus:border-accent-coral transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label htmlFor="signup-password" className="block text-[10px] font-bold text-text uppercase tracking-wider">
                  Password (Min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-text-muted" />
                  <input
                    id="signup-password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 border-2 border-border bg-bg text-text rounded-xl focus:outline-none focus:border-accent-coral transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="brutalist-btn brutalist-btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm select-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span className="font-bold">Register Account</span>
                  </>
                )}
              </button>

              {/* Form Switch */}
              <div className="pt-2 text-center text-xs">
                <span className="text-text-muted">Already registered? </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveForm("signin");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className="font-bold text-accent-coral hover:underline"
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}

        </div>
        </Reveal>

      </div>
    </main>
  );
}
