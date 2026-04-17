import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LuxurySectionHeading from './LuxurySectionHeading';
import LuxuryProductCard from './LuxuryProductCard';
import { staggerContainer } from './LuxuryMotion';

const LuxuryProductGridSection = ({
  id,
  label,
  title,
  accent,
  description,
  products = [],
  cta,
  onAddToCart,
  lowStockThreshold,
}) => {
  return (
    <section id={id} className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <LuxurySectionHeading
            label={label}
            title={title}
            accent={accent}
            description={description}
            align="left"
          />
          {cta ? (
            <Link
              to={cta.to}
              className="inline-flex w-fit items-center justify-center border border-[var(--luxury-brown)] px-6 py-3 font-[var(--font-cinzel)] text-[10px] uppercase tracking-[0.28em] text-[var(--luxury-brown)] transition duration-300 hover:bg-[var(--luxury-brown)] hover:text-[var(--luxury-cream)]"
            >
              {cta.label}
            </Link>
          ) : null}
        </div>

        <motion.div
          className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {products.map((product, index) => (
            <LuxuryProductCard
              key={product._id || product.id || `${product.title}-${index}`}
              product={product}
              index={index}
              onAddToCart={onAddToCart}
              lowStockThreshold={lowStockThreshold}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LuxuryProductGridSection;
