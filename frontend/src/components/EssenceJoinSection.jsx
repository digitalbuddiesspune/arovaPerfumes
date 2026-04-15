import React from 'react';

const EssenceJoinSection = () => {
  return (
    <section className="w-full bg-[#2b0d0d]">
      <div className="mx-auto max-w-7xl px-4 py-10 text-center sm:px-6 sm:py-12 lg:px-8">
        <h2 className="text-4xl leading-tight text-[#f4e8e2] sm:text-5xl [font-family:Georgia,serif]">
          The Essence
          <br />
          of <span className="italic text-[#d8be97]">Exclusivity</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-[#d3b9b0] sm:text-base">
          Join the AROVA circle. Be the first to discover new scents, offers and stories.
        </p>

        <form className="mx-auto mt-7 flex w-full max-w-xl overflow-hidden rounded-none border border-[#8b6b5f] bg-[#3a1717]">
          <input
            type="email"
            placeholder="your@email.com"
            className="h-11 w-full bg-transparent px-4 text-sm text-[#f0ddd7] placeholder:text-[#b58f85] focus:outline-none"
          />
          <button
            type="button"
            className="h-11 min-w-[120px] bg-[#d8be97] px-6 text-xs font-semibold tracking-[0.2em] text-[#2b0d0d] transition-colors hover:bg-[#e4cfb0]"
          >
            JOIN
          </button>
        </form>
      </div>
    </section>
  );
};

export default EssenceJoinSection;
