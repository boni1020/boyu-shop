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
  isMobileDrawer = false,
}) => {
  return (
    <div className={`flex flex-col ${isMobileDrawer ? 'w-full' : 'w-full'}`}>
      {/* Filter Header: Clean "品牌" */}
      <div className="flex items-center gap-2 pb-3.5 mb-3 border-b border-[#263B3F]/12">
        <Layers className="w-4 h-4 text-[#2B8D9C]" />
        <h2 className="text-sm font-semibold text-[#263B3F] tracking-wide">
          品牌
        </h2>
      </div>

      {/* Brand List without any counts */}
      <div className="flex flex-col gap-1">
        {/* "全部" (All Brands) Option */}
        <button
          type="button"
          id="brand-filter-all"
          onClick={() => onSelectBrand('all')}
          className={`group flex items-center justify-between w-full px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 text-left cursor-pointer ${
            selectedBrand === 'all'
              ? 'bg-[#438DB8] text-white font-medium shadow-sm'
              : 'text-[#263B3F]/80 hover:bg-[#263B3F]/6 hover:text-[#263B3F]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2 h-2 rounded-full transition-all ${
                selectedBrand === 'all'
                  ? 'bg-white scale-110'
                  : 'bg-[#263B3F]/25 group-hover:bg-[#438DB8]'
              }`}
            />
            <span>全部</span>
          </div>
          {selectedBrand === 'all' && <Check className="w-3.5 h-3.5 text-white/90" />}
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
              className={`group flex items-center justify-between w-full px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 text-left cursor-pointer ${
                isSelected
                  ? 'bg-[#438DB8] text-white font-medium shadow-sm'
                  : 'text-[#263B3F]/80 hover:bg-[#263B3F]/6 hover:text-[#263B3F]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2 h-2 rounded-full transition-all ${
                    isSelected
                      ? 'bg-white scale-110'
                      : 'bg-[#263B3F]/25 group-hover:bg-[#438DB8]'
                  }`}
                />
                <span className="tracking-wide">{b.name}</span>
              </div>

              {isSelected && <Check className="w-3.5 h-3.5 text-white/90" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

