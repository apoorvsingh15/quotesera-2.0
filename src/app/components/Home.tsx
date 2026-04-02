'use client';

import React from 'react';
import Link from 'next/link';
import TopNav from './TopNav';

const features = [
  {
    icon: '📐',
    title: 'Platform Templates',
    description: 'Pre-sized canvases for Instagram, Twitter, Facebook, YouTube, and more.',
  },
  {
    icon: '🖼️',
    title: 'Custom Backgrounds',
    description: 'Upload your own images or choose from beautiful gradient presets.',
  },
  {
    icon: '✍️',
    title: 'Rich Typography',
    description: 'Choose from 8 premium Google Fonts with full style, size, and spacing control.',
  },
  {
    icon: '📤',
    title: 'Easy Export',
    description: 'Export your creation as a high-resolution PNG or JPEG with one click.',
  },
];

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      {/* Hero Section */}
      <section
        className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24"
        style={{
          background: 'linear-gradient(135deg, #111827 0%, #1e1b4b 50%, #312e81 100%)',
          minHeight: '90vh',
        }}
      >
        <div className="max-w-3xl mx-auto">
          <h1 className="text-6xl font-extrabold mb-6 leading-tight">
            <span
              style={{
                background: 'linear-gradient(90deg, #a855f7, #6366f1, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Quotesera
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">
            Create beautiful quote graphics in seconds.
            <br />
            Design, customize, and export — no design skills needed.
          </p>
          <Link href="/quotes-editor">
            <button
              className="text-white text-lg font-semibold px-10 py-4 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
              style={{ background: 'linear-gradient(90deg, #6366f1, #4f46e5)' }}
            >
              Open Editor →
            </button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Everything you need to create stunning quotes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-200"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-6 text-sm">
        Made with ❤️ for creators
      </footer>
    </div>
  );
};

export default Home;
