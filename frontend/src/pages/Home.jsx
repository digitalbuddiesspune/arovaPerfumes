import { useEffect, useMemo, useState } from 'react';
import { fetchPricingSettings, fetchSarees } from '../services/api';
import { useCart } from '../context/CartContext';
import CacheConsent from '../components/CacheConsent';
import Hero from '../components/Hero';
import LuxuryGenderSection from '../components/luxury/LuxuryGenderSection';
import LuxuryMarqueeSection from '../components/luxury/LuxuryMarqueeSection';
import LuxuryNewsletterSection from '../components/luxury/LuxuryNewsletterSection';
import LuxuryNotesSection from '../components/luxury/LuxuryNotesSection';
import LuxuryProductGridSection from '../components/luxury/LuxuryProductGridSection';
import LuxuryPromiseSection from '../components/luxury/LuxuryPromiseSection';
import LuxuryStorySection from '../components/luxury/LuxuryStorySection';
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
  { label: 'Top Notes', notes: 'Bergamot, Neroli, Citrus', icon: '🍋' },
  { label: 'Heart Notes', notes: 'Rose, Jasmine, Vetiver', icon: '🌹' },
  { label: 'Base Notes', notes: 'Sandalwood, Amber, Musk', icon: '🪵' },
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

const Home = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [lowStockThreshold, setLowStockThreshold] = useState(8);
  const [announcementMarquee, setAnnouncementMarquee] = useState(
    '1st Order - 50% Off ✦ Use Code SMELLGOOD5 for extra 5% off on prepaid orders ✦'
  );
  const { addToCart } = useCart();

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      try {
        const [productsRes, pricing] = await Promise.all([
          fetchSarees('', { limit: 12 }),
          fetchPricingSettings(),
        ]);

        const products = Array.isArray(productsRes) ? productsRes : productsRes?.products || [];
        if (!ignore) {
          setAllProducts(products.slice(0, 6));
          if (typeof pricing?.lowStockThreshold === 'number') {
            setLowStockThreshold(pricing.lowStockThreshold);
          }
          if (pricing?.announcementMarquee && String(pricing.announcementMarquee).trim()) {
            setAnnouncementMarquee(String(pricing.announcementMarquee).trim());
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

  const collectionProducts = useMemo(() => allProducts.slice(0, 6), [allProducts]);

  const handleAddToCart = async (product) => {
    await addToCart(product, 1, null);
  };

  const handleNewsletterSubmit = async () => Promise.resolve();

  return (
    <div className="relative overflow-hidden bg-[var(--luxury-cream)] text-[var(--luxury-brown)]">
      <div className="luxury-grain pointer-events-none fixed inset-0 z-[1]" />
      <div className="relative z-[2]">
        <Hero />

        <LuxuryMarqueeSection
          items={[
            'Ethanol-Based Formula',
            'Long Lasting',
            'Skin Friendly',
            'Fragrant Note x Secret Blend',
            'Clean Perfumery',
            'For Him & Her',
          ]}
        />
        <section className="hidden overflow-hidden border-b border-[var(--luxury-gold)]/25 bg-[var(--luxury-brown)] py-1 sm:py-1.5 lg:block">
          <div className="luxury-marquee-track flex min-w-max items-center whitespace-nowrap">
            {[0, 1, 2].map((idx) => (
              <span
                key={idx}
                className="px-6 font-[var(--font-cinzel)] text-[9px] uppercase tracking-[0.2em] text-[var(--luxury-gold)] sm:text-[10px]"
              >
                {announcementMarquee}
              </span>
            ))}
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

        <LuxuryStorySection
          quote="Perfume is the most intimate expression of who you are."
          description="AROVA was born from the belief that luxury and consciousness can coexist. Each fragrance is crafted to linger beautifully, tell your story and honour the earth it comes from."
          founder={{
            initials: 'SP',
            name: 'Samiksha Paliwal',
            title: 'Founder, AROVA',
            photo: 'https://ui-avatars.com/api/?name=Samiksha+Paliwal&background=2c1008&color=C9A96E&size=200',
          }}
        />

        <LuxuryPromiseSection items={promiseItems} />

        <LuxuryNotesSection tiers={noteTiers} cta={{ label: 'Shop All Fragrances', to: '/products' }} />

        <LuxuryTestimonialsSection items={testimonialItems} />

        <LuxuryNewsletterSection onSubmit={handleNewsletterSubmit} />

        <CacheConsent />
      </div>
    </div>
  );
};

export default Home;