import { Reveal } from './LuxuryMotion';

const LuxuryStorySection = ({ quote, description, founder }) => {
  return (
    <section
      id="story"
      className="relative overflow-hidden bg-[#f5ede5] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[linear-gradient(180deg,rgba(255,255,255,0.42),transparent)]" />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <Reveal className="lg:pt-4">
          <div className="rounded-[1.5rem] border border-[#dcc9bb] bg-[#efe4d8] p-6 sm:p-8">
            <p className="font-[var(--font-cinzel)] text-[10px] uppercase tracking-[0.28em] text-[var(--luxury-gold-dark)]">
              Founder portrait
            </p>
            <div className="mt-5 flex h-[280px] items-center justify-center rounded-2xl border border-dashed border-[#d2b9a6] bg-white/45 text-center">
              <p className="px-6 font-[var(--font-jost)] text-sm text-[var(--luxury-brown-mid)]/80">
                Founder photo area
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <p className="font-[var(--font-cinzel)] text-[10px] uppercase tracking-[0.32em] text-[var(--luxury-gold)]/90">
            Our statement
          </p>
          <p className="mt-4 font-[var(--font-jost)] text-sm leading-7 text-[var(--luxury-brown-mid)] sm:text-[15px]">
            At Arova, we believe fragrance is not just for occasions, it&apos;s for every day. We
            create clean, thoughtfully crafted perfumes that bring together luxury and daily wear,
            so you can feel confident, elegant, and unforgettable always.
          </p>
          <blockquote className="mt-8 border-l-2 border-[var(--luxury-gold)]/60 pl-5">
            <p className="font-[var(--font-cormorant)] text-[1.75rem] leading-tight font-light italic text-[var(--luxury-brown)] sm:text-[2.2rem]">
              &quot;{quote}&quot;
            </p>
            <p className="mt-4 font-[var(--font-jost)] text-sm leading-8 text-[var(--luxury-brown-mid)] sm:text-[15px]">
              {description}
            </p>
          </blockquote>

          <div className="mt-8 flex items-center gap-4 border-t border-[rgba(44,16,8,0.14)] pt-6">
            {founder?.photo ? (
              <img
                src={founder.photo}
                alt={founder.name}
                className="h-16 w-16 rounded-full object-cover border border-[#d6c3b4] shadow-[0_10px_20px_rgba(44,16,8,0.16)]"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--luxury-brown)] font-[var(--font-cinzel)] text-lg text-[var(--luxury-gold)]">
                {founder.initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-[var(--font-cinzel)] text-[10px] uppercase tracking-[0.3em] text-[var(--luxury-gold-dark)]">
                Founder
              </p>
              <p className="mt-1 font-[var(--font-cormorant)] text-2xl font-semibold text-[var(--luxury-brown)]">
                {founder.name}
              </p>
              <p className="mt-0.5 font-[var(--font-cinzel)] text-[10px] uppercase tracking-[0.2em] text-[var(--luxury-brown-light)]">
                {founder.title}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default LuxuryStorySection;
