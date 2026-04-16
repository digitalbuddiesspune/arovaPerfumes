import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fadeUp } from './LuxuryMotion';

const LuxuryHeroSection = ({
  eyebrow,
  title,
  accent,
  description,
  primaryCta,
  secondaryCta,
  tagline,
}) => {
  return (
    <section className="relative overflow-hidden bg-[var(--luxury-cream)]">
      <div className="grid min-h-[calc(100vh-var(--app-header-height,0px))] grid-cols-1 lg:grid-cols-2">
        <div className="relative flex items-center overflow-hidden bg-[var(--luxury-brown)] px-6 py-16 sm:px-10 lg:px-16 lg:py-20 xl:px-20">
          <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,169,110,0.14),transparent_68%)]" />
          <div className="relative z-10 max-w-xl">
            <motion.p
              className="font-[var(--font-cinzel)] text-[10px] uppercase tracking-[0.45em] text-[var(--luxury-gold)]"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.15}
            >
              {eyebrow}
            </motion.p>
            <motion.h1
              className="mt-7 font-[var(--font-cormorant)] text-[clamp(3.5rem,9vw,6.25rem)] leading-[0.96] font-light text-[var(--luxury-cream)]"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.3}
            >
              {title}
              <span className="text-[var(--luxury-gold)] italic"> {accent}</span>
            </motion.h1>
            <motion.p
              className="mt-7 max-w-md font-[var(--font-jost)] text-sm leading-8 text-[rgba(245,240,232,0.68)] sm:text-[15px]"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.45}
            >
              {description}
            </motion.p>
            <motion.div
              className="mt-10 flex flex-wrap items-center gap-5"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.6}
            >
              <Link
                to={primaryCta.to}
                className="inline-flex min-h-12 items-center justify-center bg-[var(--luxury-gold)] px-8 text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--luxury-brown)] transition duration-300 hover:bg-[var(--luxury-cream)]"
              >
                {primaryCta.label}
              </Link>
              <Link
                to={secondaryCta.to}
                className="inline-flex min-h-12 items-center justify-center border-b border-[rgba(245,240,232,0.28)] pb-1 font-[var(--font-cinzel)] text-[11px] uppercase tracking-[0.22em] text-[var(--luxury-cream)] transition duration-300 hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)]"
              >
                {secondaryCta.label}
              </Link>
            </motion.div>
          </div>
        </div>

        <div className="relative hidden overflow-hidden bg-[var(--luxury-cream-deep)] lg:flex lg:flex-col lg:items-center lg:justify-end">
          <div className="absolute left-1/2 top-[28%] h-80 w-80 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,169,110,0.18),transparent_68%)]" />
          <motion.div
            className="relative mt-24"
            initial={{ opacity: 0, y: 36 }}
            animate={{
              opacity: 1,
              y: [0, -14, 0],
            }}
            transition={{
              opacity: { duration: 0.9, delay: 0.45 },
              y: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 },
            }}
          >
            <svg
              viewBox="0 0 200 340"
              className="w-[15rem] drop-shadow-[0_40px_60px_rgba(44,16,8,0.24)] xl:w-[17rem]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="82" y="10" width="36" height="18" rx="4" fill="#C9A96E" />
              <rect x="86" y="28" width="28" height="30" rx="3" fill="#3D1810" />
              <rect x="74" y="54" width="52" height="10" rx="3" fill="#C9A96E" />
              <rect x="50" y="64" width="100" height="220" rx="16" fill="#2C1008" />
              <rect x="60" y="80" width="12" height="160" rx="6" fill="rgba(255,255,255,0.07)" />
              <rect x="60" y="120" width="80" height="110" rx="4" fill="rgba(201,169,110,0.12)" stroke="rgba(201,169,110,0.3)" strokeWidth="0.5" />
              <rect x="80" y="138" width="40" height="3" rx="1" fill="rgba(201,169,110,0.6)" />
              <rect x="72" y="148" width="56" height="8" rx="2" fill="rgba(245,240,232,0.15)" />
              <rect x="76" y="162" width="48" height="2" rx="1" fill="rgba(201,169,110,0.3)" />
              <rect x="82" y="172" width="36" height="2" rx="1" fill="rgba(201,169,110,0.2)" />
              <rect x="78" y="195" width="44" height="2" rx="1" fill="rgba(201,169,110,0.2)" />
              <rect x="74" y="204" width="52" height="2" rx="1" fill="rgba(201,169,110,0.15)" />
              <rect x="50" y="268" width="100" height="16" fill="#1A0A04" />
              <rect x="88" y="22" width="24" height="6" rx="2" fill="#9B5E3A" opacity="0.6" />
            </svg>
          </motion.div>
          <div className="px-8 py-10 text-center">
            <p className="font-[var(--font-cormorant)] text-xl italic tracking-[0.06em] text-[var(--luxury-brown-mid)]">
              {tagline}
            </p>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-10 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
        <span className="font-[var(--font-cinzel)] text-[9px] uppercase tracking-[0.36em] text-[var(--luxury-brown-mid)]">
          Scroll
        </span>
        <motion.div
          className="h-12 w-px bg-gradient-to-b from-[var(--luxury-gold)] to-transparent"
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </section>
  );
};

export default LuxuryHeroSection;
