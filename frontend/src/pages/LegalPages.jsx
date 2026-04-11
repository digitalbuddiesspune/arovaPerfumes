import { Link } from 'react-router-dom';

const legalLinks = [
  { name: 'Privacy Policy', path: '/privacy' },
  { name: 'Terms of Service', path: '/terms' },
  { name: 'Shipping Policy', path: '/shipping' },
  { name: 'Delivery & Returns', path: '/returns' },
];

const LegalPages = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl md:text-4xl font-light tracking-widest text-gray-900 text-center mb-4">
          Legal Pages
        </h1>
        <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">
          Policies and terms for shopping with ArovaPerfume. Select a document below.
        </p>
        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          {legalLinks.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className="flex items-center justify-between px-5 py-4 text-gray-800 hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium">{item.name}</span>
                <span className="text-gray-400" aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LegalPages;
