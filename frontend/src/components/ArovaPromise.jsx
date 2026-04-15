import React, { useEffect, useRef, useState } from 'react';

const promisePoints = [
  'Clean & conscious formulations',
  'Long-lasting fragrances',
  'Designed for everyday use',
  'Premium feel, accessible pricing',
];

const ArovaPromise = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`w-full transform transition-all duration-700 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      <div className="overflow-hidden bg-gradient-to-br from-[#2b0d0d] via-[#3a1212] to-[#1e0808] py-10 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-[#d9beb3]">The Arova Promise</p>
            <h2 className="mt-3 text-4xl sm:text-5xl font-medium text-[#fff3ed] [font-family:Georgia,serif]">Why Arova</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-[#e3cbc2]">
              Crafted for modern fragrance lovers who want clean luxury every day.
            </p>
          </div>

          <div className="mt-8 border-y border-white/15">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {promisePoints.map((point, index) => (
                <div
                  key={point}
                  className="group flex items-center gap-3 border-b border-white/10 px-4 py-5 sm:px-5 lg:border-b-0 lg:border-r lg:border-white/10 last:lg:border-r-0"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#c8a397]/70 bg-white/5 text-xs font-semibold text-[#f7e2da]">
                    {index + 1}
                  </span>
                  <p className="text-sm sm:text-[15px] font-medium leading-relaxed text-[#f0d8cf] transition-colors duration-200 group-hover:text-white">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArovaPromise;
