'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/lib/store';
import { api } from '@/lib/api';
import { dbAuthenticate } from '@/lib/supabase-db';
import {
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithUser, showToast } = useAdmin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      let userObj: any = null;
      let jwtToken: string | undefined = undefined;

      // 1. Authenticate via Axum Rust Backend to receive signed cryptographic JWT
      try {
        const authData = await api.login(username.trim(), password);
        jwtToken = authData.access_token || authData.token;
        userObj = authData.user;
      } catch (backendErr: any) {
        console.warn('Backend login endpoint response/offline, attempting direct DB authentication:', backendErr?.message);
        // Fallback for network resilience: verify against Supabase PostgreSQL
        userObj = await dbAuthenticate(username.trim(), password);
      }

      if (!userObj) {
        throw new Error('Invalid username or password');
      }

      loginWithUser(userObj, jwtToken);
      showToast(`Welcome back, ${userObj.name}!`, 'success');
      router.replace('/dashboard');
    } catch (err: any) {
      console.warn('Authentication failed:', err?.message || err);
      setErrorMsg('Invalid username or password. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090e1a] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Subtle background ambient glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Brand / Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0c2461] border border-blue-500/20 shadow-lg mb-3 p-2">
            <Image
              src="/logo.png"
              alt="BDAI Logo"
              width={38}
              height={38}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            BDAI Admin Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to manage portal content and resources
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-300 flex items-center gap-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xl border border-slate-100 text-slate-900">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username or email"
                  required
                  autoFocus
                  autoComplete="username"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0c2461] focus:bg-white focus:ring-1 focus:ring-[#0c2461] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0c2461] focus:bg-white focus:ring-1 focus:ring-[#0c2461] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#0c2461] hover:bg-[#153a8a] text-white text-xs font-semibold shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Public Website Link */}
        <div className="mt-6 text-center">
          <a
            href="https://bdai.bike-csecu.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <span>Back to website</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
