import { useState } from 'react';
import { motion } from 'framer-motion';

const LuxuryNewsletterSection = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim()) return;

    try {
      setIsSubmitting(true);
      await onSubmit?.(email.trim());
      setStatus('Joined');
      setEmail('');
    } catch {
      setStatus('Try again');
    } finally {
      setIsSubmitting(false);
      window.setTimeout(() => setStatus(''), 2500);
    }
  };

  return (
    <section className="bg-[var(--luxury-brown)] px-5 py-20 text-center sm:px-8 lg:px-12 lg:py-24">
      <motion.div
        className="mx-auto max-w-3xl"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="font-[var(--font-cormorant)] text-5xl font-light leading-none text-[var(--luxury-cream)] sm:text-6xl">
          The Essence of <span className="text-[var(--luxury-gold)] italic">Exclusivity</span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl font-[var(--font-jost)] text-sm leading-7 text-[rgba(245,240,232,0.62)] sm:text-[15px]">
          Join the AROVA circle. Be the first to discover new scents, offers and stories.
        </p>
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-10 flex max-w-xl flex-col overflow-hidden border border-[rgba(201,169,110,0.32)] bg-[rgba(245,240,232,0.08)] sm:flex-row"
        >
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="your@email.com"
            className="min-h-14 flex-1 bg-transparent px-5 font-[var(--font-jost)] text-sm text-[var(--luxury-cream)] outline-none placeholder:text-[rgba(245,240,232,0.35)]"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-14 bg-[var(--luxury-gold)] px-8 font-[var(--font-cinzel)] text-[10px] uppercase tracking-[0.24em] text-[var(--luxury-brown)] transition duration-300 hover:bg-[var(--luxury-cream)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Joining' : status || 'Join'}
          </button>
        </form>
      </motion.div>
    </section>
  );
};

export default LuxuryNewsletterSection;
