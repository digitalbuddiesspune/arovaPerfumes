const Contact = () => {
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
            Contact Us
          </h1>
          <div className="mx-auto mt-7 h-px w-32 bg-[linear-gradient(90deg,transparent,var(--luxury-gold),transparent)]" />
          <p className="mt-7 font-[var(--font-jost)] text-base leading-8 text-[var(--luxury-brown-mid)] sm:text-lg">
            We&apos;d love to hear from you. Reach out for support, order help, or collaboration.
          </p>
        </section>

        <section className="mx-auto mt-14 grid max-w-5xl gap-8 md:grid-cols-2">
          <div className="rounded-md border border-[var(--luxury-gold)]/30 bg-white/40 p-6">
            <h2 className="font-[var(--font-cormorant)] text-3xl">Customer Support</h2>
            <p className="mt-3 font-[var(--font-jost)] text-[15px] leading-7 text-[var(--luxury-brown-mid)]">
              For product information, delivery updates, and assistance with your orders.
            </p>
            <p className="mt-5 font-[var(--font-jost)] text-base">
              Email:{' '}
              <a className="underline decoration-[var(--luxury-gold-dark)] underline-offset-4" href="mailto:support@arova.in">
                support@arova.in
              </a>
            </p>
          </div>

          <div className="rounded-md border border-[var(--luxury-gold)]/30 bg-white/40 p-6">
            <h2 className="font-[var(--font-cormorant)] text-3xl">Business Enquiries</h2>
            <p className="mt-3 font-[var(--font-jost)] text-[15px] leading-7 text-[var(--luxury-brown-mid)]">
              For partnerships, retail opportunities, and media collaborations.
            </p>
            <p className="mt-5 font-[var(--font-jost)] text-base">
              Email:{' '}
              <a className="underline decoration-[var(--luxury-gold-dark)] underline-offset-4" href="mailto:hello@arova.in">
                hello@arova.in
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;
