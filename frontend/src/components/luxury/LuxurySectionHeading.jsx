import { Reveal } from './LuxuryMotion';

const LuxurySectionHeading = ({
  label,
  title,
  accent,
  description,
  align = 'center',
  light = false,
}) => {
  const alignment =
    align === 'left'
      ? 'items-start text-left'
      : align === 'right'
      ? 'items-end text-right'
      : 'items-center text-center';

  return (
    <Reveal className={`mx-auto flex max-w-3xl flex-col ${alignment}`}>
      {label ? (
        <p
          className={`font-[var(--font-cinzel)] text-[10px] uppercase tracking-[0.38em] ${
            light ? 'text-[var(--luxury-gold)]' : 'text-[var(--luxury-gold-dark)]'
          }`}
        >
          {label}
        </p>
      ) : null}
      <h2
        className={`mt-4 font-[var(--font-cormorant)] text-4xl leading-none font-light sm:text-5xl lg:text-6xl ${
          light ? 'text-[var(--luxury-cream)]' : 'text-[var(--luxury-brown)]'
        }`}
      >
        {title}{' '}
        {accent ? (
          <span
            className={`italic ${
              light ? 'text-[var(--luxury-gold)]' : 'text-[var(--luxury-brown-mid)]'
            }`}
          >
            {accent}
          </span>
        ) : null}
      </h2>
      {description ? (
        <p
          className={`mt-5 max-w-2xl font-[var(--font-jost)] text-sm leading-7 sm:text-[15px] ${
            light ? 'text-[rgba(245,240,232,0.72)]' : 'text-[var(--luxury-brown-mid)]'
          }`}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
};

export default LuxurySectionHeading;
