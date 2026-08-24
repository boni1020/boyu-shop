import React from 'react';
import { BrandStats } from '../types';
import { Layers, Check } from 'lucide-react';

interface BrandFilterProps {
  brands: BrandStats[];
  selectedBrand: string; // 'all' or brand name
  totalCategoryCount?: number;
  onSelectBrand: (brandName: string) => void;
  categoryName?: string;
  isMobileDrawer?: boolean;
}

export const BrandFilter: React.FC<BrandFilterProps> = ({
  brands,
  selectedBrand,
  onSelectBrand,
}) => {
  return (
    <div className="flex flex-col w-full">
      {/* Filter Header: Clean "品牌" */}
      <div className="flex items-center gap-1.5 sm:gap-2 pb-2.5 sm:pb-3.5 mb-2 sm:mb-3 border-b border-[#263B3F]/12">
        <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2B8D9C]" />
        <h2 className="text-xs sm:text-sm font-semibold text-[#263B3F] tracking-wide">
          品牌
        </h2>
      </div>

      {/* Brand List */}
      <div className="flex flex-col gap-0.5 sm:gap-1">
        {/* "全部" (All Brands) Option */}
        <button
          type="button"
          id="brand-filter-all"
          onClick={() => onSelectBrand('all')}
          className={`group flex items-center justify-between w-full px-2 sm:px-3.5 py-1.5 sm:py-2.5 rounded-lg text-xs sm:text-sm transition-all duration-200 text-left cursor-pointer ${
            selectedBrand === 'all'
              ? 'bg-[#438DB8] text-white font-medium shadow-sm'
              : 'text-[#263B3F]/80 hover:bg-[#263B3F]/6 hover:text-[#263B3F]'
          }`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <span
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 shrink-0 rounded-full transition-all ${
                selectedBrand === 'all'
                  ? 'bg-white scale-110'
                  : 'bg-[#263B3F]/25 group-hover:bg-[#438DB8]'
              }`}
            />
            <span className="truncate">全部</span>
          </div>
          {selectedBrand === 'all' && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-white/90" />}
        </button>

        {/* Dynamic Brand List derived from category data */}
        {brands.map((b) => {
          const isSelected = selectedBrand.toLowerCase() === b.name.toLowerCase();
          return (
            <button
              key={b.name}
              type="button"
              id={`brand-filter-${b.name.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onSelectBrand(b.name)}
              className={`group flex items-center justify-between w-full px-2 sm:px-3.5 py-1.5 sm:py-2.5 rounded-lg text-xs sm:text-sm transition-all duration-200 text-left cursor-pointer ${
                isSelected
                  ? 'bg-[#438DB8] text-white font-medium shadow-sm'
                  : 'text-[#263B3F]/80 hover:bg-[#263B3F]/6 hover:text-[#263B3F]'
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                <span
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 shrink-0 rounded-full transition-all ${
                    isSelected
                      ? 'bg-white scale-110'
                      : 'bg-[#263B3F]/25 group-hover:bg-[#438DB8]'
                  }`}
                />
                <span className="tracking-wide truncate">{b.name}</span>
              </div>

              {isSelected && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-white/90" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

