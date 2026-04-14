import React, { useState } from 'react';
import HeroSlider from '../components/HeroSlider';

// Import new components you'd need to create for a full landing page
import BestSellers from '../components/BestSellers';
import MensSection from '../components/MensSection';
import WomenSection from '../components/WomenSection';
import CacheConsent from '../components/CacheConsent';
import ArovaPromise from '../components/ArovaPromise';

const Home = () => {
  const [openFaq, setOpenFaq] = useState(0);
  const heroBanner =
    'https://res.cloudinary.com/dzd47mpdo/image/upload/v1776088569/Untitled_design_8_vfoi7z.svg';

  // Mobile-only banner
  const mobileHeroBanner =
    'https://res.cloudinary.com/dzd47mpdo/image/upload/v1776088326/a498f118-1d74-43aa-87e9-ca88552e4a4c.png';

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
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
        <div className="relative overflow-hidden bg-white border border-[var(--brand-border)] rounded-2xl p-5 sm:p-7 md:p-8 shadow-sm">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[radial-gradient(circle,rgba(201,169,110,0.18),transparent_70%)] pointer-events-none" />
          <div className="mb-6">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--brand-muted)]">Support</p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--brand-maroon)] mt-2">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={item.question}
                  className={`rounded-xl border transition-all duration-300 ${isOpen ? 'border-[var(--brand-maroon)] bg-[#fffdfa]' : 'border-[var(--brand-border)] bg-white'}`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq((prev) => (prev === index ? -1 : index))}
                    className="w-full flex items-center justify-between gap-4 text-left px-4 sm:px-5 py-4"
                  >
                    <span className="text-sm sm:text-base font-semibold text-[var(--brand-text)]">
                      Q. {item.question}
                    </span>
                    <span
                      className={`shrink-0 h-7 w-7 rounded-full border flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        isOpen
                          ? 'border-[var(--brand-maroon)] text-[var(--brand-maroon)] rotate-45'
                          : 'border-[var(--brand-border)] text-[var(--brand-muted)]'
                      }`}
                    >
                      +
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-60'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-4 sm:px-5 pb-4 text-sm sm:text-base text-[var(--brand-muted)] leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cache Consent Banner - Shows only once */}
      <CacheConsent />
    </div>
  );
};

export default Home;   