import { Link } from 'react-router-dom';
import LuxurySectionHeading from './LuxurySectionHeading';
import { Reveal } from './LuxuryMotion';

const LuxuryNotesSection = ({ tiers = [], cta }) => {
  return (
    <section id="notes" className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <Reveal>
          <div className="border-y border-[rgba(44,16,8,0.1)]">
            {tiers.map((tier) => (
              <div
                key={tier.label}
                className="flex items-center gap-4 border-b border-[rgba(44,16,8,0.1)] px-0 py-6 last:border-b-0 sm:gap-6 sm:px-2"
              >
                <span className="min-w-24 font-[var(--font-cinzel)] text-[10px] uppercase tracking-[0.26em] text-[var(--luxury-gold-dark)]">
                  {tier.label}
                </span>
                <span className="font-[var(--font-cormorant)] text-2xl italic text-[var(--luxury-brown)] sm:text-[1.75rem]">
                  {tier.notes}
                </span>
                <span className="ml-auto text-2xl">{tier.icon}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <div>
          <LuxurySectionHeading
            label="Fragrance Architecture"
            title="The Art of"
            accent="Layering"
            description="Every AROVA fragrance is built as a three-tier pyramid that evolves through the day, leaving a memorable signature on skin."
            align="left"
          />
          {cta ? (
            <Link
              to={cta.to}
              className="mt-8 inline-flex min-h-12 items-center justify-center bg-[var(--luxury-gold)] px-8 font-[var(--font-cinzel)] text-[10px] uppercase tracking-[0.24em] text-[var(--luxury-brown)] transition duration-300 hover:bg-[var(--luxury-brown)] hover:text-[var(--luxury-cream)]"
            >
              {cta.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default LuxuryNotesSection;
