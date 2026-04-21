import { useEffect, useMemo, useState } from 'react';
import { fetchHomeBanners, fetchPricingSettings, fetchSarees } from '../services/api';
import { useCart } from '../context/CartContext';
import CacheConsent from '../components/CacheConsent';
import Hero from '../components/Hero';
import LuxuryGenderSection from '../components/luxury/LuxuryGenderSection';
import LuxuryNewsletterSection from '../components/luxury/LuxuryNewsletterSection';
import LuxuryNotesSection from '../components/luxury/LuxuryNotesSection';
import LuxuryProductGridSection from '../components/luxury/LuxuryProductGridSection';
import LuxuryPromiseSection from '../components/luxury/LuxuryPromiseSection';
import LuxuryTestimonialsSection from '../components/luxury/LuxuryTestimonialsSection';

const testimonialItems = [
  {
    author: 'Rahul M., Mumbai',
    quote:
      "Arova Noir is everything I've been searching for. Deep, rich, and it lasts through the entire day.",
    rating: 5,
  },
  {
    author: 'Priya S., Pune',
    quote:
      "Finally a perfume that feels premium and stays gentle on sensitive skin. Rose Nuit is divine.",
    rating: 5,
  },
  {
    author: 'Kavya R., Nagpur',
    quote:
      'The packaging, scent profile and longevity feel truly luxe. AROVA stands out from the crowd.',
    rating: 5,
  },
];

const promiseItems = [
  'Clean & conscious formulations',
  'Long-lasting fragrances',
  'Designed for everyday use',
  'Premium feel, accessible pricing',
];

const noteTiers = [
  { label: 'Top Notes', notes: 'Bergamot, Neroli, Citrus' },
  { label: 'Heart Notes', notes: 'Rose, Jasmine, Vetiver' },
  { label: 'Base Notes', notes: 'Sandalwood, Amber, Musk' },
];

const genderCards = [
  {
    label: 'For Him',
    title: 'Bold. Grounded. Unforgettable.',
    description:
      'Deep woods, dark earth and raw strength for the man who commands presence without saying a word.',
    to: '/category/men',
    cta: "Shop Men's",
    letter: 'H',
    variant: 'dark',
  },
  {
    label: 'For Her',
    title: 'Soft. Radiant. Eternal.',
    description:
      'Blooming florals, warm spice and silken musk for the woman who carries grace like a second skin.',
    to: '/category/women',
    cta: "Shop Women's",
    letter: 'H',
    variant: 'light',
  },
];

const faqItems = [
  {
    question: 'Q. Are Arova perfumes long-lasting?',
    answer:
      'Yes, our perfumes are crafted to last throughout your day while remaining subtle and pleasant.',
  },
  {
    question: 'Q. Are these perfumes suitable for daily use?',
    answer: 'Absolutely. Arova is designed as a luxury + daily wear perfume brand.',
  },
  {
    question: 'Q. Are your perfumes clean?',
    answer: 'Yes, we focus on clean and thoughtfully crafted formulations.',
  },
  {
    question: 'Q. Do you offer returns?',
    answer: 'Please refer to our Return Policy for details.',
  },
];

