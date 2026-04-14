import React from 'react';

const BrandStatement = () => {
  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--brand-border)] bg-white px-5 py-6 sm:px-8 sm:py-8 shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,19,19,0.08),transparent_45%)]" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-muted)]">Brand Statement</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-[var(--brand-maroon)]">
            Luxury For Every Day
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[var(--brand-text)]">
            At Arova, we believe fragrance is not just for occasions , it&apos;s for every day.
          </p>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-[var(--brand-muted)]">
            We create clean, thoughtfully crafted perfumes that bring together luxury and daily wear, so you can
            feel confident, elegant, and unforgettable always.
          </p>
        </div>
      </div>
    </section>
  );
};

export default BrandStatement;
