import { motion } from 'framer-motion';
import LuxurySectionHeading from './LuxurySectionHeading';

const LuxuryPromiseSection = ({ items = [] }) => {
  return (
    <section className="bg-[var(--luxury-brown)] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <LuxurySectionHeading
          label="The Arova Promise"
          title="Why"
          accent="Choose Us"
          description="Clean luxury made for everyday rituals, skin-friendly wear, and signature long-lasting impressions."
          light
        />

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item, index) => (
            <motion.article
              key={item.title}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.65, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(201,169,110,0.38)] text-2xl text-[var(--luxury-cream)]">
                {item.icon}
              </div>
              <h3 className="mt-5 font-[var(--font-cinzel)] text-[11px] uppercase tracking-[0.26em] text-[var(--luxury-gold)]">
                {item.title}
              </h3>
              <p className="mt-4 font-[var(--font-jost)] text-sm leading-7 text-[rgba(245,240,232,0.62)]">
                {item.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LuxuryPromiseSection;
