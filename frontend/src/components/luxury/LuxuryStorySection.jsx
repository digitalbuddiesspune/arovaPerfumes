import { Reveal } from './LuxuryMotion';

const LuxuryStorySection = ({ quote, description }) => {
  return (
    <section
      id="story"
      className="relative overflow-hidden bg-[#f5ede5] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[linear-gradient(180deg,rgba(255,255,255,0.42),transparent)]" />

      <div className="mx-auto max-w-6xl">
        <Reveal>
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
        </Reveal>
      </div>
    </section>
  );
};

export default LuxuryStorySection;
