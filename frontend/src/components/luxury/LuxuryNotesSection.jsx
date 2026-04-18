import { Link } from 'react-router-dom';
import LuxurySectionHeading from './LuxurySectionHeading';
import { Reveal } from './LuxuryMotion';

const LuxuryNotesSection = ({ tiers = [], cta }) => {
  return (
    <section
      id="notes"
      className="relative overflow-hidden bg-[linear-gradient(160deg,#f8f1ea_0%,#f5ece3_46%,#f9f4ef_100%)] px-5 py-20 sm:px-8 lg:px-12 lg:py-28"
    >
      <div className="pointer-events-none absolute -left-10 top-0 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(201,169,110,0.2),transparent_72%)]" />
      <div className="pointer-events-none absolute -right-12 bottom-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(44,16,8,0.08),transparent_72%)]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <Reveal>
          <div className="relative pl-6 sm:pl-8">
            <div className="absolute bottom-0 left-0 top-0 w-px bg-[linear-gradient(180deg,rgba(201,169,110,0.18),rgba(44,16,8,0.16),rgba(201,169,110,0.18))]" />
            {tiers.map((tier) => (
              <div
                key={tier.label}
                className="relative flex items-start gap-4 border-b border-[rgba(44,16,8,0.1)] py-6 last:border-b-0 sm:gap-6 sm:py-7"
              >
                <span className="absolute -left-[30px] top-7 inline-flex h-3.5 w-3.5 rounded-full border border-[var(--luxury-gold)] bg-[#f8efe6]" />
                <div className="min-w-[88px] pt-1">
                  <p className="font-[var(--font-cinzel)] text-[10px] uppercase tracking-[0.26em] text-[var(--luxury-gold-dark)]">
                    {tier.label}
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-[var(--font-cormorant)] text-2xl italic leading-tight text-[var(--luxury-brown)] sm:text-[1.75rem]">
                    {tier.notes}
                  </p>
                </div>
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