const Home = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [lowStockThreshold, setLowStockThreshold] = useState(8);
  const [homeBanners, setHomeBanners] = useState({
    desktopBanners: [
      'https://res.cloudinary.com/dnyp5jknp/image/upload/v1776680296/Untitled_design_18_eaxeiv.png',
    ],
    mobileBanners: [
      'https://res.cloudinary.com/dnyp5jknp/image/upload/v1776237003/Beige_and_Green_Simple_Luxury_Perfume_Instagram_Post_600_x_600_px_s9auqi.svg',
    ],
  });
  const [desktopBannerIndex, setDesktopBannerIndex] = useState(0);
  const [mobileBannerIndex, setMobileBannerIndex] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      try {
        const [productsRes, pricing, banners] = await Promise.all([
          fetchSarees('', { limit: 12 }),
          fetchPricingSettings(),
          fetchHomeBanners(),
        ]);

        const products = Array.isArray(productsRes) ? productsRes : productsRes?.products || [];
        if (!ignore) {
          setAllProducts(products.slice(0, 6));
          if (typeof pricing?.lowStockThreshold === 'number') {
            setLowStockThreshold(pricing.lowStockThreshold);
          }
          if (banners?.desktopBanners || banners?.mobileBanners || banners?.desktopSrc || banners?.mobileSrc) {
            setHomeBanners({
              desktopBanners:
                banners.desktopBanners?.length > 0
                  ? banners.desktopBanners
                  : banners.desktopSrc
                  ? [banners.desktopSrc]
                  : homeBanners.desktopBanners,
              mobileBanners:
                banners.mobileBanners?.length > 0
                  ? banners.mobileBanners
                  : banners.mobileSrc
                  ? [banners.mobileSrc]
                  : homeBanners.mobileBanners,
            });
          }
        }
      } catch {
        if (!ignore) {
          setAllProducts([]);
        }
      }
    };

    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const length = homeBanners.desktopBanners.length;
    if (length <= 1) return;
    const timer = setInterval(() => {
      setDesktopBannerIndex((prev) => (prev + 1) % length);
    }, 4000);
    return () => clearInterval(timer);
  }, [homeBanners.desktopBanners]);

  useEffect(() => {
    const length = homeBanners.mobileBanners.length;
    if (length <= 1) return;
    const timer = setInterval(() => {
      setMobileBannerIndex((prev) => (prev + 1) % length);
    }, 4000);
    return () => clearInterval(timer);
  }, [homeBanners.mobileBanners]);

  useEffect(() => {
    if (desktopBannerIndex >= homeBanners.desktopBanners.length) {
      setDesktopBannerIndex(0);
    }
  }, [desktopBannerIndex, homeBanners.desktopBanners.length]);

  useEffect(() => {
    if (mobileBannerIndex >= homeBanners.mobileBanners.length) {
      setMobileBannerIndex(0);
    }
  }, [mobileBannerIndex, homeBanners.mobileBanners.length]);

  const collectionProducts = useMemo(() => allProducts.slice(0, 6), [allProducts]);

  const handleAddToCart = async (product) => {
    await addToCart(product, 1, null);
  };

  const handleNewsletterSubmit = async () => Promise.resolve();
  const desktopSlidesCount = homeBanners.desktopBanners.length;
  const goToPrevDesktopBanner = () => {
    if (desktopSlidesCount <= 1) return;
    setDesktopBannerIndex((prev) => (prev - 1 + desktopSlidesCount) % desktopSlidesCount);
  };
  const goToNextDesktopBanner = () => {
    if (desktopSlidesCount <= 1) return;
    setDesktopBannerIndex((prev) => (prev + 1) % desktopSlidesCount);
  };

  return (
    <div className="relative overflow-hidden bg-[var(--luxury-cream)] text-[var(--luxury-brown)]">
      <div className="luxury-grain pointer-events-none fixed inset-0 z-[1]" />
      <div className="relative z-[2] pt-16 sm:pt-20">
        <section
          aria-label="Arova desktop hero banner"
          className="relative hidden overflow-hidden border-b border-[var(--luxury-gold)]/20 bg-[#120908] lg:block"
        >
          <div className="mx-auto w-full max-w-[1920px] overflow-hidden">
            <div
              className="flex w-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${desktopBannerIndex * 100}%)` }}
            >
              {homeBanners.desktopBanners.map((banner, idx) => (
                <img
                  key={`desktop-banner-${idx}`}
                  src={banner}
                  alt={`Arova luxury fragrance desktop banner ${idx + 1}`}
                  className="h-auto w-full shrink-0 basis-full object-cover"
                />
              ))}
            </div>
          </div>
          {desktopSlidesCount > 1 ? (
            <>
              <button
                type="button"
                onClick={goToPrevDesktopBanner}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/45 p-2.5 text-white transition hover:bg-black/65"
                aria-label="Previous desktop banner"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goToNextDesktopBanner}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/45 p-2.5 text-white transition hover:bg-black/65"
                aria-label="Next desktop banner"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          ) : null}
        </section>

        <section
          aria-label="Arova mobile hero banner"
          className="overflow-hidden border-b border-[var(--luxury-gold)]/20 bg-[#120908] lg:hidden"
        >
          <div className="overflow-hidden">
            <div
              className="flex w-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${mobileBannerIndex * 100}%)` }}
            >
              {homeBanners.mobileBanners.map((banner, idx) => (
                <img
                  key={`mobile-banner-${idx}`}
                  src={banner}
                  alt={`Arova luxury fragrance mobile banner ${idx + 1}`}
                  className="h-auto w-full shrink-0 basis-full object-cover"
                />
              ))}
            </div>
          </div>
        </section>

        <LuxuryProductGridSection
          id="collections"
          label="Our Collection"
          title="Scents that"
          accent="Speak"
          description="A curated edit of signature fragrances designed for modern luxury, memorable layering and effortless daily wear."
          products={collectionProducts}
          cta={{ label: 'Shop All Fragrances', to: '/products' }}
          onAddToCart={handleAddToCart}
          lowStockThreshold={lowStockThreshold}
        />

        <LuxuryGenderSection items={genderCards} />

        <Hero />

        <LuxuryPromiseSection items={promiseItems} />

        <LuxuryNotesSection tiers={noteTiers} cta={{ label: 'Shop All Fragrances', to: '/products' }} />

        <LuxuryTestimonialsSection items={testimonialItems} />

        <section className="px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className="font-[var(--font-cinzel)] text-[10px] uppercase tracking-[0.32em] text-[var(--luxury-gold-dark)]">
                FAQ
              </p>
            </div>
            <div className="mt-10 space-y-5">
              {faqItems.map((item) => (
                <div key={item.question} className="border-b border-[var(--luxury-gold)]/20 pb-5">
                  <h3 className="font-[var(--font-cormorant)] text-3xl font-semibold text-[var(--luxury-brown)]">
                    {item.question}
                  </h3>
                  <p className="mt-2 font-[var(--font-jost)] text-sm leading-7 text-[var(--luxury-brown-mid)] sm:text-[15px]">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <LuxuryNewsletterSection onSubmit={handleNewsletterSubmit} />

        <CacheConsent />
      </div>
    </div>
  );
};

export default Home;