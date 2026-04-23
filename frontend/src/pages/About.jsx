const About = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--luxury-cream)] text-[var(--luxury-brown)]">
      <div className="pointer-events-none absolute -left-28 top-20 h-64 w-64 rounded-full bg-[var(--luxury-gold)]/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-16 h-72 w-72 rounded-full bg-[var(--luxury-brown-light)]/10 blur-3xl" />

      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20 lg:px-10 lg:py-24">
        <section className="mx-auto max-w-4xl text-center">
          <p className="font-[var(--font-cinzel)] text-[10px] uppercase tracking-[0.3em] text-[var(--luxury-gold-dark)]">
            Arova
          </p>
          <h1 className="mt-4 font-[var(--font-cormorant)] text-4xl font-light uppercase tracking-[0.16em] sm:text-5xl">
            About Us
          </h1>
          <div className="mx-auto mt-7 h-px w-32 bg-[linear-gradient(90deg,transparent,var(--luxury-gold),transparent)]" />
          <p className="mt-7 font-[var(--font-cormorant)] text-2xl italic text-[var(--luxury-brown-mid)] sm:text-3xl">
            From Earth to Essence
          </p>
        </section>

        <section className="mx-auto mt-14 max-w-4xl">
          <div className="space-y-6 border-l-2 border-[var(--luxury-gold)]/45 pl-5 sm:pl-7">
            <p className="font-[var(--font-jost)] text-base leading-8 text-[var(--luxury-brown-mid)] sm:text-lg">
              Arova is a clean perfume brand by Atraya Lifestyle Private Limited, established in
              2024 and proudly founded by a woman entrepreneur from Nagpur.
            </p>
            <p className="font-[var(--font-jost)] text-base leading-8 text-[var(--luxury-brown-mid)] sm:text-lg">
              Built on the belief that fragrance should be both luxurious and wearable every day,
              Arova bridges the gap between premium quality and daily lifestyle. We are not just a
              luxury perfume brand, we are luxury made accessible, designed for those who want to
              feel confident, elegant, and expressive, every single day.
            </p>
            <p className="font-[var(--font-jost)] text-base leading-8 text-[var(--luxury-brown-mid)] sm:text-lg">
              From Earth to Essence - this is not just our tagline, it&apos;s our philosophy. We
              focus on creating clean, thoughtfully crafted fragrances that are rooted in purity,
              inspired by nature, and elevated into refined, modern scents.
            </p>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-5xl border-y border-[var(--luxury-gold)]/28 py-12">
          <h2 className="text-center font-[var(--font-cinzel)] text-[11px] uppercase tracking-[0.32em] text-[var(--luxury-gold-dark)]">
            Our Philosophy
          </h2>
          <p className="mx-auto mt-7 max-w-3xl text-center font-[var(--font-jost)] text-base leading-8 text-[var(--luxury-brown-mid)] sm:text-lg">
            At Arova, perfume is more than a product, it&apos;s a personal signature. Whether
            it&apos;s your daily routine or a special moment, our fragrances are designed to stay
            with you, leaving a lasting impression without being overwhelming.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="text-center font-[var(--font-cinzel)] text-[11px] uppercase tracking-[0.32em] text-[var(--luxury-gold-dark)]">
            Every Bottle Reflects
          </h2>
          <div className="mx-auto mt-10 grid max-w-6xl gap-10 md:grid-cols-3">
            <div className="border-b border-[var(--luxury-gold)]/30 pb-6 text-center md:text-left">
              <p className="text-3xl" aria-hidden>
                🌿
              </p>
              <h3 className="mt-3 font-[var(--font-cormorant)] text-3xl font-semibold">
                Clean Formulation
              </h3>
              <p className="mt-3 font-[var(--font-jost)] text-[15px] leading-7 text-[var(--luxury-brown-mid)]">
                Thoughtfully created formulas that prioritize purity and daily comfort.
              </p>
            </div>

            <div className="border-b border-[var(--luxury-gold)]/30 pb-6 text-center md:text-left">
              <p className="text-3xl" aria-hidden>
                ⏳
              </p>
              <h3 className="mt-3 font-[var(--font-cormorant)] text-3xl font-semibold">
                Long-Lasting Performance
              </h3>
              <p className="mt-3 font-[var(--font-jost)] text-[15px] leading-7 text-[var(--luxury-brown-mid)]">
                Crafted to accompany you throughout your day with a subtle, elegant trail.
              </p>
            </div>

            <div className="border-b border-[var(--luxury-gold)]/30 pb-6 text-center md:text-left">
              <p className="text-3xl" aria-hidden>
                ✨
              </p>
              <h3 className="mt-3 font-[var(--font-cormorant)] text-3xl font-semibold">
                Effortless Sophistication
              </h3>
              <p className="mt-3 font-[var(--font-jost)] text-[15px] leading-7 text-[var(--luxury-brown-mid)]">
                Refined modern scents designed for confidence, elegance, and expression.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-4xl text-center">
          <h2 className="font-[var(--font-cormorant)] text-4xl font-light uppercase tracking-[0.12em] sm:text-5xl">
            Everyday Luxury, Everyday You
          </h2>
          <p className="mt-6 font-[var(--font-jost)] text-base leading-8 text-[var(--luxury-brown-mid)] sm:text-lg">
            We are building more than a brand- we are creating an experience where everyday luxury
            becomes a habit, not an occasion.
          </p>
          <p className="mt-8 font-[var(--font-cormorant)] text-3xl italic text-[var(--luxury-gold-dark)] sm:text-4xl">
            Arova
            <br />
            From Earth to Essence.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;