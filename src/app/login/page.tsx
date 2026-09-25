'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/lib/store';
import { dbAuthenticate } from '@/lib/supabase-db';
import { api } from '@/lib/api';
import {
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Shield,
  AlertCircle,
  ExternalLink,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithUser, showToast, login } = useAdmin();
  const [username, setUsername] = useState('miskat');
  const [password, setPassword] = useState('kemonacho');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // 1. Authenticate directly against Supabase DB using username + password
      const authenticatedUser = await dbAuthenticate(username, password);

      // 2. Fetch Axum JWT Access Token for backend API services & file uploads
      let jwtAccessToken: string | undefined;
      try {
        const authData = await api.login(username, password);
        jwtAccessToken = authData.access_token || authData.token;
      } catch (backendErr) {
        console.warn('Axum JWT Access Token acquisition skipped:', backendErr);
      }

      loginWithUser(authenticatedUser as any, jwtAccessToken);
      showToast(`Welcome back, ${authenticatedUser.name}! (${authenticatedUser.role})`, 'success');
      router.push('/dashboard');
    } catch (err: any) {
      console.warn('DB auth failed, attempting local fallback:', err?.message);
      // If error is invalid credentials, show error
      if (err?.message?.includes('Invalid')) {
        setErrorMsg('Invalid username or password. Please verify your credentials.');
        showToast('Invalid username or password', 'error');
      } else {
        // Fallback for offline environments
        login(username);
        router.push('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#07101f] text-white flex flex-col justify-center items-center px-4 relative overflow-hidden py-12">
      {/* 40px subtle grid matching bdai-web Home hero */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top right subtle glow */}
      <div
        className="absolute top-0 right-0 w-[450px] h-[450px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at top right, rgba(59,130,246,0.15) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0c2461] border border-blue-400/30 shadow-xl mb-3 p-2">
            <Image
              src="/logo.png"
              alt="BDAI Logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white m-0">
            BD<span className="text-[#60a5fa]">AI</span>{' '}
            <span className="text-slate-400 text-lg font-normal">| Admin Panel</span>
          </h1>
          <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
            Content Management &amp; Access Governance for BanglaDesh Sectoral Knowledge Graphs &amp; LLMs
          </p>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 text-xs text-red-200 flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="flex-1 font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Card */}
        <div className="bg-white text-slate-900 rounded-2xl p-7 shadow-xl border border-slate-200 relative">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#0c2461]">Console Sign In</h2>
              <p className="text-xs text-gray-500">Sign in with your assigned username and password</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white bg-[#0c2461] rounded px-2 py-0.5">
              Strict RBAC
            </span>
          </div>

          {/* Username + Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0c2461] mb-1">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. miskat"
                  required
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0c2461] focus:ring-1 focus:ring-[#0c2461]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#0c2461]">
                  Password
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Protected</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0c2461] focus:ring-1 focus:ring-[#0c2461]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#0c2461] hover:bg-[#0c2461]/90 text-white text-xs font-semibold uppercase tracking-wider shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                'Verifying Credentials...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill Assigned Credentials */}
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
              Assigned Accounts Quick-Fill
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('miskat', 'kemonacho')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0c2461] group-hover:text-blue-600">
                    miskat
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                    Admin
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">kemonacho</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('sayed', 'mod123')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600">
                    sayed
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                    Mod
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">mod123</p>
              </button>
            </div>
          </div>
        </div>

        {/* Public site link */}
        <div className="mt-6 text-center">
          <a
            href="https://bdai.bike-csecu.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <span>Visit Live Website (bdai.bike-csecu.com)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
