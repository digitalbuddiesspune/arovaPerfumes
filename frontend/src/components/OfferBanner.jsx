import React, { useEffect, useState } from 'react';
import { fetchPricingSettings } from '../services/api';

const FALLBACK =
  '🎉 FLAT 50% OFF ON ALL PERFUMES — LIMITED TIME! 💎 NEW ARRIVALS — SHOP NOW';

const OfferBanner = () => {
  const [offerText, setOfferText] = useState(FALLBACK);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const s = await fetchPricingSettings();
        const line = (s?.announcementMarquee && String(s.announcementMarquee).trim()) || FALLBACK;
        if (!ignore) setOfferText(line);
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="bg-black text-white py-1 md:py-1.5 px-4 relative z-[75] overflow-hidden">
      <div className="relative">
        {/* Scrolling offer text */}
        <div className="flex items-center">
          <div className="animate-scroll whitespace-nowrap">
            <span className="text-xs sm:text-sm md:text-base font-medium tracking-wide inline-block px-4">
              {offerText} • {offerText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferBanner;

