import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Category, Product, CategoryId } from '../types';
import { BrandFilter } from './BrandFilter';
import { ProductCard } from './ProductCard';
import { getBrandsForCategory, filterProducts, matchesCategory } from '../utils/filterUtils';
import { ArrowUpDown, ShoppingCart, ChevronDown, ChevronUp, Check } from 'lucide-react';

interface CategoryLayoutProps {
  category: Category;
  allProducts: Product[];
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  onSelectProduct: (product: Product) => void;
  onNavigateHome: () => void;
  onSelectCategory: (catId: CategoryId) => void;
}

const SORT_OPTIONS: { value: 'featured' | 'price-asc' | 'price-desc' | 'newest'; label: string }[] = [
  { value: 'featured', label: '推薦排序' },
  { value: 'price-asc', label: '價格：低至高' },
  { value: 'price-desc', label: '價格：高至低' },
  { value: 'newest', label: '新品優先' },
];

export const CategoryLayout: React.FC<CategoryLayoutProps> = ({
  category,
  allProducts,
  selectedBrand,
  onSelectBrand,
  onSelectProduct,
  onNavigateHome,
}) => {
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [isMobileBrandOpen, setIsMobileBrandOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);
  const brandPopoverRef = useRef<HTMLDivElement>(null);
  const sortPopoverRef = useRef<HTMLDivElement>(null);

  // Close brand and sort popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (brandPopoverRef.current && !brandPopoverRef.current.contains(target)) {
        setIsMobileBrandOpen(false);
      }
      if (sortPopoverRef.current && !sortPopoverRef.current.contains(target)) {
        setIsMobileSortOpen(false);
      }
    };
    if (isMobileBrandOpen || isMobileSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileBrandOpen, isMobileSortOpen]);

  // 1. Calculate brands dynamically for this specific category
  const dynamicBrands = useMemo(() => {
    return getBrandsForCategory(allProducts, category);
  }, [allProducts, category]);

  // 2. Filter products: category AND brand == selectedBrand (if !== 'all')
  const filteredProducts = useMemo(() => {
    return filterProducts(allProducts, {
      category,
      categoryId: category.id,
      brand: selectedBrand,
      sortBy,
    });
  }, [allProducts, category, selectedBrand, sortBy]);

  return (
    <div className="w-full pb-20">
      {/* Main Content Area: Left Sidebar (Brand + Sort for Desktop) & Right Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Column: Sticky Brand Filter + Sort Sidebar (Desktop only, lg:block) */}
          <div className="hidden lg:block lg:w-64 shrink-0">
            <div className="sticky top-28 bg-white/70 backdrop-blur-xs p-4 lg:p-5 rounded-xl sm:rounded-2xl border border-[#263B3F]/10 shadow-[0_2px_16px_rgba(38,59,63,0.03)]">
              {/* 1. Sort Control in the Left Sidebar (排序移到最上方) */}
              <div className="pb-4 mb-4 border-b border-[#263B3F]/12">
                <div className="flex items-center gap-1.5 mb-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#2B8D9C]" />
                  <span className="text-xs sm:text-sm font-semibold text-[#263B3F] tracking-wide">
                    排序
                  </span>
                </div>
                <select
                  id="sort-select"
                  aria-label="排序商品"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-white border border-[#263B3F]/15 rounded-lg px-2.5 py-1.5 text-xs text-[#263B3F] font-medium focus:ring-2 focus:ring-[#438DB8]/30 focus:border-[#438DB8] outline-hidden cursor-pointer"
                >
                  <option value="featured">推薦排序</option>
                  <option value="price-asc">價格：低至高</option>
                  <option value="price-desc">價格：高至低</option>
                  <option value="newest">新品優先</option>
                </select>
              </div>

              {/* 2. BrandFilter (品牌移到排序下方) */}
              <BrandFilter
                brands={dynamicBrands}
                selectedBrand={selectedBrand}
                onSelectBrand={onSelectBrand}
              />
            </div>
          </div>

          {/* Right Column: Product Grid */}
          <div className="flex-1 min-w-0">
            {/* Mobile & Tablet: Sort & Brand Filter Popover Row (< lg) */}
            <div className="block lg:hidden relative mb-4 sm:mb-6 z-30">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* 1. Sort Toggle Button & Popover (排序在左/前) */}
                <div ref={sortPopoverRef} className="flex-1 relative">
                  <button
                    type="button"
                    id="btn-mobile-sort-accordion"
                    onClick={() => {
                      setIsMobileBrandOpen(false);
                      setIsMobileSortOpen((prev) => !prev);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer ${
                      isMobileSortOpen
                        ? 'border-[#438DB8] text-[#438DB8] ring-2 ring-[#438DB8]/20'
                        : 'border-[#263B3F]/15 text-[#263B3F] hover:bg-[#263B3F]/3'
                    }`}
                    aria-expanded={isMobileSortOpen}
                  >
                    <span className="truncate">
                      {sortBy === 'featured' ? '排序' : (SORT_OPTIONS.find((o) => o.value === sortBy)?.label || '排序')}
                    </span>
                    {isMobileSortOpen ? (
                      <ChevronUp className="w-4 h-4 shrink-0 ml-1.5 text-[#438DB8]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 shrink-0 ml-1.5 text-[#263B3F]/60" />
                    )}
                  </button>

                  {/* Mobile & Tablet Sort Popover */}
                  {isMobileSortOpen && (
                    <div
                      id="mobile-sort-accordion-content"
                      className="absolute left-0 top-full mt-2 w-full sm:w-72 max-w-[calc(100vw-2rem)] bg-white border border-[#263B3F]/15 rounded-xl shadow-2xl z-50 p-3.5"
                      style={{ backgroundColor: '#ffffff' }}
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#263B3F]/10">
                        <span className="text-xs font-semibold text-[#263B3F]/75">
                          商品排序
                        </span>
                        {sortBy !== 'featured' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSortBy('featured');
                              setIsMobileSortOpen(false);
                            }}
                            className="text-xs text-[#438DB8] font-medium hover:underline cursor-pointer"
                          >
                            恢復預設
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col gap-1 pr-1">
                        {SORT_OPTIONS.map((opt) => {
                          const isSelected = sortBy === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              id={`mobile-sort-option-${opt.value}`}
                              onClick={() => {
                                setSortBy(opt.value);
                                setIsMobileSortOpen(false);
                              }}
                              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-xs sm:text-sm transition-colors text-left cursor-pointer ${
                                isSelected
                                  ? 'bg-[#438DB8]/10 text-[#438DB8] font-semibold'
                                  : 'text-[#263B3F]/85 hover:bg-[#263B3F]/5'
                              }`}
                            >
                              <span className="truncate">{opt.label}</span>
                              {isSelected && (
                                <Check className="w-4 h-4 shrink-0 text-[#438DB8] stroke-[2.5] ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Brand Filter Toggle Button & Popover (品牌在右/後) */}
                <div ref={brandPopoverRef} className="flex-1 relative">
                  <button
                    type="button"
                    id="btn-mobile-brand-accordion"
                    onClick={() => {
                      setIsMobileSortOpen(false);
                      setIsMobileBrandOpen((prev) => !prev);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer ${
                      isMobileBrandOpen
                        ? 'border-[#438DB8] text-[#438DB8] ring-2 ring-[#438DB8]/20'
                        : 'border-[#263B3F]/15 text-[#263B3F] hover:bg-[#263B3F]/3'
                    }`}
                    aria-expanded={isMobileBrandOpen}
                  >
                    <span className="truncate">
                      {selectedBrand === 'all' ? '品牌篩選' : `品牌：${selectedBrand}`}
                    </span>
                    {isMobileBrandOpen ? (
                      <ChevronUp className="w-4 h-4 shrink-0 ml-1.5 text-[#438DB8]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 shrink-0 ml-1.5 text-[#263B3F]/60" />
                    )}
                  </button>

                  {/* Mobile & Tablet Brand Popover */}
                  {isMobileBrandOpen && (
                    <div
                      id="mobile-brand-accordion-content"
                      className="absolute right-0 top-full mt-2 w-full sm:w-80 max-w-[calc(100vw-2rem)] bg-white border border-[#263B3F]/15 rounded-xl shadow-2xl z-50 p-3.5"
                      style={{ backgroundColor: '#ffffff' }}
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#263B3F]/10">
                        <span className="text-xs font-semibold text-[#263B3F]/75">
                          品牌篩選
                        </span>
                        {selectedBrand !== 'all' && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectBrand('all');
                              setIsMobileBrandOpen(false);
                            }}
                            className="text-xs text-[#438DB8] font-medium hover:underline cursor-pointer"
                          >
                            顯示全部品牌
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col gap-1 max-h-64 sm:max-h-80 overflow-y-auto pr-1">
                        {/* 全部 */}
                        <button
                          type="button"
                          id="mobile-brand-option-all"
                          onClick={() => {
                            onSelectBrand('all');
                            setIsMobileBrandOpen(false);
                          }}
                          className={`flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs sm:text-sm transition-colors text-left cursor-pointer ${
                            selectedBrand === 'all'
                              ? 'bg-[#438DB8]/10 text-[#438DB8] font-semibold'
                              : 'text-[#263B3F]/85 hover:bg-[#263B3F]/5'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                                selectedBrand === 'all'
                                  ? 'bg-[#438DB8] border-[#438DB8] text-white'
                                  : 'border-[#263B3F]/35 bg-white'
                              }`}
                            >
                              {selectedBrand === 'all' && <Check className="w-3 h-3 stroke-[2.5]" />}
                            </div>
                            <span className="truncate">全部</span>
                          </div>
                        </button>

                        {/* 各品牌 */}
                        {dynamicBrands.map((b) => {
                          const isSelected = selectedBrand.toLowerCase() === b.name.toLowerCase();
                          return (
                            <button
                              key={b.name}
                              type="button"
                              id={`mobile-brand-option-${b.name.toLowerCase().replace(/\s+/g, '-')}`}
                              onClick={() => {
                                onSelectBrand(b.name);
                                setIsMobileBrandOpen(false);
                              }}
                              className={`flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs sm:text-sm transition-colors text-left cursor-pointer ${
                                isSelected
                                  ? 'bg-[#438DB8]/10 text-[#438DB8] font-semibold'
                                  : 'text-[#263B3F]/85 hover:bg-[#263B3F]/5'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                                    isSelected
                                      ? 'bg-[#438DB8] border-[#438DB8] text-white'
                                      : 'border-[#263B3F]/35 bg-white'
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                                </div>
                                <span className="truncate">{b.name}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={onSelectProduct}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="py-16 px-4 text-center bg-white/60 rounded-2xl border border-dashed border-[#263B3F]/20">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#438DB8]/10 text-[#438DB8] flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-[#263B3F] mb-6">
                  目前沒有「{category.name}」的商品
                </h3>
                <button
                  type="button"
                  id="btn-empty-navigate-home"
                  onClick={onNavigateHome}
                  className="px-5 py-2.5 bg-[#438DB8] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-[#438DB8]/90 transition-colors cursor-pointer"
                >
                  回首頁
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
