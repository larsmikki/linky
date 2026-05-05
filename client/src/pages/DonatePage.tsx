import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function DonatePage() {
  const { theme } = useTheme();

  const s = {
    page: { background: theme.bg, color: theme.text },
    section: { background: theme.surface, border: `1px solid ${theme.border}` },
    sectionTitle: { color: theme.text },
    sectionSub: { color: theme.text2 },
  };

  const cards = [
    { emoji: '☕', title: 'Buy Me a Coffee', sub: 'One-time donation, any amount', url: 'https://buymeacoffee.com/larsmikki', label: '☕ Buy Me a Coffee' },
    { emoji: '💙', title: 'PayPal', sub: 'Quick & secure donation', url: 'https://paypal.me/larsmikki', label: '💙 Donate via PayPal' },
  ];

  return (
    <div className="min-h-screen py-8 px-6" style={s.page}>
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight m-0" style={{ color: theme.text }}>Support Linky</h1>
          <p className="text-sm mt-0.5" style={{ color: theme.text2 }}>I build privacy-first, self-hosted tools — no subscriptions, no ads, no tracking. Your data stays yours.</p>
        </div>

        {/* What you get */}
        <div className="rounded-2xl p-6 mb-5" style={s.section}>
          <h2 className="text-base font-bold mb-1" style={s.sectionTitle}>What you get</h2>
          <p className="text-xs mb-5" style={s.sectionSub}>Linky is and always will be free, open source, and self-hosted.</p>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: '🛡️', label: '100% Free Forever', color: '#22c55e' },
              { icon: '🔒', label: 'No Ads or Tracking', color: '#f59e0b' },
              { icon: '💾', label: 'Your data, your device', color: '#8b5cf6' },
            ].map(({ icon, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 rounded-lg text-xs font-semibold"
                style={{
                  padding: '6px 12px',
                  background: `${color}15`, color, border: `1px solid ${color}20`,
                }}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donate */}
        <div className="rounded-2xl p-6 mb-5" style={s.section}>
          <h2 className="text-base font-bold mb-1" style={s.sectionTitle}>Donate</h2>
          <p className="text-xs mb-5" style={s.sectionSub}>One-time donations via Buy Me a Coffee or PayPal. Any amount is appreciated.</p>
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {cards.map(({ emoji, title, sub, url, label }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center gap-4 p-6 rounded-xl"
                style={{ background: theme.surface2, border: `1px solid ${theme.border}` }}
              >
                <div style={{ fontSize: '36px' }}>{emoji}</div>
                <div>
                  <h3 className="text-sm font-bold mb-1" style={{ color: theme.text }}>{title}</h3>
                  <p className="text-xs" style={{ color: theme.text2 }}>{sub}</p>
                </div>
                <button
                  onClick={() => window.open(url, '_blank')}
                  className="w-full p-2.5 text-sm font-semibold rounded-lg text-white border-none cursor-pointer"
                  style={{
                    background: theme.gradient, boxShadow: `0 4px 14px ${theme.accent}30`,
                    fontFamily: 'inherit',
                  }}
                >
                  {label}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Thank you */}
        <div className="rounded-2xl p-6" style={s.section}>
          <h2 className="text-base font-bold mb-1" style={s.sectionTitle}>Thank You!</h2>
          <p className="text-xs m-0" style={{ color: theme.text2 }}>
            Every bit of support keeps Linky free for everyone. Keep linking!
          </p>
        </div>

      </div>
    </div>
  );
}
