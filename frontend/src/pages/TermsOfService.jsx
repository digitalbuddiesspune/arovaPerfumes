import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const sections = [
  {
    title: '1. General',
    lines: [
      'This website is operated by Arova Perfume.',
      'By purchasing from us, you agree to comply with these terms and conditions.',
    ],
  },
  {
    title: '2. Products',
    lines: [
      'All perfumes are described as accurately as possible.',
      'We do not guarantee that product colors or packaging will match exactly due to screen differences.',
    ],
  },
  {
    title: '3. Pricing',
    lines: [
      'Prices are listed in INR (₹) and are subject to change without notice.',
      'We reserve the right to modify or discontinue products at any time.',
    ],
  },
  {
    title: '4. Orders',
    lines: [
      'We reserve the right to cancel or refuse any order.',
      'You must provide accurate billing and shipping details.',
    ],
  },
  {
    title: '5. Intellectual Property',
    lines: [
      'All content (logo, images, text) belongs to Arova Perfume and cannot be reused without permission.',
    ],
  },
  {
    title: '6. Limitation of Liability',
    lines: ['We are not liable for any damages arising from misuse of our products.'],
  },
];

const TermsOfService = () => {
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
              Legal
            </p>
            <h1 className="mt-3 font-[var(--font-cormorant)] text-5xl font-light leading-none sm:text-6xl">
              Terms & Conditions
            </h1>
            <p className="mt-5 max-w-3xl font-[var(--font-jost)] text-sm leading-7 text-[var(--luxury-brown-mid)] sm:text-[15px]">
              Welcome to Arova Perfume. By accessing or using our website, you agree to the
              following terms:
            </p>
          </div>
        </div>

        <div className="space-y-7 border-t border-[var(--luxury-gold)]/25 pt-8">
          {sections.map((section) => (
            <section key={section.title} className="border-b border-[var(--luxury-gold)]/15 pb-7">
              <h2 className="font-[var(--font-cormorant)] text-3xl font-semibold text-[var(--luxury-brown)]">
                {section.title}
              </h2>
              <div className="mt-3 space-y-2">
                {section.lines.map((line) => (
                  <p
                    key={line}
                    className="font-[var(--font-jost)] text-sm leading-7 text-[var(--luxury-brown-mid)] sm:text-[15px]"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
