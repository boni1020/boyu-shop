import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { ArrowRight } from 'lucide-react';

interface ProductSectionProps {
  title: string;
  products: Product[];
  onMoreClick: () => void;
  onSelectProduct: (product: Product) => void;
  sectionId?: string;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  title,
  products,
  onMoreClick,
  onSelectProduct,
  sectionId,
}) => {
  // Ensure we display up to 5 products
  const displayProducts = products.slice(0, 5);

  // If there are no products, do not render the section at all
  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <section
      id={sectionId}
      className="py-6 sm:py-8 border-b border-[#263B3F]/8 last:border-b-0"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header: Left title, Right '看更多' */}
        <div className="flex items-center justify-between gap-4 mb-4 sm:mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-[#263B3F] tracking-tight">
            {title}
          </h2>

          <button
            type="button"
            onClick={onMoreClick}
            className="group inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-[#438DB8] hover:text-[#263B3F] transition-colors cursor-pointer py-1 px-1.5 rounded-md hover:bg-[#438DB8]/5"
            aria-label={`${title} - 看更多`}
          >
            <span>看更多</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Product Cards Grid: 2 on mobile, 4 on tablet (md), 5 on desktop (lg) */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-4.5">
          {displayProducts.map((product, index) => {
            let itemVisibility = 'block';
            if (index >= 4) {
              // 5th item: desktop only
              itemVisibility = 'hidden lg:block';
            } else if (index >= 2) {
              // 3rd & 4th items: tablet and desktop only
              itemVisibility = 'hidden md:block';
            }

            return (
              <div key={product.id} className={`h-full ${itemVisibility}`}>
                <ProductCard
                  product={product}
                  onSelect={() => onSelectProduct(product)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
