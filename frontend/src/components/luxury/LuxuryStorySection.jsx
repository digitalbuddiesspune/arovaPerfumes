import { Reveal } from './LuxuryMotion';

const LuxuryStorySection = ({ quote, description, founder }) => {
  return (
    <section id="story" className="grid grid-cols-1 lg:grid-cols-2">
      <div className="relative flex min-h-[28rem] items-center justify-center overflow-hidden bg-[var(--luxury-brown)] px-6 py-16">
        <div className="absolute h-[26rem] w-[26rem] rounded-full border border-[rgba(201,169,110,0.18)]" />
        <div className="absolute h-[17rem] w-[17rem] rounded-full border border-[rgba(201,169,110,0.28)]" />
        <div className="relative text-7xl">🌿</div>
      </div>
      <div className="bg-[var(--luxury-cream-deep)] px-6 py-16 sm:px-10 lg:px-16 xl:px-20">
        <Reveal className="max-w-xl">
          <p className="font-[var(--font-cormorant)] text-[2rem] leading-tight font-light italic text-[var(--luxury-brown)] sm:text-[2.6rem]">
            {quote}
          </p>
          <p className="mt-8 font-[var(--font-jost)] text-sm leading-8 text-[var(--luxury-brown-mid)] sm:text-[15px]">
            {description}
          </p>
          <div className="mt-9 flex items-center gap-4">
            <div className="flex h-13 w-13 items-center justify-center rounded-full bg-[var(--luxury-brown)] font-[var(--font-cinzel)] text-lg text-[var(--luxury-gold)]">
              {founder.initials}
            </div>
            <div className="flex flex-col">
              <span className="font-[var(--font-cormorant)] text-xl font-semibold text-[var(--luxury-brown)]">
                {founder.name}
              </span>
              <span className="font-[var(--font-cinzel)] text-[10px] uppercase tracking-[0.24em] text-[var(--luxury-brown-light)]">
                {founder.title}
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default LuxuryStorySection;
