import React from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const ProductFilters = ({
  priceRanges,
  selectedPriceRange,
  setSelectedPriceRange,
  customMinPrice,
  customMaxPrice,
  setCustomMinPrice,
  setCustomMaxPrice,
  openSections,
  toggleSection,
  activeFilterCount,
  resetFilters
}) => {
  const handleReset = () => {
    resetFilters();
  };

  return (
    <div className="space-y-6">
      {/* Reset Button */}
      {activeFilterCount > 0 && (
        <div className="pb-4 border-b border-gray-200">
          <button 
            onClick={handleReset}
            className="text-sm text-amber-700 hover:text-amber-800 font-medium transition-colors w-full text-center py-2 border border-amber-700 rounded-md"
          >
            Reset
          </button>
        </div>
      )}

      {/* Price Range Filter */}
      <div className="pt-4">
        <button
          onClick={() => toggleSection('price')}
          className="flex justify-between items-center w-full mb-3 group"
        >
          <h4 className="text-sm font-bold text-gray-900 group-hover:text-amber-700 transition-colors">PRICE</h4>
          {openSections.price ? <FaChevronUp className="text-gray-500 w-3 h-3" /> : <FaChevronDown className="text-gray-500 w-3 h-3" />}
        </button>
        
        {openSections.price && (
          <div className="space-y-2">
            {priceRanges.map(range => (
              <div key={range.id} className="flex items-center">
                <input
                  type="radio"
                  id={`price-${range.id}`}
                  name="priceRange"
                  checked={selectedPriceRange === range.id}
                  onChange={() => {
                    setSelectedPriceRange(range.id);
                    setCustomMinPrice('');
                    setCustomMaxPrice('');
                  }}
                  className="h-4 w-4 text-red-800 focus:ring-red-700 border-gray-300 cursor-pointer checked:bg-red-800"
                  style={{ accentColor: '#7A2A2A' }}
                />
                <label htmlFor={`price-${range.id}`} className="ml-3 text-sm text-gray-700 cursor-pointer">
                  {range.label}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* FABRIC/MATERIAL filter removed as requested */}

    </div>
  );
};

export default React.memo(ProductFilters);

