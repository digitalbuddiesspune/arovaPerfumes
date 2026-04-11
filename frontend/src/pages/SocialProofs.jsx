const testimonials = [
  {
    quote: 'Long-lasting and exactly the notes described. My go-to for evenings out.',
    author: 'Priya M.',
    detail: 'Verified buyer',
  },
  {
    quote: 'Packaging felt premium and delivery was quick. Already ordered a second bottle.',
    author: 'Rahul K.',
    detail: 'Mumbai',
  },
  {
    quote: 'Subtle, not overpowering — I get compliments every time I wear it.',
    author: 'Ananya S.',
    detail: 'Verified buyer',
  },
];

const SocialProofs = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-3xl md:text-4xl font-light tracking-widest text-gray-900 text-center mb-4">
          Social Proofs
        </h1>
        <p className="text-center text-gray-600 mb-14 max-w-2xl mx-auto">
          What customers say about ArovaPerfume — real feedback from people who wear our fragrances.
        </p>
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <blockquote
              key={t.author}
              className="border border-gray-200 rounded-lg p-6 shadow-sm bg-gray-50/50"
            >
              <p className="text-gray-800 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
              <footer className="text-sm">
                <cite className="not-italic font-semibold text-gray-900">{t.author}</cite>
                <span className="text-gray-500 block mt-0.5">{t.detail}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialProofs;
