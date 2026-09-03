import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { ArrowRight } from 'lucide-react';

interface ProductCarouselSectionProps {
  sectionId?: string;
  badgeIcon?: React.ReactNode;
  badgeText: string;
  title: string;
  subtitle: string;
  viewMoreText: string;
  onViewMore: () => void;
  products: Product[];
  isLoading: boolean;
  emptyText: string;
  onSelectProduct: (product: Product) => void;
  className?: string;
}

export const ProductCarouselSection: React.FC<ProductCarouselSectionProps> = ({
  sectionId = 'carousel-section',
  badgeIcon,
  badgeText,
  title,
  subtitle,
  viewMoreText,
  onViewMore,
  products,
  isLoading,
  emptyText,
  onSelectProduct,
  className = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16',
}) => {
  return (
    <section className={className}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 mb-6 sm:mb-8">
        <div className="w-full sm:w-auto">
          {/* Row 1: [Icon] Badge */}
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#438DB8] tracking-widest uppercase mb-1">
            {badgeIcon}
            <span>{badgeText}</span>
          </div>

          {/* Row 2: Mobile (Title on left, View More on right) | Desktop (Title) */}
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#263B3F] font-serif-brand">
              {title}
            </h2>
            {/* Mobile Right Link */}
            <button
              type="button"
              id={`btn-home-view-all-${sectionId}-mobile`}
              onClick={onViewMore}
              className="sm:hidden text-xs font-semibold text-[#438DB8] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>{viewMoreText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Row 3: Subtitle */}
          <p className="text-xs sm:text-sm text-[#263B3F]/70 mt-1">
            {subtitle}
          </p>
        </div>

        {/* Desktop Right Link */}
        <div className="hidden sm:flex items-center justify-end gap-3 self-auto">
          <button
            type="button"
            id={`btn-home-view-all-${sectionId}`}
            onClick={onViewMore}
            className="text-xs font-semibold text-[#438DB8] hover:underline flex items-center gap-1 self-auto cursor-pointer"
          >
            <span>{viewMoreText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && products.length === 0 ? (
        <div className="flex items-stretch overflow-x-auto no-scrollbar snap-x snap-mandatory gap-3.5 sm:gap-4 pb-4 pt-1 px-4 sm:px-6 -mx-4 sm:-mx-6 lg:grid lg:grid-cols-5 lg:gap-4 sm:lg:gap-5 lg:p-0 lg:m-0 lg:overflow-visible">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-[66vw] min-w-[210px] max-w-[260px] sm:w-[230px] shrink-0 snap-start self-stretch bg-white rounded-xl p-3 border border-[#263B3F]/10 animate-pulse lg:w-auto lg:min-w-0 lg:max-w-none lg:shrink lg:snap-align-none"
            >
              <div className="aspect-square bg-[#263B3F]/10 rounded-lg mb-3" />
              <div className="h-3 bg-[#263B3F]/10 rounded-sm w-2/3 mb-2" />
              <div className="h-4 bg-[#263B3F]/15 rounded-sm w-full mb-3" />
              <div className="h-4 bg-[#263B3F]/20 rounded-sm w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-12 text-center bg-white/60 border border-[#263B3F]/10 rounded-xl">
          <p className="text-[#263B3F]/70 text-sm">{emptyText}</p>
        </div>
      ) : (
        /* Products: Desktop 5 columns grid | Mobile Horizontal Swipe Carousel */
        <div
          className="flex items-stretch overflow-x-auto no-scrollbar snap-x snap-mandatory gap-3.5 sm:gap-4 pb-4 pt-1 px-4 sm:px-6 -mx-4 sm:-mx-6 scroll-smooth lg:grid lg:grid-cols-5 lg:gap-4 sm:lg:gap-5 lg:p-0 lg:m-0 lg:overflow-visible"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[66vw] min-w-[210px] max-w-[260px] sm:w-[230px] shrink-0 snap-start flex flex-col self-stretch lg:w-auto lg:min-w-0 lg:max-w-none lg:shrink lg:snap-align-none"
            >
              <ProductCard
                product={product}
                onSelect={onSelectProduct}
              />
            </div>
          ))}
          {/* Mobile end spacer for clean right margin scroll */}
          <div className="w-4 shrink-0 lg:hidden" aria-hidden="true" />
        </div>
      )}
    </section>
  );
};
