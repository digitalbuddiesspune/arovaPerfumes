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

const Hero = () => {
  return (
    <section className="min-h-screen bg-[#F5F0E8]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="flex items-center bg-[#2C1008] px-6 py-16 sm:px-10 lg:px-16">
          <div className="max-w-xl">
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.15}
              className="[font-family:'Cinzel',serif] text-[10px] uppercase tracking-[0.4em] text-[#C9A96E]"
            >
              ✦ Est. 2024 — Nagpur, India
            </motion.p>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.3}
              className="mt-7 [font-family:'Cormorant_Garamond',serif] text-5xl leading-[0.98] text-[#F5F0E8] sm:text-6xl lg:text-7xl"
            >
              Where Earth
              <br />
              Meets <span className="italic text-[#C9A96E]">Essence</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.45}
              className="mt-7 max-w-md [font-family:'Jost',sans-serif] text-sm leading-8 text-[#F5F0E8]/70 sm:text-[15px]"
            >
              Clean perfumery crafted with ethanol-based formulas. A divine blend of Fraganote &
              Secret — long-lasting, skin-friendly, and born from nature.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.6}
              className="mt-10 flex flex-wrap items-center gap-5"
            >
              <Link
                to="/products"
                className="inline-flex min-h-12 items-center justify-center bg-[#C9A96E] px-8 [font-family:'Cinzel',serif] text-[11px] uppercase tracking-[0.22em] text-[#2C1008] transition duration-300 hover:bg-[#F5F0E8]"
              >
                Explore Collection
              </Link>
              <a
                href="#story"
                className="inline-flex min-h-12 items-center justify-center border-b border-[#F5F0E8]/40 pb-1 [font-family:'Cinzel',serif] text-[11px] uppercase tracking-[0.2em] text-[#F5F0E8] transition duration-300 hover:border-[#C9A96E] hover:text-[#C9A96E]"
              >
                Our Story
              </a>
            </motion.div>
          </div>
        </div>

        <div className="hidden items-center justify-center bg-[#F5F0E8] lg:flex">
          <div className="flex h-72 w-72 items-center justify-center rounded-full border border-[#C9A96E]/35 text-center [font-family:'Cinzel',serif] text-xs uppercase tracking-[0.2em] text-[#2C1008]/60">
            Image Placeholder
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
