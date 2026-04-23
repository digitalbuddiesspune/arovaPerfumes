import { motion } from 'framer-motion';
import LuxurySectionHeading from './LuxurySectionHeading';

const LuxuryTestimonialsSection = ({ items = [] }) => {
  return (
    <section className="bg-[var(--luxury-cream-deep)] px-5 py-14 sm:px-8 lg:px-12 lg:py-18">
      <div className="mx-auto max-w-7xl">
        <LuxurySectionHeading
          label="What They Say"
          title="Loved by"
          accent="Many"
          description="Real experiences from fragrance lovers who discovered their signature scent with AROVA."
        />

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {items.map((item, index) => (
            <motion.article
              key={`${item.author}-${index}`}
              className="relative bg-[var(--luxury-cream)] px-6 pb-6 pt-10"
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute left-5 top-3 font-[var(--font-cormorant)] text-6xl leading-none text-[var(--luxury-gold)]/40">
                "
              </div>
              <div className="relative">
                <div className="font-[var(--font-jost)] text-xs tracking-[0.16em] text-[var(--luxury-gold-dark)]">
                  {'★'.repeat(item.rating || 5)}
                </div>
                <p className="mt-4 font-[var(--font-cormorant)] text-lg leading-7 italic text-[var(--luxury-brown)] sm:text-xl sm:leading-8">
                  {item.quote}
                </p>
                <p className="mt-4 font-[var(--font-cinzel)] text-[8px] uppercase tracking-[0.16em] text-[var(--luxury-brown-light)] sm:text-[9px] sm:tracking-[0.18em]">
                  {item.author}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LuxuryTestimonialsSection;
