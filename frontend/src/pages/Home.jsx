import React from 'react';
import HeroSlider from '../components/HeroSlider';

// Import new components you'd need to create for a full landing page
import BestSellers from '../components/BestSellers';
import MensSection from '../components/MensSection';
import WomenSection from '../components/WomenSection';
import CacheConsent from '../components/CacheConsent';

const Home = () => {
  const heroBanner =
    'https://res.cloudinary.com/dzd47mpdo/image/upload/v1776088569/Untitled_design_8_vfoi7z.svg';

  // Mobile-only banner
  const mobileHeroBanner =
    'https://res.cloudinary.com/dzd47mpdo/image/upload/v1776088326/a498f118-1d74-43aa-87e9-ca88552e4a4c.png';


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

      {/* Cache Consent Banner - Shows only once */}
      <CacheConsent />
    </div>
  );
};

export default Home;   