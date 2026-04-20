import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const floatMotion = {
  y: [0, -8, 0],
  transition: {
    duration: 5.5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,var(--luxury-cream-deep)_0%,#f7f1e8_100%)] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <motion.div
        aria-hidden="true"
        animate={{ scale: [1, 1.08, 1], opacity: [0.16, 0.26, 0.16] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -left-24 top-10 h-60 w-60 rounded-full bg-[var(--luxury-gold)]/20 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        animate={{ scale: [1.02, 0.95, 1.02], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute right-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[var(--luxury-brown-light)]/15 blur-3xl"
      />
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={fadeUp}
          custom={0.05}
          className="max-w-3xl border-l-2 border-[var(--luxury-gold)]/45 pl-5 sm:pl-7 lg:pl-9"
        >
          <motion.p
            variants={fadeUp}
            custom={0.1}
            animate={floatMotion}
            className="inline-flex rounded-full border border-[var(--luxury-gold)]/30 bg-[var(--luxury-gold)]/10 px-4 py-1.5 font-[var(--font-cinzel)] text-[10px] uppercase tracking-[0.3em] text-[var(--luxury-gold-dark)]"
          >
            Signature Collection
          </motion.p>
          <motion.h1
            variants={fadeUp}
            custom={0.2}
            className="mt-4 [font-family:'Cormorant_Garamond',serif] text-5xl leading-[0.98] text-[var(--luxury-brown)] sm:text-6xl lg:text-7xl"
          >
            Luxury,
            <br />
            Made for <span className="italic text-[var(--luxury-gold)]">Every Day</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={0.45}
            className="mt-7 max-w-2xl [font-family:'Jost',sans-serif] text-sm leading-8 text-[var(--luxury-brown-mid)]/85 sm:text-[15px]"
          >
            Clean perfumes crafted for modern lifestyles. Long-lasting, refined, and effortlessly
            wearable.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={0.6}
            className="mt-10 flex flex-wrap items-center gap-5"
          >
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/products"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--luxury-brown)] px-8 [font-family:'Cinzel',serif] text-[11px] uppercase tracking-[0.22em] text-[var(--luxury-cream)] transition duration-300 hover:bg-[var(--luxury-brown-mid)]"
              >
                Explore Collection
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
