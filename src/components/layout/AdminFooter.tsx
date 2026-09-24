import React from 'react';
import { Copyright } from 'lucide-react';

export default function AdminFooter() {
  return (
    <footer className="w-full bg-[#0c2461] border-t border-white/10 shadow-lg text-white/80 py-4 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="text-sm font-semibold text-white/80 flex items-center gap-1.5">
          <Copyright size={14} className="inline-block" />
          <span>BIKE 2025-2028 &bull; BDAI Admin Console</span>
        </div>

        <div className="text-sm text-white/70">
          Developed By{' '}
          <a
            href="https://web.bike-csecu.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#60a5fa] hover:text-white transition-colors"
          >
            BIKE LAB
          </a>
        </div>
      </div>
    </footer>
  );
}
