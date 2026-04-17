import { motion } from 'framer-motion';

const LuxuryPromiseSection = ({ items = [] }) => {
  return (
    <section className="relative overflow-hidden bg-[var(--luxury-brown)] px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <motion.p
          className="text-center font-[var(--font-cinzel)] text-[10px] uppercase tracking-[0.34em] text-[var(--luxury-gold)]"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          The Arova Promise
        </motion.p>
        <motion.h2
          className="mt-4 text-center font-[var(--font-cormorant)] text-5xl font-light text-[var(--luxury-cream)] sm:text-6xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, delay: 0.05 }}
        >
          Why Arova
        </motion.h2>

        <motion.div
          className="mx-auto mt-10 max-w-6xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, delay: 0.1 }}
        >
          <div className="flex items-center justify-between gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {items.map((item, index) => {
              const text = typeof item === 'string' ? item : item?.title || '';
              return (
                <div
                  key={`${text}-${index}`}
                  className="flex shrink-0 items-center gap-3 rounded-xl border border-[rgba(201,169,110,0.22)] bg-[rgba(255,255,255,0.03)] px-3 py-3 sm:px-4"
                >
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--luxury-gold)]/70 text-[11px] text-[var(--luxury-gold)]">
                    ✦
                  </span>
                  <p className="whitespace-nowrap font-[var(--font-jost)] text-sm text-[rgba(245,240,232,0.92)]">
                    {text}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LuxuryPromiseSection;
