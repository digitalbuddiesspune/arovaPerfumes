const LuxuryMarqueeSection = ({ items = [] }) => {
  const loopItems = [...items, ...items];

  return (
    <section className="overflow-hidden bg-[var(--luxury-brown)] py-2">
      <div className="luxury-marquee-track flex min-w-max items-center whitespace-nowrap">
        {loopItems.map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-center">
            <span className="px-6 font-[var(--font-cormorant)] text-base italic text-[var(--luxury-gold)]/85 sm:text-lg">
              {item}
            </span>
            <span className="text-base text-[var(--luxury-cream)]/30 sm:text-lg">✦</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LuxuryMarqueeSection;
