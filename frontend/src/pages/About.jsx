const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-light tracking-widest mb-6 text-gray-900">
            ABOUT US
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mb-8"></div>
          <p className="text-lg text-gray-600 italic">Arova - From Earth to Essence</p>
        </div>

        <div className="max-w-4xl mx-auto mb-20">
          <div className="text-center mb-10">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Arova is a clean perfume brand by Atraya Lifestyle Private Limited, established in 2024 and proudly founded by a woman entrepreneur from Nagpur.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Built on the belief that fragrance should be both luxurious and wearable every day, Arova bridges the gap between premium quality and daily lifestyle. We are not just a luxury perfume brand, we are luxury made accessible, designed for those who want to feel confident, elegant, and expressive, every single day.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              From Earth to Essence - this is not just our tagline, it is our philosophy. We focus on creating clean, thoughtfully crafted fragrances that are rooted in purity, inspired by nature, and elevated into refined, modern scents.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mb-20 text-center bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100 rounded-lg p-12 shadow-lg">
          <h2 className="text-3xl font-light tracking-wider mb-6 text-gray-900">
            OUR PHILOSOPHY
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            At Arova, perfume is more than a product, it is a personal signature. Whether it is your daily routine or a special moment, our fragrances are designed to stay with you, leaving a lasting impression without being overwhelming.
          </p>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-light tracking-wider mb-12 text-gray-900 text-center">
            EVERY BOTTLE REFLECTS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4 p-6 bg-white border-2 border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-3xl text-amber-600">🌿</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Clean Formulation</h3>
                <p className="text-gray-700 leading-relaxed">
                  Thoughtfully created formulas that prioritize purity and daily comfort.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-white border-2 border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-3xl text-amber-600">⏳</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Long-Lasting Performance</h3>
                <p className="text-gray-700 leading-relaxed">
                  Crafted to accompany you throughout your day with a subtle, elegant trail.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-white border-2 border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-3xl text-amber-600">✨</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Effortless Sophistication</h3>
                <p className="text-gray-700 leading-relaxed">
                  Refined modern scents designed for confidence, elegance, and expression.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-light tracking-wider mb-8 text-gray-900">
            EVERYDAY LUXURY, EVERYDAY YOU
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            We are building more than a brand - we are creating an experience where everyday luxury becomes a habit, not an occasion.
          </p>
          <p className="text-xl font-light text-amber-700 italic tracking-wide">
            Arova
            <br />
            From Earth to Essence.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;