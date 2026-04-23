import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const Contact = () => {
  const [searchParams] = useSearchParams();
  const returnOrder = searchParams.get('topic') === 'return' ? searchParams.get('order') : null;
  const [result, setResult] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult('Sending...');

    const formData = new FormData(event.target);
    formData.append('access_key', '156b01bd-55fe-4912-8598-c585ed4fcf43');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult('Message sent successfully.');
        event.target.reset();
      } else {
        setResult('Something went wrong. Please try again.');
      }
    } catch (error) {
      setResult('Network error. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--luxury-cream)] text-[var(--luxury-brown)]">
      <div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-[var(--luxury-gold)]/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-[var(--luxury-brown-light)]/10 blur-3xl" />

      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14 lg:py-16">
        <div className="mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-[var(--font-jost)] text-sm text-[var(--luxury-brown-mid)] transition-colors hover:text-[var(--luxury-brown)]"
          >
            <FaArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>

          <div className="mt-6">
            <p className="font-[var(--font-cinzel)] text-[10px] uppercase tracking-[0.3em] text-[var(--luxury-gold-dark)]">
              Support
            </p>
            <h1 className="mt-3 font-[var(--font-cormorant)] text-4xl font-light leading-none sm:text-5xl">
              Contact Us
            </h1>
            <p className="mt-5 max-w-3xl font-[var(--font-jost)] text-sm leading-7 text-[var(--luxury-brown-mid)] sm:text-[15px]">
              Need help with an order, delivery, returns, or product details? Our team is ready to
              assist you.
            </p>
          </div>
        </div>

        {returnOrder ? (
          <div className="mb-8 border-l-2 border-[var(--luxury-gold)] bg-[var(--luxury-gold)]/8 px-4 py-3">
            <p className="font-[var(--font-cinzel)] text-[11px] uppercase tracking-[0.2em] text-[var(--luxury-gold-dark)]">
              Return Request
            </p>
            <p className="mt-1 font-[var(--font-jost)] text-sm text-[var(--luxury-brown-mid)]">
              Please mention order <span className="font-semibold">#{returnOrder}</span> so we can
              help you faster.
            </p>
          </div>
        ) : null}

        <section className="space-y-7 border-t border-[var(--luxury-gold)]/25 pt-8">
          <div className="border-b border-[var(--luxury-gold)]/15 pb-7">
            <h2 className="font-[var(--font-cormorant)] text-3xl font-semibold">Email Support</h2>
            <p className="mt-3 font-[var(--font-jost)] text-sm leading-7 text-[var(--luxury-brown-mid)] sm:text-[15px]">
              <a href="mailto:arovaworld08@gmail.com" className="hover:text-[var(--luxury-gold-dark)]">
                arovaworld08@gmail.com
              </a>
            </p>
          </div>

          <div className="border-b border-[var(--luxury-gold)]/15 pb-7">
            <h2 className="font-[var(--font-cormorant)] text-3xl font-semibold">Phone Support</h2>
            <p className="mt-3 font-[var(--font-jost)] text-sm leading-7 text-[var(--luxury-brown-mid)] sm:text-[15px]">
              +91 9309490435
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 border-b border-[var(--luxury-gold)]/15 pb-7">
            <h2 className="font-[var(--font-cormorant)] text-3xl font-semibold">Send a Message</h2>
            <div>
              <label className="mb-1 block font-[var(--font-jost)] text-sm text-[var(--luxury-brown-mid)]">
                Name
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full border border-[var(--luxury-gold)]/30 bg-white/70 px-3 py-2 font-[var(--font-jost)] text-sm outline-none focus:border-[var(--luxury-gold-dark)]"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="mb-1 block font-[var(--font-jost)] text-sm text-[var(--luxury-brown-mid)]">
                Number
              </label>
              <input
                type="tel"
                name="number"
                required
                className="w-full border border-[var(--luxury-gold)]/30 bg-white/70 px-3 py-2 font-[var(--font-jost)] text-sm outline-none focus:border-[var(--luxury-gold-dark)]"
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <label className="mb-1 block font-[var(--font-jost)] text-sm text-[var(--luxury-brown-mid)]">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full border border-[var(--luxury-gold)]/30 bg-white/70 px-3 py-2 font-[var(--font-jost)] text-sm outline-none focus:border-[var(--luxury-gold-dark)]"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="mb-1 block font-[var(--font-jost)] text-sm text-[var(--luxury-brown-mid)]">
                Message
              </label>
              <textarea
                name="message"
                rows={5}
                required
                className="w-full resize-y border border-[var(--luxury-gold)]/30 bg-white/70 px-3 py-2 font-[var(--font-jost)] text-sm outline-none focus:border-[var(--luxury-gold-dark)]"
                placeholder="Write your message"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center bg-[var(--luxury-brown)] px-6 py-2.5 font-[var(--font-cinzel)] text-[11px] uppercase tracking-[0.18em] text-[var(--luxury-cream)] transition hover:bg-[var(--luxury-brown-mid)]"
            >
              Submit
            </button>
            {result ? (
              <p className="font-[var(--font-jost)] text-sm text-[var(--luxury-brown-mid)]">{result}</p>
            ) : null}
          </form>
        </section>
      </div>
    </div>
  );
};

export default Contact;
