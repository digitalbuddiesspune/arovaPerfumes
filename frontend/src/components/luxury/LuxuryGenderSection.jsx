import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LuxuryGenderCard = ({ item, index }) => {
  const isDark = item.variant === 'dark';

  return (
    <motion.article
      className={`relative flex min-h-[30rem] flex-col justify-center overflow-hidden px-6 py-16 sm:px-10 lg:px-16 ${
        isDark ? 'bg-[var(--luxury-brown)]' : 'bg-[var(--luxury-cream-deep)]'
      }`}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.75, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={`pointer-events-none absolute -bottom-12 right-0 font-[var(--font-cormorant)] text-[18rem] italic leading-none opacity-[0.06] ${
          isDark ? 'text-[var(--luxury-cream)]' : 'text-[var(--luxury-brown)]'
        }`}
      >
        {item.letter}
      </div>
      <p
        className={`font-[var(--font-cinzel)] text-[10px] uppercase tracking-[0.38em] ${
          isDark ? 'text-[var(--luxury-gold)]' : 'text-[var(--luxury-brown-light)]'
        }`}
      >
        {item.label}
      </p>
      <h3
        className={`mt-6 font-[var(--font-cormorant)] text-[clamp(2.6rem,5vw,4.2rem)] leading-[1.02] font-light ${
          isDark ? 'text-[var(--luxury-cream)]' : 'text-[var(--luxury-brown)]'
        }`}
      >
        {item.title}
      </h3>
      <p
        className={`mt-6 max-w-xs font-[var(--font-jost)] text-sm leading-8 ${
          isDark ? 'text-[rgba(245,240,232,0.62)]' : 'text-[var(--luxury-brown-mid)]'
        }`}
      >
        {item.description}
      </p>
      <Link
        to={item.to}
        className={`mt-10 inline-flex w-fit items-center justify-center border px-7 py-3 font-[var(--font-cinzel)] text-[10px] uppercase tracking-[0.24em] transition duration-300 ${
          isDark
            ? 'border-[var(--luxury-gold)] text-[var(--luxury-gold)] hover:bg-[var(--luxury-gold)] hover:text-[var(--luxury-brown)]'
            : 'border-[var(--luxury-brown)] text-[var(--luxury-brown)] hover:bg-[var(--luxury-brown)] hover:text-[var(--luxury-cream)]'
        }`}
      >
        {item.cta}
      </Link>
    </motion.article>
  );
};

const LuxuryGenderSection = ({ items = [] }) => {
  return (
    <section id="gender" className="grid grid-cols-1 lg:grid-cols-2">
      {items.map((item, index) => (
        <LuxuryGenderCard key={item.label} item={item} index={index} />
      ))}
    </section>
  );
};

export default LuxuryGenderSection;
