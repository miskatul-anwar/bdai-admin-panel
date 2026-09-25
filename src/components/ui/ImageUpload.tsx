'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, X, Link as LinkIcon } from 'lucide-react';

import { API_BASE_URL } from '@/lib/api';
import { getCookie } from '@/lib/cookies';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  helperText?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Image / Avatar',
  folder = 'bdai',
  helperText = 'Upload via Cloudinary CDN or provide a direct image URL',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB');
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WebP)');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const token = (typeof window !== 'undefined' ? localStorage.getItem('bdai_auth_token') : null)
        || getCookie('bdai_access_token')
        || getCookie('access_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Attempt upload to Rust Backend Cloudinary endpoint
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const uploadedUrl = data.secure_url || data.url;
        onChange(uploadedUrl);
      } else {
        const errData = await res.json().catch(() => ({}));
        const msg = errData.error || errData.message || `Upload failed (Status ${res.status})`;
        setError(msg);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed due to network error';
      setError(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#0c2461]">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer font-medium"
          >
            <LinkIcon className="w-2.5 h-2.5" />
            <span>{showUrlInput ? 'Hide URL input' : 'Direct URL'}</span>
          </button>
          <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
            Cloudinary
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Preview Avatar */}
        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center group">
          {value ? (
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/team/miskat.jpg';
              }}
            />
          ) : (
            <ImageIcon className="w-6 h-6 text-slate-400" />
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}
        </div>

        {/* Upload Action Area */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id={`file-input-${label.replace(/\s+/g, '-')}`}
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0c2461] text-xs font-semibold border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
              <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
            </button>

            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Remove Image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <p className="text-[10px] text-gray-400 mt-1 truncate">
            {helperText}
          </p>
        </div>
      </div>

      {/* Direct URL input if toggled or needed */}
      {showUrlInput && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://res.cloudinary.com/... or /team/name.jpg"
            className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-gray-400 focus:outline-none focus:border-[#0c2461]"
          />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-[11px] text-rose-600 mt-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
