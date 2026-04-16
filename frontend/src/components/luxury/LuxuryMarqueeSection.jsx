const LuxuryMarqueeSection = ({ items = [] }) => {
  const loopItems = [...items, ...items];

  return (
    <section className="overflow-hidden bg-[var(--luxury-brown)] py-4">
      <div className="luxury-marquee-track flex min-w-max items-center whitespace-nowrap">
        {loopItems.map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-center">
            <span className="px-8 font-[var(--font-cormorant)] text-xl italic text-[var(--luxury-gold)]/85">
              {item}
            </span>
            <span className="text-xl text-[var(--luxury-cream)]/30">✦</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LuxuryMarqueeSection;
