import React from 'react';

const promisePoints = [
  'Clean & conscious formulations',
  'Long-lasting fragrances',
  'Designed for everyday use',
  'Premium feel, accessible pricing',
];

const ArovaPromise = () => {
  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8">
      <div className="promise-shell relative overflow-hidden rounded-2xl border border-[var(--brand-border)] bg-white p-5 sm:p-7 md:p-8 shadow-sm">
        <div className="promise-blob pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(201,169,110,0.24),transparent_70%)]" />
        <div className="promise-blob pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(56,19,19,0.12),transparent_70%)]" />
        <div className="relative">
          <p className="promise-intro text-xs font-semibold tracking-[0.2em] uppercase text-[var(--brand-muted)]">Why Arova</p>
          <h2 className="promise-intro mt-2 text-2xl sm:text-3xl font-semibold text-[var(--brand-maroon)]">✦ The Arova Promise</h2>
          <p className="promise-intro mt-2 text-sm sm:text-base text-[var(--brand-muted)]">
            Built for modern fragrance lovers who want clean luxury every day.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {promisePoints.map((point, index) => (
              <div
                key={point}
                className="promise-card flex items-start gap-3 rounded-xl border border-[var(--brand-border)] bg-[#fffdfa] px-4 py-3"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="mt-[2px] text-[var(--brand-maroon)]">•</span>
                <p className="text-sm sm:text-base font-medium text-[var(--brand-text)] leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArovaPromise;
