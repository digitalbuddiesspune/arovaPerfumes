import React, { useEffect, useRef, useState } from 'react';
import HeroSlider from '../components/HeroSlider';

// Import new components you'd need to create for a full landing page
import BestSellers from '../components/BestSellers';
import MensSection from '../components/MensSection';
import WomenSection from '../components/WomenSection';
import CacheConsent from '../components/CacheConsent';
import ArovaPromise from '../components/ArovaPromise';

const Home = () => {
  const [openFaq, setOpenFaq] = useState(0);
  const faqRef = useRef(null);
  const [faqVisible, setFaqVisible] = useState(false);
  const heroBanner =
    'https://res.cloudinary.com/dzd47mpdo/image/upload/v1776088569/Untitled_design_8_vfoi7z.svg';

  // Mobile-only banner
  const mobileHeroBanner =
    'https://res.cloudinary.com/dnyp5jknp/image/upload/v1776236508/Beige_and_Green_Simple_Luxury_Perfume_Instagram_Post_600_x_600_px_1_bi8bth.png';

  const faqItems = [
    {
      question: 'Are Arova perfumes long-lasting?',
      answer:
        'Yes, our perfumes are crafted to last throughout your day while remaining subtle and pleasant.',
    },
    {
      question: 'Are these perfumes suitable for daily use?',
      answer: 'Absolutely. Arova is designed as a luxury + daily wear perfume brand.',
    },
    {
      question: 'Are your perfumes clean?',
      answer: 'Yes, we focus on clean and thoughtfully crafted formulations.',
    },
    {
      question: 'Do you offer returns?',
      answer: 'Please refer to our Return Policy for details.',
    },
  ];

  useEffect(() => {
    const node = faqRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setFaqVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);


  return (
    // Added a container with padding for visual balance
    <div className="min-h-screen pt-0 pb-16 md:pb-0 mt-0 bg-[var(--brand-cream)]">
      
      {/* 1. Hero Slider/Banner - Primary Visual & CTA */}
      <HeroSlider
        slides={[{ desktop: heroBanner, alt: 'Arova Perfume Banner' }]}
        mobileSrc={mobileHeroBanner}
        mobileCtaTo="/products"
        mobileCtaLabel="Shop Now"
      />

      <BestSellers />
      <MensSection />
      <WomenSection />
      
      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <hr className="my-8 border-[var(--brand-border)]" />
      </main>

      <ArovaPromise />

      {/* FAQ Section */}
      <section
        ref={faqRef}
        className={`w-full pb-12 transition-all duration-700 ease-out md:pb-16 ${
          faqVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        <div className="relative overflow-hidden bg-[linear-gradient(180deg,#fffdfc_0%,#f9f3f1_100%)] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="pointer-events-none absolute -top-16 right-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(56,19,19,0.14),transparent_70%)]" />
          <div className="pointer-events-none absolute -bottom-20 left-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(201,169,110,0.2),transparent_72%)]" />

          <div className="relative mx-auto max-w-6xl">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--brand-muted)]">Support</p>
              <h2 className="mt-3 text-3xl font-semibold text-[var(--brand-maroon)] sm:text-4xl">Frequently Asked Questions</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[var(--brand-muted)] sm:text-base">
                Everything you need to know about Arova fragrances, quality, and everyday usage.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {faqItems.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={item.question}
                    className={`rounded-2xl border bg-white/95 shadow-sm backdrop-blur transition-all duration-300 ${
                      isOpen
                        ? 'border-[var(--brand-maroon)] shadow-[0_14px_34px_rgba(56,19,19,0.12)]'
                        : 'border-[var(--brand-border)] hover:border-[#d2b7ad]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq((prev) => (prev === index ? -1 : index))}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                    >
                      <span className="text-sm font-semibold text-[var(--brand-text)] sm:text-base">
                        {item.question}
                      </span>
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-all duration-300 ${
                          isOpen
                            ? 'rotate-45 border-[var(--brand-maroon)] bg-[var(--brand-maroon)] text-white'
                            : 'border-[var(--brand-border)] bg-white text-[var(--brand-muted)]'
                        }`}
                      >
                        +
                      </span>
                    </button>

                    <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm leading-relaxed text-[var(--brand-muted)] sm:px-6 sm:text-[15px]">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Cache Consent Banner - Shows only once */}
      <CacheConsent />
    </div>
  );
};

export default Home;   