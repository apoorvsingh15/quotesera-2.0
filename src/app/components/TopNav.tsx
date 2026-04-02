'use client';

import React from 'react';
import Link from 'next/link';

const TopNav = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="text-xl font-bold text-gray-800">✨ Quotesera</span>
        </Link>
        <Link href="/quotes-editor">
          <button
            className="text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all duration-150 hover:opacity-90"
            style={{ background: 'linear-gradient(90deg, #6366f1, #4f46e5)' }}
          >
            Open Editor
          </button>
        </Link>
      </div>
    </nav>
  );
};

export default TopNav;
